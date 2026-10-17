const { NotFoundError, ConflictError } = require('../errors');
const { esViolacionUnica } = require('../utils/sqlite');

function createUsuariosService({ usuariosRepository }) {
  function obtener(id) {
    const usuario = usuariosRepository.buscarPorId(id);
    if (!usuario) throw new NotFoundError(`No existe el usuario ${id}`);
    return usuario;
  }

  function guardar(operacion) {
    try {
      return operacion();
    } catch (err) {
      if (esViolacionUnica(err)) throw new ConflictError('Ya existe un usuario con ese email');
      throw err;
    }
  }

  return {
    listar: () => usuariosRepository.listar(),
    obtener,
    crear: (datos) => guardar(() => usuariosRepository.crear(datos)),
    actualizar(id, datos) {
      obtener(id);
      return guardar(() => usuariosRepository.actualizar(id, datos));
    },
    // Los registros de comida y agua del usuario se eliminan en cascada (ON DELETE CASCADE).
    eliminar(id) {
      obtener(id);
      usuariosRepository.eliminar(id);
    },
  };
}

module.exports = { createUsuariosService };
