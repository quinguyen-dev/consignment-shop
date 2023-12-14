import { Prisma } from "@prisma/client";
import { APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { getDistance } from "geolib";
import { ApiHandler } from "sst/node/api";
import { client } from "./util/prismaClient";
import { response } from "./util/response";

export const inspectStoreInv = ApiHandler(async (event) => {
  console.log(JSON.stringify(event));
  try {
    const r = await client.stores.findFirst({
      where: { storeName: event.queryStringParameters?.storeName },
      include: {
        devices: true,
      },
    });
    response.body = JSON.stringify(r);
  } catch (err) {
    console.log(err);
    console.log(event);
    response.statusCode = 400;
    response.body =
      err instanceof Error
        ? "Error: " + err.message
        : `No store exists with store name ${event.queryStringParameters?.storeName}`;
  }
  response.body = JSON.stringify(response.body);
  return response as unknown as APIGatewayProxyStructuredResultV2;
});

export const listStores = ApiHandler(async (event) => {
  try {
    const r = await client.stores.findMany({
      select: { storeName: true, storeId: true },
    });
    const resultStr = JSON.stringify(r);
    console.log(JSON.stringify(r));
    response.body = resultStr;
  } catch (error) {
    response.statusCode = 503;
    response.body =
      error instanceof Error ? error.message : (error as String).toUpperCase();
  }
  return response;
});

interface iFees {
  shippingCost: number;
  managersCut: number;
  deviceCost: number;
}

const getFees = async (
  deviceId: string,
  custLat: number,
  custLong: number,
): Promise<iFees | number> => {
  const responseData: iFees = {
    shippingCost: -1,
    managersCut: -1,
    deviceCost: -1,
  };
  try {
    const data: any = await client.devices.findFirst({
      where: { deviceId: deviceId },
      include: {
        stores: { select: { latititude: true, longitude: true } },
      },
    });
    console.log(JSON.stringify(data));
    if (data.stores.coords_lat) {
      const latitude = data.stores.coords_lat;
      const longitude = data.stores.coords_long;
      responseData.shippingCost =
        getDistance(
          { latitude: custLat, longitude: custLong },
          { latitude: latitude, longitude: longitude },
        ) *
        0.000621371 *
        0.03;
      responseData.deviceCost = data.price;
      responseData.managersCut = data.price * 0.05;
    }

    return responseData;
  } catch (err) {
    console.error(err);
    throw err;
  }
  return -1;
};

export const estimateFees = ApiHandler(async (event) => {
  let fees: iFees | null = null;
  try {
    const returnedFees = await getFees(
      event.queryStringParameters?.deviceId!,
      +event.queryStringParameters?.custLatitude!,
      +event.queryStringParameters?.custLongitude!,
    );
    if (returnedFees instanceof Number) {
      throw Error("failed to calculate fees");
    }
    const fees = returnedFees as iFees;
    if (fees?.shippingCost) {
      response.body = JSON.stringify(fees);
    } else {
      response.body = JSON.stringify(response.body);
    }
  } catch (error) {
    response.body = `ERROR: Invalid parameters. Parameters received: ${event.queryStringParameters}`;
  }
  return response;
});

export const buyDevice = ApiHandler(async (event) => {
  const deviceId = event.queryStringParameters?.deviceId
    ? event.queryStringParameters.deviceId
    : "";
  var storeId = event.queryStringParameters?.storeId;
  const custLatitude: number = Number(
    event.queryStringParameters?.custLatitude,
  );
  const custLongitude: number = Number(
    event.queryStringParameters?.custLongitude,
  );

  const fees: iFees | Number = await getFees(
    deviceId,
    custLatitude,
    custLongitude,
  );

  if (!(fees instanceof Number)) {
    try {
      const result = await client.transactions.createMany({
        data: {
          transactionId: "error",
          storeId: storeId,
          deviceId: deviceId,
          siteFee: fees.managersCut,
          shippingCost: fees.shippingCost,
          totalCost: fees.shippingCost + fees.deviceCost,
          latitude: custLatitude,
          longitude: custLongitude,
        },
      });
      response.body = JSON.stringify(fees);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // The .code property can be accessed in a type-safe manner
        if (error.code === "P2002") {
          console.log(
            "There is a unique constraint violation, a new user cannot be created with this email",
          );
          response.body = "Unique constraint violation: " + error.message;
        } else {
          const errorStr = `Prisma error ${error.code}: ${error.message}`;
          console.log(errorStr);
          response.body = errorStr;
        }
      } else {
        console.log(`ERROR: ${JSON.stringify(error)}`);
        response.statusCode = 400;
        response.body =
          "Error creating transaction: " +
          (error instanceof Error ? error.message : JSON.stringify(error));
      }
    }
  } else {
    response.statusCode = 500;
    response.body = "Error generating fees and total cost information";
  }
  console.log(`EVENT: ${event}`);
  response.body = JSON.stringify(response.body);
  return response;
});

export const getDevice = ApiHandler(async (event) => {
  try {
    const deviceId = event.queryStringParameters?.deviceId;
    const result = await client.devices.findUnique({
      where: {
        deviceId: deviceId,
      },
    });
    if (result == null) {
      throw Error("no device found with that ID");
    } else {
      response.statusCode = 200;
    }
    response.body = JSON.stringify(result);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // The .code property can be accessed in a type-safe manner
      if (error.code === "P2002") {
        console.log(
          "There is a unique constraint violation, a new user cannot be created with this email",
        );
        response.body = "Unique constraint violation: " + error.message;
      } else {
        const errorStr = `Prisma error ${error.code}: ${error.message}`;
        console.log(errorStr);
        response.body = errorStr;
      }
    } else {
      console.log(`ERROR: ${JSON.stringify(error)}`);
      response.statusCode = 400;
      response.body =
        "Error creating transaction: " +
        (error instanceof Error ? error.message : JSON.stringify(error));
    }
  }

  return response;
});
