import { StackContext, Api, EventBus, Cognito, Function } from "sst/constructs";
import {
  UserPool,
  UserPoolClient,
  OAuthScope,
  StringAttribute,
  UserPoolDomain,
} from "aws-cdk-lib/aws-cognito";
import { Role } from "aws-cdk-lib/aws-iam";
import * as ec2 from "aws-cdk-lib/aws-ec2";

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
          callbackUrls: ["https://oauth.pstmn.io/v1/callback", "http://localhost:5173/"],
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
          handler: "AWS/packages/functions/src/storeOwner.newStore",
        }),
      },
      "POST /store-owner/new-device": {
        function: new Function(stack, "SSTNewDevice", {
          handler: "AWS/packages/functions/src/storeOwner.newDevice",
        }),
      },
      "GET /store-owner/dashboard": {
        function: new Function(stack, "SSTStoreOwnerDash", {
          handler: "AWS/packages/functions/src/storeOwner.dashboard",
        }),
      },
      "GET /site-manager/dashboard": {
        function: new Function(stack, "SSTSiteManagerDash", {
          handler: "AWS/packages/functions/src/siteManager.dashboard",
        }),
      },
      "DELETE /site-manager/remove-store": {
        function: new Function(stack, "SSTRemoveStore", {
          handler: "AWS/packages/functions/src/siteManager.removeStore",
        }),
      },
      "GET /site-manager/inspect-store-inventory": {
        function: new Function(stack, "SSTInspectStoreInv", {
          handler: "AWS/packages/functions/src/siteManager.inspectStoreInv",
        }),
      },
    },
  });
  // Allow authenticated users invoke API
  cognito.attachPermissionsForAuthUsers(stack, [api]);

  // Show the API endpoint and other info in the output
  stack.addOutputs({
    ApiEndpoint: api.url,
    UserPoolId: cognito.userPoolId,
    UserPoolClientId: cognito.userPoolClientId,
    IdentityPoolId: cognito.cognitoIdentityPoolId,
  });
}
