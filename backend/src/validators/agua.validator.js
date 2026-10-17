const { z } = require('zod');
const { fecha, numeroPositivo } = require('./comunes');

const aguaBody = z
  .object({
    fecha,
    cantidadMl: numeroPositivo(5000).int('La cantidad debe ser un número entero de ml'),
  })
  .strict();

module.exports = { aguaBody };
