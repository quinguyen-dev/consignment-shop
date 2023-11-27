import { CfnUserPoolClient, OAuthScope, StringAttribute, UserPool } from "aws-cdk-lib/aws-cognito";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Role } from "aws-cdk-lib/aws-iam";
import {
  Api,
  Cognito,
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
        generateSecret: true,
        oAuth: {
          flows: {
            authorizationCodeGrant: true,
          },
          scopes: [OAuthScope.OPENID, OAuthScope.PROFILE, OAuthScope.EMAIL],
          callbackUrls: ["https://oauth.pstmn.io/v1/callback", "http://localhost:3000/auth/callback/"],
          logoutUrls: ["https://my-app-domain.com/signin"],
        },
      },
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
      "POST /store-owner/remove-device": {
        function: new Function(stack, "SSTStoreOwnerRemove", {
          handler: "packages/functions/src/storeOwner.deleteDevice",
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
      //Customer functions are publicly accessible
      "GET /customer/store-inventory": {
        function: new Function(stack, "SSTCustStoreInv", {
          handler: "packages/functions/src/customer.inspectStoreInv",
        }),
        authorizer: "none",
      },
      "GET /customer/list-stores": {
        function: new Function(stack, "SSTCustListStores", {
          handler: "packages/functions/src/customer.listStores",
        }),
        authorizer: "none",
      },
      "GET /customer/device-fees": {
        function: new Function(stack, "SSTCustDeviceFees", {
          handler: "packages/functions/src/customer.estimateFees",
        }),
        authorizer: "none",
      },
      "POST /customer/buy-device": {
        function: new Function(stack, "SSTCustBuyDevice", {
          handler: "packages/functions/src/customer.buyDevice",
        }),
        authorizer: "none",
      },
    },
  });
  // Allow authenticated users invoke API
  cognito.attachPermissionsForAuthUsers(stack, [api]);

  const site = new RemixSite(stack, "Site", {
    path: "packages/web/",
    environment: {
      API_BASE_URL: api.url,
      COGNITO_BASE_URL:
        "https://cs509-dev-2023-fall.auth.us-east-2.amazoncognito.com/",
      CLIENT_ID: cognito.cdk.userPoolClient.userPoolClientId,
      CLIENT_SECRET: cognito.cdk.userPoolClient.userPoolClientSecret.toString(),
    },
  });

  const cfnUserPoolClient = cognito.cdk.userPoolClient.node
  .defaultChild as CfnUserPoolClient;
cfnUserPoolClient.callbackUrLs = [
  "https://oauth.pstmn.io/v1/callback",
  (web.url || "http://localhost:3000") + "/auth/callback/",
];
cfnUserPoolClient.logoutUrLs= [(web.url || "http://localhost:3000") + "/"]


  // Show the API endpoint and other info in the output
  stack.addOutputs({
    ApiEndpoint: api.url,
    UserPoolId: cognito.userPoolId,
    UserPoolClientId: cognito.userPoolClientId,
    IdentityPoolId: cognito.cognitoIdentityPoolId,
    URL: site.url || "localhost",
  });
}
