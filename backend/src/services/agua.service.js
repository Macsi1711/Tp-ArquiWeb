const { NotFoundError } = require('../errors');

function createAguaService({ aguaRepository, usuariosService }) {
  function obtener(usuarioId, id) {
    usuariosService.obtener(usuarioId);
    const registro = aguaRepository.buscarPorId(usuarioId, id);
    if (!registro) throw new NotFoundError(`No existe el registro de agua ${id} para el usuario ${usuarioId}`);
    return registro;
  }

  return {
    listar(usuarioId, filtros) {
      usuariosService.obtener(usuarioId);
      return aguaRepository.listar(usuarioId, filtros);
    },
    obtener,
    crear(usuarioId, datos) {
      usuariosService.obtener(usuarioId);
      return aguaRepository.crear(usuarioId, datos);
    },
    actualizar(usuarioId, id, datos) {
      obtener(usuarioId, id);
      return aguaRepository.actualizar(usuarioId, id, datos);
    },
    eliminar(usuarioId, id) {
      obtener(usuarioId, id);
      aguaRepository.eliminar(usuarioId, id);
    },
  };
}

module.exports = { createAguaService };
