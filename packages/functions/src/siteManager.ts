// import { ApiHandler } from "sst/node/api";
// import { client } from "./util/prismaClient";
// import { response } from "./util/response";

// export const dashboard = ApiHandler(async (event) => {
//   const queryData = {
//     managerBalance: 0,
//     totalInventoryValue: 0,
//     storeBalances: [],
//   };

//   const storeId = event.queryStringParameters?.storeId;

//   const totInvRes = await client.devices.groupBy({
//     by: ["device_id"],
//     _sum: {
//       price: true,
//     },
//   });
//   const totalInventoryValue = totInvRes[0]._sum.price

//   const getSiteSummary = (storeId) => {
//     return new Promise((resolve, reject) => {
//       connPool.getConnection((err, connection) => {
//         if (err) {
//           response.statusCode = 503;
//           response.body = err.message;
//           return resolve(err);
//         }
//         connection.query(
//           `SELECT SUM(price) as totalBalance FROM DEVICES;`,
//           (error, result) => {
//             console.log("HERE");
//             if (error) {
//               response.statusCode = 418;
//               response.body = error.message;
//               connection.release();
//               return resolve(error);
//             } else {
//               console.log("HERE2");
//               queryData.totalInventoryValue = result[0].totalBalance;
//             }
//           },
//         );
//         if (storeId) {
//           connection.query(
//             `select s.store_id, s.store_name, SUM(d.price) as inventoryValue, COUNT(d.device_id) as deviceCount, calc.balance from STORES as s LEFT JOIN DEVICES as d ON s.store_id = d.store_id
//             LEFT JOIN (
//                 SELECT t.store_id, SUM(t.total_cost-t.shipping_cost-t.site_fee) as balance
//                 FROM TRANSACTIONS as t
//                 GROUP BY t.store_id
//                     ) calc ON s.store_id = calc.store_id WHERE s.store_id = ? AND d.listing_active = 1 group by s.store_id;`,
//             [storeId],
//             (error, result) => {
//               console.log("HERE2");
//               if (error) {
//                 response.statusCode = 418;
//                 response.body = error.message;
//                 return resolve(error);
//               } else {
//                 console.log("HERE2");
//                 queryData.storeBalances = result;
//                 queryData.storeBalances.map((val, index) => {
//                   if (!val.balance) {
//                     console.log(queryData.storeBalances[index]);
//                     queryData.storeBalances[index].balance = 0;
//                   }
//                 });
//                 response.body = queryData;
//                 connection.release();
//                 return resolve(0);
//               }
//             },
//           );
//         } else {
//           connection.query(
//             `select s.store_id as storeId, s.store_name as storeName, SUM(d.price) as inventoryValue, COUNT(d.device_id) as deviceCount, calc.balance from STORES as s LEFT JOIN DEVICES as d ON s.store_id = d.store_id
//             LEFT JOIN (
//                 SELECT t.store_id, SUM(t.total_cost-t.shipping_cost-t.site_fee) as balance
//                 FROM TRANSACTIONS as t
//                 GROUP BY t.store_id
//                     ) calc ON s.store_id = calc.store_id WHERE d.listing_active = 1 group by s.store_id;`,
//             (error, result) => {
//               console.log("HERE2");
//               if (error) {
//                 response.statusCode = 418;
//                 response.body = error.message;
//                 return resolve(error);
//               } else {
//                 console.log("HERE2");
//                 queryData.storeBalances = result;
//                 queryData.storeBalances.map((val, index) => {
//                   if (!val.balance) {
//                     console.log(queryData.storeBalances[index]);
//                     queryData.storeBalances[index].balance = 0;
//                   }
//                 });
//                 response.body = queryData;
//                 connection.release();
//                 return resolve(0);
//               }
//             },
//           );
//         }
//       });
//     });
//   };
//   const getManaBalance = () => {
//     return new Promise((resolve, reject) => {
//       connPool.getConnection((err, connection) => {
//         if (err) {
//           response.statusCode = 503;
//           response.body = err.message;
//           return resolve(err);
//         }
//         connection.query(
//           `SELECT SUM(site_fee) as managerBalance FROM TRANSACTIONS;`,
//           (error, result) => {
//             console.log("HERE");
//             if (error) {
//               response.statusCode = 418;
//               response.body = error.message;
//               connection.release();
//               return resolve(error);
//             } else {
//               console.log("HERE2");
//               queryData.managerBalance = result[0].managerBalance;
//               resolve(0);
//             }
//           },
//         );
//       });
//     });
//   };
//   console.log(event);
//   const r = await getSiteSummary(event.queryStringParameters?.storeId);
//   const bal = await getManaBalance();
//   response.body = JSON.stringify(queryData);
//   return response;
// });

