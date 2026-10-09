import "dotenv/config"
import mysql from "mysql2/promise";

export const pool = mysql.createPool({
    host: process.env.USERS_DB_HOST,
    port: Number(process.env.USERS_DB_PORT ?? 3306),
    user: process.env.USERS_DB_USER,
    password: process.USERS_DB_PASS,
    database: process.USERS_DB_NAME,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})