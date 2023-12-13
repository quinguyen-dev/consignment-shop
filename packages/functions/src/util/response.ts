import { APIGatewayProxyStructuredResultV2 } from "aws-lambda";

/* Create the response body */
export const response: APIGatewayProxyStructuredResultV2 = {
  statusCode: 200,
  body: "",
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
  },
};