// export const removeStore = ApiHandler(async (event) => {
//   const removeDBStore = (storeId) => {
//     return new Promise((resolve, reject) => {
//       connPool.getConnection((err, connection) => {
//         if (err) {
//           response.statusCode = 503;
//           response.body = err.message;
//           return resolve(err);
//         }
//         connection.query(
//           `DELETE FROM STORES WHERE store_id = ?;`,
//           [storeId],
//           (error, result) => {
//             if (error) {
//               response.statusCode = 418;
//               response.body = error.message;
//               if (connection) connection.release();
//               return resolve(error);
//             } else {
//               response.statusCode = 200;
//               response.body = result;
//               if (connection) connection.release();
//               return resolve(0);
//             }
//           },
//         );
//       });
//     });
//   };

//   const r = await removeDBStore(event.queryStringParameters?.storeId);
//   response.body = JSON.stringify(response.body);
//   return response;
// });

// export const inspectStoreInv = ApiHandler(async (event) => {
//   const queryData = {
//     storeName: null,
//     storeId: null,
//     totalBalance: 0,
//     inventory: 0,
//   };
//   const getInventory = (storeId) => {
//     return new Promise((resolve, reject) => {
//       connPool.getConnection((err, connection) => {
//         if (err) {
//           response.statusCode = 503;
//           response.body = err.message;
//           return resolve(err);
//         }
//         connection.query(
//           `SELECT store_name, store_id FROM STORES WHERE STORES.store_id = ?;`,
//           [storeId],
//           (error, result) => {
//             if (error) {
//               response.statusCode = 418;
//               response.body = error.message;
//               return resolve(error);
//             } else {
//               console.log(result);
//               queryData.storeName = result[0]?.store_name;
//               queryData.storeId = result[0]?.store_id;
//             }
//             connection.query(
//               `SELECT * FROM DEVICES WHERE DEVICES.store_id = ?;`,
//               [storeId],
//               (error, result) => {
//                 console.log("HERE");
//                 if (error) {
//                   console.log(error);
//                   response.statusCode = 418;
//                   response.body = error.message;
//                   return resolve(error);
//                 }
//                 console.log("HERE2");
//                 queryData.inventory = result;
//                 connection.query(
//                   `SELECT SUM(price) as balance FROM DEVICES, USERS, STORES WHERE DEVICES.store_id = ?;`,
//                   [storeId],
//                   (error, result) => {
//                     console.log("HERE");
//                     if (error) {
//                       console.log(error);
//                       response.statusCode = 418;
//                       response.body = error.message;
//                       connection.release();
//                       return resolve(error);
//                     } else {
//                       console.log("HERE2");
//                       queryData.totalBalance = result[0].balance
//                         ? result[0].balance
//                         : 0;
//                     }
//                     response.body = queryData;
//                     return resolve(0);
//                   },
//                 );
//               },
//             );
//           },
//         );
//       });
//     });
//   };

//   const r = await getInventory(event.queryStringParameters?.storeId);
//   response.body = JSON.stringify(response.body);
//   return response;
// });
