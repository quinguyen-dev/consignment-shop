import { getDistance } from "geolib";
import { ApiHandler } from "sst/node/api";
import { client } from "./util/prismaClient";
import { response } from "./util/response";
import { StoreInfo } from "./util/types";
import { APIGatewayProxyStructuredResultV2 } from "aws-lambda";

export const inspectStoreInv = ApiHandler(async (event) => {
  console.log(JSON.stringify(event));
  try {
    const r = await client.stores.findFirst({
      where: { store_name: event.queryStringParameters?.storeName },
      include: {
        devices: true,
      },
    });
    response.body = JSON.stringify(r);
  } catch (err) {
    console.log(err);
    console.log(event);
    response.statusCode = 400;
    response.body = err instanceof Error? "Error: "+err.message : `No store exists with store name ${event.queryStringParameters?.storeName}`;
  }
  response.body = JSON.stringify(response.body);
  return response as unknown as APIGatewayProxyStructuredResultV2;
});

export const listStores = ApiHandler(async (event) => {
  try {
    const r = await client.stores.findMany({
      select: { store_name: true, store_id: true },
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
      where: { device_id: deviceId },
      include: {
        stores: { select: { coords_lat: true, coords_long: true } },
      },
    });
    if (data.latitude) {
      responseData.shippingCost =
        getDistance(
          { latitude: custLat, longitude: custLong },
          { latitude: data.latitude, longitude: data.longitude },
        ) *
        0.000621371 *
        0.03;
      responseData.deviceCost = data.devicePrice;
      responseData.managersCut = data.devicePrice * 0.05;
    }

    return responseData;
  } catch (err) {
    console.error(err);
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
    fees = returnedFees as iFees;
  } catch (error) {
    response.body = `ERROR: Invalid parameters. Parameters received: ${event.queryStringParameters}`;
  }
  fees?.shippingCost
    ? (response.body = JSON.stringify(fees))
    : (response.body = JSON.stringify(response.body));
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
      const result = await client.transactions.create({
        data: {
          transaction_id: "error",
          store_id: storeId,
          device_id: deviceId,
          site_fee: fees.managersCut,
          shipping_cost: fees.shippingCost,
          total_cost: fees.shippingCost + fees.deviceCost,
          buyer_lat: custLatitude,
          buyer_long: custLongitude,
        },
      });
      response.body = JSON.stringify(result);
    } catch (error) {
      response.statusCode = 400;
      response.body =
        "Error creating transaction: " +
        (error instanceof Error ? error.message : JSON.stringify(error));
    }
  } else {
    response.statusCode = 500;
    response.body = "Error generating fees and total cost information";
  }

  console.log(`EVENT: ${event}`);
  response.body = JSON.stringify(response.body);
  return response;
});
