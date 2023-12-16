import { Prisma } from "@prisma/client";
import { getDistance } from "geolib";
import { ApiHandler } from "sst/node/api";
import { client } from "./util/prismaClient";
import { response } from "./util/response";

export const inspectStoreInv = ApiHandler(async (event) => {
  try {
    const devices = await client.devices.findMany({
      include: {
        stores: {
          select: {
            storeName: true,
          },
        },
      },
      where: {
        listingActive: true,
        stores: {
          storeName:
            event.queryStringParameters?.storeName === ""
              ? undefined
              : event.queryStringParameters?.storeName,
        },
      },
    });
    console.log(event);
    const returnData = Array();
    devices.map((device) => {
      const { stores, ...everythingElse } = device;
      returnData.push({
        ...everythingElse,
        storeName: device.stores.storeName,
      });
    });
    response.body = JSON.stringify({ devices: returnData });
  } catch (err) {
    console.log(err);
    console.log(event);
    response.statusCode = 400;
    response.body =
      err instanceof Error ? "Error: " + err.message : "Unknown error occurred";
  }
  return response;
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
        stores: { select: { latitude: true, longitude: true } },
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
        listingActive: true
      },
      include: {
        stores: {
          select: {
            storeName: true,
          },
        },
      },
    });
    if (result == null) {
      throw Error("no device found with that ID");
    } else {
      response.statusCode = 200;
    }
    const { stores, ...everythingElse } = result;
    const returnData = { ...everythingElse, storeName: stores.storeName };
    response.body = JSON.stringify(returnData);
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

