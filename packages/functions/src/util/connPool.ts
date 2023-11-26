import mysql from "mysql";

export const connPool = mysql.createPool({
  host: "database-1.czghlbwkfjxf.us-east-2.rds.amazonaws.com",
  user: "admin",
  password: "cs509password",
  database: "NEWEGG",
});
