const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "dit_task_management",
  password: "2004",
  port: 5432,
});

module.exports = pool;
