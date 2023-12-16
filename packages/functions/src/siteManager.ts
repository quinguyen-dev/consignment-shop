import { Prisma } from "@prisma/client";
import { ApiHandler } from "sst/node/api";
import { client } from "./util/prismaClient";
import { response } from "./util/response";

export const dashboard = ApiHandler(async (event) => {
  const queryData = {
    managerBalance: 0,
    totalInventoryValue: 0,
    storeBalances: [],
  };
  try {
    const storeId = event.queryStringParameters?.storeId;

    const totInvRes = await client.devices.aggregate({
      _sum: {
        price: true,
      },
    });
    const totalInventoryValue = totInvRes._sum.price;

    const storeBalanceRes = storeId //if a specific store is requested
      ? await client.stores.findMany({
          where: {
            storeId: storeId,
          },
          select: {
            storeId: true,
            storeName: true,
            devices: {
              select: { price: true },
            },
            transactions: {
              select: {
                siteFee: true,
              },
            },
          },
        })
      : //else get all stores
        await client.stores.findMany({
          select: {
            storeId: true,
            storeName: true,
            devices: {
              select: { price: true },
            },
            transactions: {
              select: {
                siteFee: true,
              },
            },
          },
        });

    let storeBalances = Array<{
      storeId: string;
      storeName: string;
      inventoryValue: number;
      balance: number;
      deviceCount: number;
    }>();
    let managersBalance: number = 0;
    storeBalanceRes.map((store, index) => {
      const inventoryValue = store.devices.reduce(
        (sum, a) => sum + (a.price ? a.price : 0),
        0,
      );
      const managerFee = store.transactions.reduce(
        (sum, a) => sum + (a.siteFee ? a.siteFee : 0),
        0,
      );
      const balance = inventoryValue - managerFee;
      managersBalance += managerFee;
      storeBalances.push({
        storeId: store.storeId,
        storeName: store.storeName,
        inventoryValue: inventoryValue,
        balance: balance,
        deviceCount: store.devices.length,
      });
    });

    const returnData = {
      totalInventoryValue: totalInventoryValue,
      managersBalance: managersBalance,
      storeBalances: storeBalances,
    };
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
        "Error getting siteManager dashboard: " +
        (error instanceof Error ? error.message : JSON.stringify(error));
    }
  }

  return response;
});

export const removeStore = ApiHandler(async (event) => {
  const storeId = event.queryStringParameters?.storeId;
  try {
    const result = await client.stores.delete({
      where: {
        storeId: storeId,
      },
    });
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
        "Error removing store: " +
        (error instanceof Error ? error.message : JSON.stringify(error));
    }
  }
  return response;
});

export const inspectStoreInv = ApiHandler(async (event) => {
  const queryData = {
    storeName: null,
    storeId: null,
    totalBalance: 0,
    inventory: 0,
  };
  const storeId = event.queryStringParameters?.storeId;

  try {
    const storeresult = await client.stores.findUniqueOrThrow({
      where: {
        storeId: storeId,
      },
      select: {
        storeId: true,
        storeName: true,
        devices: true,
      },
    });
    const inventoryValue = await client.devices.aggregate({
      _sum: { price: true },
      where: {
        storeId: storeId,
        listingActive: true,
      },
    });
    const storeBalance = await client.transactions.aggregate({
      _sum: {
        siteFee: true,
        shippingCost: true,
        totalCost: true,
      },
      where: {
        storeId: storeId,
      },
    });
    const totalPrice = storeBalance._sum.siteFee
      ? storeBalance._sum.totalCost!
      : 0;
    const siteFee = storeBalance._sum?.siteFee ? storeBalance._sum.siteFee : 0;
    const shippingCost = storeBalance._sum.shippingCost
      ? storeBalance._sum.shippingCost
      : 0;
    const returnValue = {
      ...storeresult,
      inventoryValue: inventoryValue._sum,
      balance: totalPrice - siteFee - shippingCost,
    };
    response.body = JSON.stringify(returnValue);
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
        "Error inspecting store inventory: " +
        (error instanceof Error ? error.message : JSON.stringify(error));
    }
  }
  return response;
});
