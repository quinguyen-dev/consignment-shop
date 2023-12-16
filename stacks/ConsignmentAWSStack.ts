import {
  CfnUserPoolClient,
  OAuthScope,
  StringAttribute,
} from "aws-cdk-lib/aws-cognito";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Role } from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import fs from "fs-extra";
import path from "node:path";
import {
  Api,
  Cognito,
  Function,
  RemixSite,
  StackContext,
} from "sst/constructs";

export const LAYER_MODULES = ["encoding", "@prisma/client/runtime"]

function preparePrismaLayerFiles() {
  const layerPath = "./layers/prisma";
  try {
    fs.rmSync(layerPath, { force: true, recursive: true });
    fs.mkdirSync(layerPath, { recursive: true });
    const files = [
      "node_modules/.prisma",
      "node_modules/@prisma/client",
      "node_modules/prisma/build",
    ];
    for (const file of files) {
      // Do not include binary files that aren't for AWS to save space
      fs.copySync(file, path.join(layerPath, "nodejs", file), {
        filter: (src) => !src.endsWith("so.node") || src.includes("rhel"),
      });
    }
  } catch (err) {
    console.error(err);
    return -1;
  }
}

export function API({ stack }: StackContext) {
  preparePrismaLayerFiles();
  const PrismaLayer = new lambda.LayerVersion(stack, "PrismaLayer", {
    description: "Prisma layer",
    code: lambda.Code.fromAsset("./layers/prisma"),
  });

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
    layers: [PrismaLayer],
    runtime: "nodejs18.x",
    nodejs: {
      // format: "esm",
      esbuild: {
        external: LAYER_MODULES.concat(["@prisma/engines", "@prisma/engines-version", "@prisma/internals"]),
        sourcemap: true,
      },
    },
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
          callbackUrls: [
          ],
          logoutUrls: [""],
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
      "POST /store-owner/modify-device": {
        function: new Function(stack, "SSTStoreOwnerModifyDevice", {
          handler: "packages/functions/src/storeOwner.modifyDevice",
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
      "GET /customer/device": {
        function: new Function(stack, "SSTCustGetDevice", {
          handler: "packages/functions/src/customer.getDevice",
        }),
        authorizer: "none",
      },
      "GET /customer/filter-device": {
        function: new Function(stack, "SSTCustFilterDevice", {
          handler: "packages/functions/src/customer.filterDevices",
        }),
        authorizer: "none",
      },
      "GET /homepage-data": {
        function: new Function(stack, "SSTMiscHomePage", {
          handler: "packages/functions/src/misc.homepageData",
        }),
        authorizer: "none",
      }
    },
  });
  // Allow authenticated users invoke API
  cognito.attachPermissionsForAuthUsers(stack, [api]);

  const site = new RemixSite(stack, "Site", {
    path: "packages/web/",
  });

  const cfnUserPoolClient = cognito.cdk.userPoolClient.node
    .defaultChild as CfnUserPoolClient;
  cfnUserPoolClient.callbackUrLs = [
    "https://oauth.pstmn.io/v1/callback",
      "http://localhost:3000/auth/callback/",
      site.url?? site.url + "/auth/callback/",
  ];
  cfnUserPoolClient.logoutUrLs = ["http://localhost:3000/", site.url??  site.url + "/"];

  // Show the API endpoint and other info in the output
  stack.addOutputs({
    ApiEndpoint: api.url,
    UserPoolId: cognito.userPoolId,
    UserPoolClientId: cognito.userPoolClientId,
    IdentityPoolId: cognito.cognitoIdentityPoolId,
    URL: site.url || "localhost",
  });
}
