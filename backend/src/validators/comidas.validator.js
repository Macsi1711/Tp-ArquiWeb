const { z } = require('zod');
const { idReferencia, fecha, numeroPositivo, filtroFechas } = require('./comunes');

const TIPOS_COMIDA = ['desayuno', 'almuerzo', 'merienda', 'cena', 'snack'];

const tipoComida = z.enum(TIPOS_COMIDA, {
  errorMap: () => ({ message: `El tipo de comida debe ser uno de: ${TIPOS_COMIDA.join(', ')}` }),
});

const comidaBody = z
  .object({
    alimentoId: idReferencia,
    fecha,
    tipoComida,
    gramos: numeroPositivo(5000),
  })
  .strict();

const listarComidasQuery = filtroFechas.and(z.object({ tipoComida: tipoComida.optional() }));

module.exports = { TIPOS_COMIDA, comidaBody, listarComidasQuery };
