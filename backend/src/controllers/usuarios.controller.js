function createUsuariosController(usuariosService) {
  return {
    listar(req, res) {
      res.json(usuariosService.listar());
    },
    obtener(req, res) {
      res.json(usuariosService.obtener(req.validated.params.id));
    },
    crear(req, res) {
      const usuario = usuariosService.crear(req.validated.body);
      res.status(201).location(`${req.baseUrl}/${usuario.id}`).json(usuario);
    },
    actualizar(req, res) {
      res.json(usuariosService.actualizar(req.validated.params.id, req.validated.body));
    },
    eliminar(req, res) {
      usuariosService.eliminar(req.validated.params.id);
      res.status(204).end();
    },
  };
}

module.exports = { createUsuariosController };
