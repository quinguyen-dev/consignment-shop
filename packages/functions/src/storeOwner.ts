import { ApiHandler } from "sst/node/api";
import { connPool } from "./util/connPool";
import { response } from "./util/response";

/* Do whatever operation */
export const newStore = ApiHandler(async (event) => {
  const createStore = (username, storeName, lat, long, address) => {
    return new Promise((resolve, reject) => {
      connPool.query(
        `INSERT INTO STORES (store_name, coords_lat, coords_long, street_address, store_owner_id) VALUES (?, ?, ?, ?, ?);`,
        [storeName, lat, long, address, username],
        (error, result) => {
          console.log("HERE");
          if (error) {
            response.statusCode = 418;
            response.body = {
              "error message": error.message,
              "received-body": JSON.stringify(event.body),
            };
            return resolve(error);
          } else {
            console.log("HERE2");
            response.statusCode = 201;
            response.body = result;
            return resolve(0);
          }
        },
      );
    });
  };

  console.log(`EVENT: ${JSON.stringify(event)}`);
  const userInfo = event.requestContext.authorizer.jwt.claims;
  console.log(`User Info: ${JSON.stringify(userInfo)}`);
  const storeInfo = JSON.parse(event.body);
  console.log(`STORE INFO: ${JSON.stringify(storeInfo)}`);
  const r = await createStore(
    userInfo.username,
    storeInfo.storeName,
    storeInfo.latitude,
    storeInfo.longitude,
    storeInfo.address,
  );
  console.log(`RESPONSE: ${JSON.stringify(response)}`);
  response.body = JSON.stringify(response);
  return response;
});

export const newDevice = ApiHandler(async (event) => {
  const insertDevice = (
    storeId,
    deviceName,
    price,
    formFactor,
    memoryMB,
    memoryType,
    storageGB,
    storageType,
    cpuMan,
    cpuModel,
    gpuMan,
    gpuModel,
    dedicatedGpu,
    os,
  ) => {
    return new Promise((resolve, reject) => {
      connPool.getConnection((err, connection) => {
        if (err) {
          response.statusCode = 418;
          response.body = err;
          return resolve(1);
        }
        connection.query(
          `INSERT INTO DEVICES(store_id, device_name, price, form_factor, memory_mb, memory_type, storage_gb, storage_type, processor_manufacturer, processor_model, gpu_manufacturer, gpu_model, dedicated_gpu, operating_system, listing_active) VALUES (?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?);`,
          [
            storeId,
            deviceName,
            price,
            formFactor,
            memoryMB,
            memoryType,
            storageGB,
            storageType,
            cpuMan,
            cpuModel,
            gpuMan,
            gpuModel,
            dedicatedGpu,
            os,
            true,
          ],
          (error, result) => {
            console.log("HERE");
            if (error) {
              response.statusCode = 418;
              response.body = error.message;
              if (connection) connection.release();
              return resolve(error);
            } else {
              connection.query(
                "SELECT * FROM DEVICES WHERE store_id = ? ORDER BY updated_at DESC limit 1",
                [storeId],
                (err, res) => {
                  if (err) {
                    console.log(err);
                    response.body = err;
                    response.statusCode = 207;
                    if (connection) connection.release();
                    return resolve(0);
                  }
                  if (connection) connection.release();
                  response.statusCode = 201;
                  response.body = res[0];
                  return resolve(0);
                },
              );
            }
          },
        );
      });
    });
  };

  const body = JSON.parse(event.body);
  const r = await insertDevice(
    body.storeId,
    body.deviceName,
    body.price,
    body.formFactor,
    body.memoryMB,
    body.memoryType,
    body.storageGB,
    body.storageType,
    body.processorManufacturer,
    body.processorModel,
    body.gpuManufacturer,
    body.gpuModel,
    body.dedicatedGpu,
    body.operatingSystem,
  );

  response.body = JSON.stringify(response.body);
  return response;
});

export const dashboard = ApiHandler(async (event) => {
  const queryData = {
    store_name: null,
    store_id: null,
    total_balance: 0,
    inventory: 0,
  };
  const getInventory = (username) => {
    return new Promise((resolve, reject) => {
      connPool.getConnection((err, connection) => {
        if (err) {
          response.statusCode = 503;
          response.body = err.message;
          return resolve(err);
        }
        connection.query(
          `SELECT store_name FROM STORES WHERE STORES.store_owner_id = ?;`,
          [username],
          (error, result) => {
            if (error) {
              response.statusCode = 418;
              response.body = error.message;
              return resolve(error);
            } else {
              console.log(result);
              queryData.store_name = result[0].store_name;
              queryData.store_id = result[0].store_id;
            }
            connection.query(
              `SELECT * FROM DEVICES, STORES WHERE DEVICES.store_id = STORES.store_id and STORES.store_owner_id = ?;`,
              [username],
              (error, result) => {
                console.log("HERE");
                if (error) {
                  console.log(error);
                  response.statusCode = 418;
                  response.body = error.message;
                  return resolve(error);
                }
                console.log("HERE2");
                queryData.inventory = result;
                connection.query(
                  `SELECT SUM(price) as balance FROM DEVICES, STORES WHERE DEVICES.store_id = STORES.store_id and STORES.store_owner_id = ?;`,
                  [username],
                  (error, result) => {
                    console.log("HERE");
                    if (error) {
                      console.log(error);
                      response.statusCode = 418;
                      response.body = error.message;
                      connection.release();
                      return resolve(error);
                    } else {
                      console.log("HERE2");
                      queryData.total_balance = result[0].balance
                        ? result[0].balance
                        : 0;
                    }
                    response.body = queryData;
                    return resolve(0);
                  },
                );
              },
            );
          },
        );
      });
    });
  };
  const r = await getInventory(
    event.requestContext.authorizer.jwt.claims?.username,
  );
  response.body = JSON.stringify(response.body);
  return response;
});

export const getStoreOwnerInfo = ApiHandler(async (event) => {
  const queryData = {
    username: null,
    store_name: null,
    store_id: null,
    total_balance: 0,
  };
  const getOwnerSummary = (username) => {
    return new Promise((resolve, reject) => {
      connPool.getConnection((err, connection) => {
        if (err) {
          response.statusCode = 503;
          response.body = err.message;
          return resolve(err);
        }
        connection.query(
          `SELECT store_name, store_id FROM STORES WHERE STORES.store_owner_id = ?;`,
          [username],
          (error, result) => {
            if (error) {
              response.statusCode = 418;
              response.body = error.message;
              return resolve(error);
            } else {
              console.log(result);
              queryData.store_name = result[0].store_name;
              queryData.store_id = result[0].store_id;
            }
            connection.query(
              `SELECT SUM(price) as balance FROM DEVICES, STORES WHERE DEVICES.store_id = STORES.store_id and STORES.store_owner_id = ?;`,
              [username],
              (error, result) => {
                console.log("HERE");
                if (error) {
                  console.log(error);
                  response.statusCode = 418;
                  response.body = error.message;
                  connection.release();
                  return resolve(error);
                } else {
                  console.log("HERE2");
                  queryData.total_balance = result[0].balance
                    ? result[0].balance
                    : 0;
                }
                response.body = queryData;
                return resolve(0);
              },
            );
          },
        );
      });
    });
  };
  console.log(event);

  queryData.username = event.requestContext.authorizer.jwt.claims?.username;
  const r = await getOwnerSummary(queryData.username);
  response.body = JSON.stringify(response.body);
  return response;
});