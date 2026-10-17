const path = require('node:path');

module.exports = {
  port: Number(process.env.PORT) || 3000,
  env: process.env.NODE_ENV || 'development',
  dbPath: process.env.DB_PATH || path.join(__dirname, '..', 'data', 'nutritrack.db'),
  frontendDist: path.join(__dirname, '..', '..', 'frontend', 'dist'),
};
