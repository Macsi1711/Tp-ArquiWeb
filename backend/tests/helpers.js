const request = require('supertest');
const { createDatabase } = require('../src/db/connection');
const { seed } = require('../src/db/seed');
const { createApp } = require('../src/app');

function crearAppDePrueba() {
  const db = createDatabase(':memory:');
  seed(db);
  const app = createApp({ db, frontendDist: null });
  return { app, db, api: () => request(app) };
}

module.exports = { crearAppDePrueba };
