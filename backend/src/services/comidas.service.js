const { NotFoundError, HttpError } = require('../errors');
const { redondear } = require('../utils/numeros');

function formatear(registro) {
  const { alimentoNombre, ...resto } = registro;
  return {
    ...resto,
    alimento: { id: registro.alimentoId, nombre: alimentoNombre },
    calorias: redondear(registro.calorias),
    proteinas: redondear(registro.proteinas),
    grasas: redondear(registro.grasas),
    carbohidratos: redondear(registro.carbohidratos),
  };
}

function createComidasService({ comidasRepository, alimentosRepository, usuariosService }) {
  function validarAlimento(alimentoId) {
    if (!alimentosRepository.buscarPorId(alimentoId)) {
      throw new HttpError(422, `El alimento ${alimentoId} no existe`);
    }
  }

  function obtener(usuarioId, id) {
    usuariosService.obtener(usuarioId);
    const registro = comidasRepository.buscarPorId(usuarioId, id);
    if (!registro) throw new NotFoundError(`No existe el registro de comida ${id} para el usuario ${usuarioId}`);
    return formatear(registro);
  }

  return {
    listar(usuarioId, filtros) {
      usuariosService.obtener(usuarioId);
      return comidasRepository.listar(usuarioId, filtros).map(formatear);
    },
    obtener,
    crear(usuarioId, datos) {
      usuariosService.obtener(usuarioId);
      validarAlimento(datos.alimentoId);
      return formatear(comidasRepository.crear(usuarioId, datos));
    },
    actualizar(usuarioId, id, datos) {
      obtener(usuarioId, id);
      validarAlimento(datos.alimentoId);
      return formatear(comidasRepository.actualizar(usuarioId, id, datos));
    },
    eliminar(usuarioId, id) {
      obtener(usuarioId, id);
      comidasRepository.eliminar(usuarioId, id);
    },
  };
}

module.exports = { createComidasService };
