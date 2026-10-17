function createAlimentosController(alimentosService) {
  return {
    listar(req, res) {
      res.json(alimentosService.listar(req.validated.query));
    },
    listarCategorias(req, res) {
      res.json(alimentosService.listarCategorias());
    },
    obtener(req, res) {
      res.json(alimentosService.obtener(req.validated.params.id));
    },
    crear(req, res) {
      const alimento = alimentosService.crear(req.validated.body);
      res.status(201).location(`${req.baseUrl}/${alimento.id}`).json(alimento);
    },
    actualizar(req, res) {
      res.json(alimentosService.actualizar(req.validated.params.id, req.validated.body));
    },
    eliminar(req, res) {
      alimentosService.eliminar(req.validated.params.id);
      res.status(204).end();
    },
  };
}

module.exports = { createAlimentosController };
