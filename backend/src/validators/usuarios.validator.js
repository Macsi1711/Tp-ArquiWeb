const { z } = require('zod');
const { OBLIGATORIO, textoNoVacio, numeroNoNegativo, numeroPositivo } = require('./comunes');

const usuarioBody = z
  .object({
    nombre: textoNoVacio(),
    email: z
      .string({ required_error: OBLIGATORIO, invalid_type_error: 'Debe ser texto' })
      .trim()
      .toLowerCase()
      .email('El email no es válido')
      .max(120),
    objetivoCalorias: numeroPositivo(10000).int('Debe ser un número entero'),
    objetivoProteinas: numeroNoNegativo(1000),
    objetivoGrasas: numeroNoNegativo(1000),
    objetivoCarbohidratos: numeroNoNegativo(2000),
    objetivoAguaMl: numeroPositivo(10000).int('Debe ser un número entero'),
  })
  .strict();

module.exports = { usuarioBody };
