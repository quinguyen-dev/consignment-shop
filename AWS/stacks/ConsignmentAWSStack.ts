import { StackContext, Api, EventBus, Cognito } from "sst/constructs";
import { UserPool, UserPoolClient, OAuthScope, StringAttribute, UserPoolDomain } from "aws-cdk-lib/aws-cognito";

export function API({ stack }: StackContext) {

  const cognito = new Cognito(stack, "Auth", {
    login: ["email", "phone", "username", "preferredUsername"],
    cdk:{
      userPool:{
        standardAttributes: {
          email: { required: true, mutable: false },
          address: { required: false, mutable: true },
          phoneNumber: { required: false, mutable:true },
          preferredUsername: { required: false, mutable:true},
        },
        customAttributes: {
          storeName: new StringAttribute({minLen:5, maxLen:200, mutable:true})
        },
      },
      userPoolClient: {
        userPoolClientName: "cs509-consignment-user-pool",
        disableOAuth: false,
        oAuth: {
          flows: {
            authorizationCodeGrant: true,
          },
          scopes: [OAuthScope.OPENID],
          callbackUrls: ["https://oauth.pstmn.io/v1/callback"],
          logoutUrls: ["https://my-app-domain.com/signin"],          
        },
      },
    }
  });

  const bus = new EventBus(stack, "bus", {
    defaults: {
      retries: 10,
    },
  });

  const api = new Api(stack, "api", {
    defaults: {
      authorizer: "iam",
      function: {
        bind: [bus],
      },
    },
    routes: {
      "GET /": "AWS/packages/functions/src/lambda.handler",
      // "GET /todo": "packages/functions/src/todo.list",
      // "POST /todo": "packages/functions/src/todo.create",
    },
  });

  // bus.subscribe("todo.created", {
  //   handler: "packages/functions/src/events/todo-created.handler",
  // });

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
