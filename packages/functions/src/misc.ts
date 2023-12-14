import { Prisma } from "@prisma/client";
import { APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { getDistance } from "geolib";
import { ApiHandler } from "sst/node/api";
import { client } from "./util/prismaClient";
import { response } from "./util/response";

export const homepageData = ApiHandler(async (event) => {
  console.log(JSON.stringify(event));
  try {
    const stores = await client.stores.findMany({
        select:{
            storeId: true,
            storeName: true,
        _count:{
            select:{devices: true},
        }
      },
    });
    const devices = await client.devices.findMany({
      include:{
        stores:{
          select:{
            storeName: true,
          }
        }
      }
    });

    // Shuffle array
    const shuffStores = stores.sort(() => 0.5 - Math.random());
    const shuffDevices = devices.sort(() => 0.5 - Math.random());
    // Get sub-array of first n elements after shuffled
    const selecStores = shuffStores.slice(0, 4);
    const selecDevices = shuffDevices.slice(0, 4);

    response.body = JSON.stringify({selecStores, selecDevices});
  } catch (err) {
    console.log(err);
    console.log(event);
    response.statusCode = 400;
    response.body =
      err instanceof Error
        ? "Error: " + err.message
        : 'Unknown error occurred';
  }
  return response as unknown as APIGatewayProxyStructuredResultV2;
});