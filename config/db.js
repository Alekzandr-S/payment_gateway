const mysql = require("mysql2/promise");
require('dotenv').config();
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.USER_PASSWORD,
    database: 'tests',
    port: process.env.USER_PORT,
    connectionLimit: 10,
});

module.exports = pool;