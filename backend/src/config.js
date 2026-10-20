const path = require('node:path');

module.exports = {
  port: Number(process.env.PORT) || 3000,
  dbPath: process.env.DB_PATH || path.join(__dirname, '..', 'data', 'nutritrack.db'),
  frontendDist: path.join(__dirname, '..', '..', 'frontend', 'dist'),
};