export const filterDevices = ApiHandler(async (event) => {
  const query = event.queryStringParameters;
  const filterJSON: any = {};

  filterJSON["storeId"] = { OR: Array() };
  (query?.storeName ? (query?.storeId as string) : undefined)
    ?.split(",")
    .map((id: string) => {
      filterJSON["storeId"].OR.push({ storeId: id.trim() });
    });
  
  filterJSON["deviceName"] = { OR: Array() };
  (query?.deviceName ? (query?.deviceName as string) : undefined)
    ?.split(",")
    .map((name: string) => {
      filterJSON["deviceName"].OR.push({ deviceName: name.trim() });
    });

  filterJSON["price"] = { OR: Array() };
  (query?.price ? (query?.price as string) : undefined)
    ?.split(",")
    .map((prices: string) => {
      const limit = prices.split("-");
      const bounds = { AND: Array() };
      if (limit[0]) {
        bounds.AND.push({
          price: { gt: (Number(limit[0].trim()) - 1) as number },
        });
      }
      if (limit[1]) {
        bounds.AND.push({
          price: { lt: (Number(limit[1].trim()) + 1) as number },
        });
      }
      filterJSON.price.OR.push(bounds);
    });

  filterJSON["formFactor"] = { OR: Array() };
  (query?.formFactor ? (query?.formFactor as string) : undefined)
    ?.split(",")
    .map((formFactor: string) => {
      filterJSON["formFactor"].OR.push({ formFactor: formFactor.trim() });
    });

  filterJSON["processorManufacturer"] = { OR: Array() };
  (query?.processorManufacturer
    ? (query?.processorManufacturer as string)
    : undefined
  )
    ?.split(",")
    .map((processorManufacturer: string) => {
      filterJSON.processorManufacturer.OR.push({
        processorManufacturer: processorManufacturer.trim(),
      });
    });

  filterJSON["processorModel"] = { OR: Array() };
  (query?.processorModel ? (query?.processorModel as string) : undefined)
    ?.split(",")
    .map((processorModel: string) => {
      filterJSON.processorModel.OR.push({
        processorModel: processorModel.trim(),
      });
    });

  filterJSON["gpuManufacturer"] = { OR: Array() };
  (query?.gpuManufacturer ? (query?.gpuManufacturer as string) : undefined)
    ?.split(",")
    .map((gpuManufacturer: string) => {
      filterJSON.gpuManufacturer.OR.push({
        gpuManufacturer: gpuManufacturer.trim(),
      });
    });

  filterJSON["gpuModel"] = { OR: Array() };
  (query?.gpuModel ? (query?.gpuModel as string) : undefined)
    ?.split(",")
    .map((gpuModel: string) => {
      filterJSON.gpuModel.OR.push({ gpuModel: gpuModel.trim() });
    });

  filterJSON["memoryType"] = { OR: Array() };
  (query?.memoryType ? (query?.memoryType as string) : undefined)
    ?.split(",")
    .map((memoryType: string) => {
      filterJSON.memoryType.OR.push({ memoryType: memoryType.trim() });
    });

  filterJSON["memoryMb"] = { OR: Array() };
  (query?.memoryMb ? (query?.memoryMb as string) : undefined)
    ?.split(",")
    .map((memoryMb: string) => {
      const limit = memoryMb.split("-");
      const bounds = { AND: Array() };
      if (limit[0]) {
        bounds.AND.push({
          price: { gt: (Number(limit[0].trim()) - 1) as number },
        });
      }
      if (limit[1]) {
        bounds.AND.push({
          price: { lt: (Number(limit[1].trim()) + 1) as number },
        });
      }
      filterJSON.memoryMb.OR.push(bounds);
    });

  filterJSON["storageType"] = { OR: Array() };
  (query?.storageType ? (query?.storageType as string) : undefined)
    ?.split(",")
    .map((storageType: string) => {
      filterJSON.memoryType.OR.push({ storageType: storageType.trim() });
    });

  filterJSON["storageGb"] = { OR: Array() };
  (query?.storageGb ? (query?.storageGb as string) : undefined)
    ?.split(",")
    .map((storageGb: string) => {
      const limit = storageGb.split("-");
      const bounds = { AND: Array() };
      if (limit[0]) {
        bounds.AND.push({
          price: { gt: (Number(limit[0].trim()) - 1) as number },
        });
      }
      if (limit[1]) {
        bounds.AND.push({
          price: { lt: (Number(limit[1].trim()) + 1) as number },
        });
      }
      filterJSON.storageGb.OR.push(bounds);
    });

  filterJSON["operatingSystem"] = { OR: Array() };
  (query?.operatingSystem ? (query?.operatingSystem as string) : undefined)
    ?.split(",")
    .map((operatingSystem: string) => {
      filterJSON.operatingSystem.OR.push({
        operatingSystem: operatingSystem.trim(),
      });
    });

  filterJSON["dedicatedGpu"] = {
    dedicatedGpu: query?.dedicatedGpu ? query?.dedicatedGpu : undefined,
  };

  filterJSON["listingActive"] = {listingActive: true}

  console.log(JSON.stringify(filterJSON));

  const finalFilter = { AND: Array() };
  for (var key in filterJSON) {
    finalFilter.AND.push(filterJSON[key]);
  }
  try {
    const devices = await client.devices.findMany({
      where: finalFilter,
      include: {
        stores: {
          select: { storeName: true },
        },
      },
    });
    const returnData = Array();
    devices.map((device: any) => {
      const { stores, ...everythingElse } = device;
      returnData.push({
        ...everythingElse,
        storeName: device.stores.storeName,
      });
    });
    response.body = JSON.stringify(returnData);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // The .code property can be accessed in a type-safe manner
      if (error.code === "P2002") {
        console.log(
          "There is a unique constraint violation, a new user cannot be created with this email",
        );
        response.body = JSON.stringify(error);
      } else {
        const errorStr = `Prisma error ${error.code}: ${error.message}`;
        console.log(errorStr);
        response.body = errorStr;
      }
    } else {
      console.log(`ERROR: ${error as Error}`);
      response.statusCode = 400;
      response.body =
        "Error filtering for devices: " +
        (error instanceof Error ? error : JSON.stringify(error));
    }
  }
  return response;
});
