const fs = require('node:fs');
const config = require('../config');
const { createDatabase } = require('./connection');
const { seed } = require('./seed');

for (const sufijo of ['', '-wal', '-shm']) {
  fs.rmSync(config.dbPath + sufijo, { force: true });
}

const db = createDatabase(config.dbPath);
seed(db);
db.close();
console.log(`Base de datos regenerada en ${config.dbPath}`);
