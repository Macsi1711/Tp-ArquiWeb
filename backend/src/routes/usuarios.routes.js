const { Router } = require('express');
const { recurso } = require('./recurso');
const { validate } = require('../middlewares/validate');
const { paramsId, paramsUsuario, paramsUsuarioRegistro, filtroFechas } = require('../validators/comunes');
const { usuarioBody } = require('../validators/usuarios.validator');
const { comidaBody, listarComidasQuery } = require('../validators/comidas.validator');
const { aguaBody } = require('../validators/agua.validator');
const { resumenDiarioQuery } = require('../validators/reportes.validator');

function createRegistrosRouter(controller, { body, listarQuery }) {
  const router = Router({ mergeParams: true });

  recurso(router, '/', {
    get: [validate({ params: paramsUsuario, query: listarQuery }), controller.listar],
    post: [validate({ params: paramsUsuario, body }), controller.crear],
  });
  recurso(router, '/:id', {
    get: [validate({ params: paramsUsuarioRegistro }), controller.obtener],
    put: [validate({ params: paramsUsuarioRegistro, body }), controller.actualizar],
    delete: [validate({ params: paramsUsuarioRegistro }), controller.eliminar],
  });

  return router;
}

function createUsuariosRouter({ usuarios, comidas, agua, reportes }) {
  const router = Router();

  recurso(router, '/', {
    get: [usuarios.listar],
    post: [validate({ body: usuarioBody }), usuarios.crear],
  });
  recurso(router, '/:id', {
    get: [validate({ params: paramsId }), usuarios.obtener],
    put: [validate({ params: paramsId, body: usuarioBody }), usuarios.actualizar],
    delete: [validate({ params: paramsId }), usuarios.eliminar],
  });

  router.use('/:usuarioId/comidas', createRegistrosRouter(comidas, { body: comidaBody, listarQuery: listarComidasQuery }));
  router.use('/:usuarioId/agua', createRegistrosRouter(agua, { body: aguaBody, listarQuery: filtroFechas }));

  const reportesRouter = Router({ mergeParams: true });
  recurso(reportesRouter, '/resumen-diario', {
    get: [validate({ params: paramsUsuario, query: resumenDiarioQuery }), reportes.resumenDiario],
  });
  router.use('/:usuarioId/reportes', reportesRouter);

  return router;
}

module.exports = { createUsuariosRouter };
