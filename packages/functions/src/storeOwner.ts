import { Prisma } from "@prisma/client";
import { ApiHandler } from "sst/node/api";
import { client } from "./util/prismaClient";
import { response } from "./util/response";

/* Do whatever operation */
export const newStore = ApiHandler(async (event) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);
  const userInfo = (event.requestContext as any).authorizer?.jwt.claims;
  console.log(`User Info: ${JSON.stringify(userInfo)}`);
  const storeInfo = JSON.parse(event.body ? event.body : "");
  console.log(`STORE INFO: ${JSON.stringify(storeInfo)}`);
  try {
    const returnedData = await client.stores.createMany({
      data: {
        storeId: "error",
        storeName: storeInfo.storeName,
        latitude: storeInfo.latitude,
        longitude: storeInfo.longitude,
        streetAddress: storeInfo.address,
        storeOwnerId: userInfo.username,
      },
    });
    response.statusCode = 400;
    response.body = JSON.stringify(returnedData);
  } catch (error) {
    console.error(error);
    console.log(event.body);
    response.statusCode = 400;
    response.body =
      "ERROR: unable to create new store. \t" +
      (error instanceof Error ? error.message : JSON.stringify(error));
  }
  console.log(`RESPONSE: ${JSON.stringify(response)}`);
  return response;
});

export const newDevice = ApiHandler(async (event) => {
  const body = JSON.parse(event.body!);
  try {
    const newDeviceInfo = {
      deviceId: "error",
      storeId: body.storeId,
      deviceName: body.deviceName,
      price: body.price,
      formFactor: body.formFactor,
      processorManufacturer: body.processorManufacturer,
      processorModel: body.processorModel,
      memoryType: body.memoryType,
      memoryMb: body.memoryMb,
      storageType: body.storageType,
      storageGb: body.storageGb,
      operatingSystem: body.operatingSystem,
      dedicatedGpu: body.dedicatedGpu,
      gpuManufacturer: body.gpuManufacturer,
      gpuModel: body.gpuModel,
      listingActive: true,
    };
    const res = await client.devices.createMany({
      data: newDeviceInfo,
    });
    const { deviceId, ...otherFields } = newDeviceInfo;
    console.log(otherFields);
    const deviceInfo = await client.devices.findFirst({
      select: {
        deviceId: true,
      },
      where: {
        storeId: newDeviceInfo.storeId,
        AND: [
          { deviceName: newDeviceInfo.deviceName },
          { processorManufacturer: newDeviceInfo.processorManufacturer },
        ],
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
    response.statusCode = 200;
    response.body = JSON.stringify({
      deviceId: deviceInfo?.deviceId,
      ...otherFields,
    });
  } catch (error) {
    console.error(error);
    console.log(event.body);
    response.statusCode = 400;
    response.body =
      "ERROR: unable to create new device. \t" +
      (error instanceof Error ? error.message : JSON.stringify(error));
  }
  return response;
});

export const modifyDevice = ApiHandler(async (event) => {
  const {deviceId, ...deviceInfo} = JSON.parse(event.body? event.body : "");
  console.log(event)
  console.log(deviceId);
  console.log(deviceInfo);
  if (!deviceId) {
    response.statusCode = 400;
    response.body = "ERROR: Device ID not provided";
  } else {
    try {
      const updatedDevice = await client.devices.update({
        where: { deviceId: deviceId },
        data: deviceInfo,
      });
      response.body = JSON.stringify(updatedDevice)
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
          "Error modifying device: " +
          (error instanceof Error ? error.message : JSON.stringify(error));
      }
    }
  }
  return response;
});

export const dashboard = ApiHandler(async (event) => {
  try {
    const res = await client.stores.findFirst({
      where: {
        storeOwnerId: (event.requestContext as any).authorizer?.jwt.claims
          .username,
      },
      include: {
        devices: true,
      },
    });
    const balance = await client.transactions.groupBy({
      by: ["storeId"],
      where: { storeId: res?.storeId },
      _sum: {
        totalCost: true,
        siteFee: true,
        shippingCost: true,
      },
    });
    const resBody = { storeId: res?.storeId, storeOwnerId: res?.storeOwnerId,
      longitude: res?.longitude, latitude: res?.latitude, accountBalance: 0, totalInventoryValue: 0 };
    resBody.accountBalance = balance[0]._sum
      ? balance[0]._sum.totalCost! -
        balance[0]._sum.siteFee! -
        balance[0]._sum.shippingCost!
      : -1;
    let inventory = 0;
    res?.devices.forEach((device: any) => {
      inventory += device.price;
    });
    resBody.totalInventoryValue = inventory;
    response.statusCode = 200;
    response.body = JSON.stringify(resBody);
  } catch (error) {
    console.error(error);
    console.log(event.body);
    response.statusCode = 400;
    response.body =
      "ERROR: unable to retreive user info. \t" +
      (error instanceof Error ? error.message : JSON.stringify(error));
  }
  response.body = JSON.stringify(response.body);
  return response;
});

export const getStoreOwnerInfo = ApiHandler(async (event) => {
  try {
    const res = await client.stores.findFirst({
      where: {
        storeOwnerId: (event.requestContext as any).authorizer?.jwt.claims
          .username,
      },
      include: {
        devices: {
          select: { price: true },
        },
      },
    });
    const balance = await client.transactions.groupBy({
      by: ["storeId"],
      where: { storeId: res?.storeId },
      _sum: {
        totalCost: true,
        siteFee: true,
        shippingCost: true,
      },
    });
    const resBody = { ...res, accountBalance: 0, totalInventoryValue: 0 };
    resBody.accountBalance = balance[0]._sum
      ? balance[0]._sum.totalCost! -
        balance[0]._sum.siteFee! -
        balance[0]._sum.shippingCost!
      : -1;
    let inventory = 0;
    res?.devices.forEach((device: any) => {
      inventory += device.price;
    });
    resBody.totalInventoryValue = inventory;
    response.statusCode = 200;
    response.body = JSON.stringify(resBody);
  } catch (error) {
    console.error(error);
    console.log(event.body);
    response.statusCode = 400;
    response.body =
      "ERROR: unable to retrieve user info. \t" +
      (error instanceof Error ? error.message : JSON.stringify(error));
  }
  return response;
});

export const deleteDevice = ApiHandler(async (event) => {
  const deviceId = JSON.parse(event.body ? event.body : "").deviceId;
  try {
    const deviceData = await client.devices.findFirst({
      where: { deviceId: deviceId },
    });
    const res = await client.devices.delete({
      where: {
        deviceId: deviceId,
      },
    });
    const transRes = await client.transactions.createMany({
      data: {
        deviceId: null,
        storeId: deviceData?.storeId,
        transactionId: "error",
        siteFee: 25,
        shippingCost: 0,
        totalCost: 0,
      },
    });
    response.statusCode = 200;
    response.body = JSON.stringify(res);
  } catch (error) {
    console.error(error);
    console.log(event.body);
    response.statusCode = 400;
    response.body =
      "ERROR: unable to delete device. \t" +
      (error instanceof Error ? error.message : JSON.stringify(error));
  }
  response.body = JSON.stringify(response.body);
  return response;
});
