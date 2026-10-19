const fs = require('node:fs');
const path = require('node:path');
const Database = require('better-sqlite3');

const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

function createDatabase(filename) {
  const inMemory = filename === ':memory:';
  if (!inMemory) fs.mkdirSync(path.dirname(filename), { recursive: true });

  const db = new Database(filename);
  if (!inMemory) db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(schema);
  return db;
}

module.exports = { createDatabase };
