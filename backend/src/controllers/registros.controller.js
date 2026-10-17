/**
 * Controlador genérico para los registros diarios (comidas y agua), que son
 * sub-recursos de un usuario: /usuarios/:usuarioId/<recurso>/:id
 */
function createRegistrosController(service) {
  return {
    listar(req, res) {
      res.json(service.listar(req.validated.params.usuarioId, req.validated.query));
    },
    obtener(req, res) {
      const { usuarioId, id } = req.validated.params;
      res.json(service.obtener(usuarioId, id));
    },
    crear(req, res) {
      const registro = service.crear(req.validated.params.usuarioId, req.validated.body);
      res.status(201).location(`${req.baseUrl}/${registro.id}`).json(registro);
    },
    actualizar(req, res) {
      const { usuarioId, id } = req.validated.params;
      res.json(service.actualizar(usuarioId, id, req.validated.body));
    },
    eliminar(req, res) {
      const { usuarioId, id } = req.validated.params;
      service.eliminar(usuarioId, id);
      res.status(204).end();
    },
  };
}

module.exports = { createRegistrosController };
