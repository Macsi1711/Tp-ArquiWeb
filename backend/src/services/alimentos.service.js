const { NotFoundError, ConflictError } = require('../errors');
const { esViolacionUnica } = require('../utils/sqlite');

function createAlimentosService({ alimentosRepository }) {
  function obtener(id) {
    const alimento = alimentosRepository.buscarPorId(id);
    if (!alimento) throw new NotFoundError(`No existe el alimento ${id}`);
    return alimento;
  }

  function guardar(operacion) {
    try {
      return operacion();
    } catch (err) {
      if (esViolacionUnica(err)) throw new ConflictError('Ya existe un alimento con ese nombre');
      throw err;
    }
  }

  return {
    listar: (filtros) => alimentosRepository.listar(filtros),
    listarCategorias: () => alimentosRepository.listarCategorias(),
    obtener,
    crear: (datos) => guardar(() => alimentosRepository.crear(datos)),
    actualizar(id, datos) {
      obtener(id);
      return guardar(() => alimentosRepository.actualizar(id, datos));
    },
    eliminar(id) {
      obtener(id);
      const usos = alimentosRepository.contarUsos(id);
      if (usos > 0) {
        throw new ConflictError(`No se puede eliminar: el alimento se usa en ${usos} registro(s) de comida`);
      }
      alimentosRepository.eliminar(id);
    },
  };
}

module.exports = { createAlimentosService };
