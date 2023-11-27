import { ApiHandler } from "sst/node/api";
import { response } from "./util/response";
import { connPool } from "./util/connPool";
import { Computer, StoreInfo } from "./util/types";
import { getDistance } from "geolib";

export const inspectStoreInv = ApiHandler(async (event) => {
  const queryData = {} as StoreInfo;
  const getInventory = (storeName) => {
    return new Promise((resolve, reject) => {
      connPool.getConnection((err, connection) => {
        if (err) {
          response.statusCode = 503;
          response.body = err.message;
          return resolve(err);
        }
        connection.query(
          `SELECT store_name, store_id FROM STORES WHERE STORES.store_name = ?;`,
          [storeName],
          (error, result) => {
            if (error) {
              response.statusCode = 418;
              response.body = error.message;
              return resolve(error);
            } else {
              console.log(result);
              if (result) {
                queryData.storeName = result[0]?.store_name;
                queryData.storeId = result[0]?.store_id;

                connection.query(
                  `SELECT * FROM DEVICES WHERE DEVICES.store_id = ? AND DEVICES.listing_active = 1;`,
                  [queryData.storeId],
                  (error, result) => {
                    console.log("HERE");
                    if (error) {
                      console.log(error);
                      response.statusCode = 418;
                      response.body = error.message;
                      return resolve(error);
                    }
                    queryData.inventory = new Array<Computer>();
                    result.map((val, index) => {
                      queryData.inventory.push({
                        deviceId: val.device_id,
                        storeId: val.store_id,
                        deviceName: val.device_name,
                        formFactor: val.form_factor,
                        processorModel: val.processor_model,
                        memoryType: val.memory_type,
                        memoryMb: val.memory_mb,
                        storageType: val.storage_type,
                        storageGb: val.storage_gb,
                        price: val.price,
                        operatingSystem: val.operating_system,
                        dedicatedGpu: val.dedicated_gpu,
                        gpuManufacturer: val.gpu_manufacturer,
                        gpuModel: val.gpu_model,
                        listingActive: val.listing_active,
                      } as Computer);
                    });

                    response.body = queryData;
                    if (connection) connection.release();
                    return resolve(0);
                  },
                );
              } else {
                response.statusCode = 400;
                response.body = "Invalid store name";
              }
            }
          },
        );
      });
    });
  };
  console.log(JSON.stringify(event));
  const r = await getInventory(event.queryStringParameters?.storeName);
  response.body = JSON.stringify(response.body);
  return response;
});

export const listStores = ApiHandler(async (event) => {
  const queryData: StoreInfo[] = new Array<StoreInfo>();
  const getStores = () => {
    return new Promise((resolve, reject) => {
      connPool.getConnection((err, connection) => {
        if (err) {
          response.statusCode = 503;
          response.body = err.message;
          return resolve(err);
        }
        connection.query(
          `SELECT store_name as storeName, store_id as storeId FROM STORES;`,
          (error, result) => {
            if (error) {
              response.statusCode = 418;
              response.body = error.message;
              return resolve(error);
            } else {
              result.map((val, index) => {
                console.log(`VALUE: ${JSON.stringify(val)}`);
                queryData.push(val as StoreInfo);
              });
              if (connection) connection.release();
              return resolve(0);
            }
          },
        );
      });
    });
  };
  const r = await getStores();
  response.body = JSON.stringify({stores:queryData});
  return response;
});

