const { Router } = require('express');
const { recurso } = require('./recurso');
const { validate } = require('../middlewares/validate');
const { paramsId } = require('../validators/comunes');
const { alimentoBody, listarAlimentosQuery } = require('../validators/alimentos.validator');

function createAlimentosRouter(controller) {
  const router = Router();

  recurso(router, '/', {
    get: [validate({ query: listarAlimentosQuery }), controller.listar],
    post: [validate({ body: alimentoBody }), controller.crear],
  });
  recurso(router, '/categorias', {
    get: [controller.listarCategorias],
  });
  recurso(router, '/:id', {
    get: [validate({ params: paramsId }), controller.obtener],
    put: [validate({ params: paramsId, body: alimentoBody }), controller.actualizar],
    delete: [validate({ params: paramsId }), controller.eliminar],
  });

  return router;
}

module.exports = { createAlimentosRouter };
