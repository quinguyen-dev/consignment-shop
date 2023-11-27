import mysql from "mysql";



const DBHost = "database-1.czghlbwkfjxf.us-east-2.rds.amazonaws.com"
const DBUser = "admin"
const DBPassword = "cs509password"
const DBName = "NEWEGG"

const localDBHost = "localhost"
const localDBUser = "root"
const localDBPassword = "cs509password"
const localDBName = "NEWEGG"

export const connPool = process.env.IS_LOCAL?
mysql.createPool({
  host: localDBHost,
  user: localDBUser,
  password: localDBPassword,
  database: localDBName,
})
:
mysql.createPool({
    host: DBHost,
    user: DBUser,
    password: DBPassword,
    database: DBName,
  });