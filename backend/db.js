// db.js
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'surveyuser',
  password: process.env.DB_PASS || 'surveypass',
  database: process.env.DB_NAME || 'surveydb',
});

module.exports = pool;
