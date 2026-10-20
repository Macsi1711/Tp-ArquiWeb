const config = require('./config');
const { createDatabase } = require('./db/connection');
const { seedIfEmpty } = require('./db/seed');
const { createApp } = require('./app');

const db = createDatabase(config.dbPath);
if (seedIfEmpty(db)) console.log('Base vacía: se cargaron los datos de ejemplo');

const app = createApp({ db });

const server = app.listen(config.port, () => {
  console.log(`NutriTrack API escuchando en http://localhost:${config.port}`);
});

function apagar() {
  server.close(() => {
    db.close();
    process.exit(0);
  });
}
process.on('SIGINT', apagar);
process.on('SIGTERM', apagar);