const getFees = async (deviceId, custLat, custLong) => {
  const getStoreLatAndLong = (deviceId) => {
    return new Promise((resolve, reject) => {
      connPool.getConnection((err, connection) => {
        if (err) {
          response.statusCode = 503;
          response.body = err.message;
          return resolve(err);
        }
        connection.query(
          `SELECT coords_lat, coords_long, DEVICES.price FROM STORES, DEVICES WHERE STORES.store_id = DEVICES.store_id AND DEVICES.device_id = ?`,
          [deviceId],
          (error, result) => {
            if (error) {
              if (connection) connection.release();
              return reject(error);
            } else {
              if (connection) connection.release();
              console.log(result);
              return resolve({
                latitude: result[0]?.coords_lat,
                longitude: result[0]?.coords_long,
                devicePrice: result[0]?.price,
              });
            }
          },
        );
      });
    });
  };
  const responseData = {
    shippingCost: null,
    managersCut: null,
    deviceCost: null,
  };
  const r: any = await getStoreLatAndLong(deviceId);
  console.log(JSON.stringify(r));
  if (r.latitude) {
    responseData.shippingCost =
      getDistance(
        { latitude: custLat, longitude: custLong },
        { latitude: r.latitude, longitude: r.longitude },
      ) *
      0.000621371 *
      0.03;
    responseData.deviceCost = r.devicePrice;
    responseData.managersCut = r.devicePrice * 0.05;
  }

  return responseData;
};

export const estimateFees = ApiHandler(async (event) => {
  const fees: any = await getFees(
    event.queryStringParameters?.deviceId,
    event.queryStringParameters?.custLatitude,
    event.queryStringParameters?.custLongitude,
  );
  fees.shippingCost
    ? (response.body = JSON.stringify(fees))
    : (response.body = JSON.stringify(response.body));
  return response;
});

export const buyDevice = ApiHandler(async (event) => {
  const deviceId = event.queryStringParameters?.deviceId;
  var storeId = event.queryStringParameters?.storeId
  const custLatitude = event.queryStringParameters?.custLatitude;
  const custLongitude = event.queryStringParameters?.custLongitude;
  
  const fees: any = await getFees(
    event.queryStringParameters?.deviceId,
    event.queryStringParameters?.custLatitude,
    event.queryStringParameters?.custLongitude,
  );

  if (fees.shippingCost) {
    if(storeId == null) {
    const getStoreId = () => {
      return new Promise((resolve, reject) => {
        connPool.getConnection((err, connection) => {
          if (err) {
            response.statusCode = 503;
            response.body = err.message;
            return resolve(err);
          }
          if(storeId == null){
             connection.query(
                `SELECT store_id FROM DEVICES WHERE DEVICES.device_id = ?`,
                [deviceId],
                (error, result) => {
                  if (error) {
                    response.statusCode = 418;
                    response.body = error.message;
                    if (connection) connection.release();
      
                    return reject(error);
                  } else {
                    console.log(result);
                    storeId = result[0]?.store_id
                    console.log(storeId)
                  }
                },
              );
          }
        });
      });
    };
    const id = await getStoreId();
    }
    const newTransaction = () => {
      return new Promise((resolve, reject) => {
        connPool.getConnection((err, connection) => {
          if (err) {
            response.statusCode = 503;
            response.body = err.message;
            return reject(err);
          }
          connection.query(
            `INSERT INTO TRANSACTIONS(store_id, device_id, site_fee, shipping_cost, total_cost, buyer_lat, buyer_long) VALUES (?,?,?,?,?,?,?)`,
            [
              storeId,
              deviceId,
              fees.managersCut,
              fees.shippingCost,
              ((fees.shippingCost as number) + (fees.deviceCost as number)),
              custLatitude,
              custLongitude,
            ],
            (error, result) => {
              if (error) {
                response.statusCode = 418;
                response.body = error.message;
                if (connection) connection.release();
                return resolve(error);
              } else {
                console.log(result);
                response.body = result
              }
            },
          );
          connection.query(`UPDATE DEVICES SET listing_active = 0 WHERE DEVICES.device_id = ?`, [deviceId], (error, result)=>{
            if(error){
              if(connection) connection.release();
              response.statusCode = 207
              response.body = {error_message: "Transaction created but device not removed from inventory"}
              return resolve(error);
            }
            else {
              if(connection) connection.release();
              return resolve(result);
            }
          });

        });
      });
    };
    const r = await newTransaction();
  }
  else{
    response.statusCode = 500;
    response.body = "Error generating fees and total cost information"
  }

  console.log(`EVENT: ${event}`)
  response.body = JSON.stringify(response.body);
  return response;
});
