const fs = require('node:fs');
const path = require('node:path');
const express = require('express');

const config = require('./config');
const { createAlimentosRepository } = require('./repositories/alimentos.repository');
const { createUsuariosRepository } = require('./repositories/usuarios.repository');
const { createComidasRepository } = require('./repositories/comidas.repository');
const { createAguaRepository } = require('./repositories/agua.repository');
const { createAlimentosService } = require('./services/alimentos.service');
const { createUsuariosService } = require('./services/usuarios.service');
const { createComidasService } = require('./services/comidas.service');
const { createAguaService } = require('./services/agua.service');
const { createReportesService } = require('./services/reportes.service');
const { createAlimentosController } = require('./controllers/alimentos.controller');
const { createUsuariosController } = require('./controllers/usuarios.controller');
const { createRegistrosController } = require('./controllers/registros.controller');
const { createReportesController } = require('./controllers/reportes.controller');
const { createAlimentosRouter } = require('./routes/alimentos.routes');
const { createUsuariosRouter } = require('./routes/usuarios.routes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

function createApp({ db, frontendDist = config.frontendDist } = {}) {
  const alimentosRepository = createAlimentosRepository(db);
  const usuariosRepository = createUsuariosRepository(db);
  const comidasRepository = createComidasRepository(db);
  const aguaRepository = createAguaRepository(db);

  const usuariosService = createUsuariosService({ usuariosRepository });
  const alimentosService = createAlimentosService({ alimentosRepository });
  const comidasService = createComidasService({ comidasRepository, alimentosRepository, usuariosService });
  const aguaService = createAguaService({ aguaRepository, usuariosService });
  const reportesService = createReportesService({ comidasRepository, aguaRepository, usuariosService });

  const app = express();
  app.use(express.json({ limit: '100kb' }));

  const api = express.Router();
  api.get('/health', (req, res) => res.json({ estado: 'ok' }));
  api.use('/alimentos', createAlimentosRouter(createAlimentosController(alimentosService)));
  api.use(
    '/usuarios',
    createUsuariosRouter({
      usuarios: createUsuariosController(usuariosService),
      comidas: createRegistrosController(comidasService),
      agua: createRegistrosController(aguaService),
      reportes: createReportesController(reportesService),
    }),
  );
  api.use(notFound);
  app.use('/api', api);

  if (frontendDist && fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist));
    app.use((req, res, next) => {
      if (req.method !== 'GET') return next();
      res.sendFile(path.join(frontendDist, 'index.html'));
    });
  }

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
