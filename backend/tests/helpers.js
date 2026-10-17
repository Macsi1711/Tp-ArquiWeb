const request = require('supertest');
const { createDatabase } = require('../src/db/connection');
const { seed } = require('../src/db/seed');
const { createApp } = require('../src/app');

/** App con una base SQLite en memoria recién cargada con los datos de ejemplo. */
function crearAppDePrueba() {
  const db = createDatabase(':memory:');
  seed(db);
  const app = createApp({ db, logs: false, frontendDist: null });
  return { app, db, api: () => request(app) };
}

module.exports = { crearAppDePrueba };
