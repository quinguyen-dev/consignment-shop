import { OAuthScope, StringAttribute } from "aws-cdk-lib/aws-cognito";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Role } from "aws-cdk-lib/aws-iam";
import {
  Api,
  Cognito,
  EventBus,
  Function,
  RemixSite,
  StackContext,
} from "sst/constructs";

export function API({ stack }: StackContext) {
  const lambdaVPC = ec2.Vpc.fromLookup(stack, "vpc-097dbaebc608e2ddd", {
    isDefault: true,
  });
  const lambdaSecGroup = ec2.SecurityGroup.fromSecurityGroupId(
    stack,
    "default",
    "sg-0aa657fe4799616db",
  );

  const lambdaRole = Role.fromRoleName(
    stack,
    "lambdaRole",
    "ExecuteLambdaCode",
  );

  stack.setDefaultFunctionProps({
    vpc: lambdaVPC,
    vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
    allowPublicSubnet: true,
    securityGroups: [lambdaSecGroup],
    role: lambdaRole,
  });

  const cognito = new Cognito(stack, "Auth", {
    login: ["email", "phone", "username", "preferredUsername"],
    cdk: {
      userPool: {
        standardAttributes: {
          email: { required: true, mutable: false },
          address: { required: false, mutable: true },
          phoneNumber: { required: false, mutable: true },
          preferredUsername: { required: false, mutable: true },
        },
        customAttributes: {
          storeName: new StringAttribute({
            minLen: 5,
            maxLen: 200,
            mutable: true,
          }),
        },
      },
      userPoolClient: {
        userPoolClientName: "cs509-consignment-user-pool",
        disableOAuth: false,
        oAuth: {
          flows: {
            authorizationCodeGrant: true,
          },
          scopes: [OAuthScope.OPENID, OAuthScope.PROFILE, OAuthScope.EMAIL],
          callbackUrls: [
            "https://oauth.pstmn.io/v1/callback",
            "http://localhost:5173/",
          ],
          logoutUrls: ["https://my-app-domain.com/signin"],
        },
      },
    },
  });

  const bus = new EventBus(stack, "bus", {
    defaults: {
      retries: 10,
    },
  });

  const api = new Api(stack, "api", {
    cors: true,
    authorizers: {
      jwt: {
        type: "user_pool",
        userPool: {
          id: cognito.userPoolId,
          clientIds: [cognito.userPoolClientId],
        },
        scopes: [OAuthScope.OPENID, OAuthScope.PROFILE],
      },
    },
    defaults: {
      authorizer: "jwt",
    },
    routes: {
      "POST /store-owner/new-store": {
        function: new Function(stack, "SSTNewStore", {
          handler: "packages/functions/src/storeOwner.newStore",
        }),
      },
      "POST /store-owner/new-device": {
        function: new Function(stack, "SSTNewDevice", {
          handler: "packages/functions/src/storeOwner.newDevice",
        }),
      },
      "GET /store-owner/dashboard": {
        function: new Function(stack, "SSTStoreOwnerDash", {
          handler: "packages/functions/src/storeOwner.dashboard",
        }),
      },
      "GET /store-owner/user-info": {
        function: new Function(stack, "SSTStoreOwnerInfo", {
          handler: "packages/functions/src/storeOwner.getStoreOwnerInfo",
        }),
      },
      "GET /site-manager/dashboard": {
        function: new Function(stack, "SSTSiteManagerDash", {
          handler: "packages/functions/src/siteManager.dashboard",
        }),
      },
      "DELETE /site-manager/remove-store": {
        function: new Function(stack, "SSTRemoveStore", {
          handler: "packages/functions/src/siteManager.removeStore",
        }),
      },
      "GET /site-manager/inspect-store-inventory": {
        function: new Function(stack, "SSTInspectStoreInv", {
          handler: "packages/functions/src/siteManager.inspectStoreInv",
        }),
      },
    },
  });

  const web = new RemixSite(stack, "web", {
    path: "packages/web/",
  });

  // Allow authenticated users invoke API
  cognito.attachPermissionsForAuthUsers(stack, [api]);

  // Show the API endpoint and other info in the output
  stack.addOutputs({
    URL: web.url || "localhost",
    ApiEndpoint: api.url,
    UserPoolId: cognito.userPoolId,
    UserPoolClientId: cognito.userPoolClientId,
    IdentityPoolId: cognito.cognitoIdentityPoolId,
  });
}
