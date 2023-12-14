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
        store_id: "error",
        store_name: storeInfo.storeName,
        coords_lat: storeInfo.latitude,
        coords_long: storeInfo.longitude,
        street_address: storeInfo.address,
        store_owner_id: userInfo.username,
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
      device_id: "error",
      store_id: body.storeId,
      device_name: body.deviceName,
      price: body.price,
      form_factor: body.formFactor,
      processor_manufacturer: body.processorManufacturer,
      processor_model: body.processorModel,
      memory_type: body.memoryType,
      memory_mb: body.memoryMB,
      storage_type: body.storageType,
      storage_gb: body.storageGB,
      operating_system: body.operatingSystem,
      dedicated_gpu: body.dedicatedGpu,
      gpu_manufacturer: body.gpuManufacturer,
      gpu_model: body.gpuModel,
      listing_active: true,
    };
    const res = await client.devices.createMany({
      data: newDeviceInfo,
    });
    const { device_id, ...otherFields } = newDeviceInfo;
    console.log(otherFields);
    const deviceInfo = await client.devices.findFirst({
      select: {
        device_id: true,
      },
      where: {
        store_id: newDeviceInfo.store_id,
        AND: [
          { device_name: newDeviceInfo.device_name },
          { processor_manufacturer: newDeviceInfo.processor_manufacturer },
        ],
      },
      orderBy: {
        updated_at: "desc",
      },
    });
    response.statusCode = 200;
    response.body = JSON.stringify({
      deviceId: deviceInfo?.device_id,
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

export const dashboard = ApiHandler(async (event) => {
  try {
    const res = await client.stores.findFirst({
      where: {
        store_owner_id: (event.requestContext as any).authorizer?.jwt.claims
          .username,
      },
      include: {
        devices: true,
      },
    });
    const balance = await client.transactions.groupBy({
      by: ["store_id"],
      where: { store_id: res?.store_id },
      _sum: {
        total_cost: true,
        site_fee: true,
        shipping_cost: true,
      },
    });
    const resBody = { ...res, accountBalance: 0, totalInventoryValue: 0 };
    resBody.accountBalance = balance[0]._sum
      ? balance[0]._sum.total_cost! -
        balance[0]._sum.site_fee! -
        balance[0]._sum.shipping_cost!
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
        store_owner_id: (event.requestContext as any).authorizer?.jwt.claims
          .username,
      },
      include: {
        devices: {
          select: { price: true },
        },
      },
    });
    const balance = await client.transactions.groupBy({
      by: ["store_id"],
      where: { store_id: res?.store_id },
      _sum: {
        total_cost: true,
        site_fee: true,
        shipping_cost: true,
      },
    });
    const resBody = { ...res, accountBalance: 0, totalInventoryValue: 0 };
    resBody.accountBalance = balance[0]._sum
      ? balance[0]._sum.total_cost! -
        balance[0]._sum.site_fee! -
        balance[0]._sum.shipping_cost!
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
      where: { device_id: deviceId },
    });
    const res = await client.devices.delete({
      where: {
        device_id: deviceId,
      },
    });
    const transRes = await client.transactions.createMany({
      data: {
        device_id: null,
        store_id: deviceData?.store_id,
        transaction_id: "error",
        site_fee: -25,
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
