const { Pool } = require('pg');

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "users--workout",
    password: "Alexander03",
    port: 5433,
  });

module.exports = pool;