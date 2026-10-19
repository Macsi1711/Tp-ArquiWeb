const { z } = require('zod');
const { esFechaValida } = require('../utils/fecha');

z.setErrorMap((issue, ctx) => {
  if (issue.code === z.ZodIssueCode.unrecognized_keys) {
    return { message: `Campos no permitidos: ${issue.keys.join(', ')}` };
  }
  if (issue.code === z.ZodIssueCode.invalid_type && issue.received === 'undefined') {
    return { message: 'Este campo es obligatorio' };
  }
  return { message: ctx.defaultError };
});

const id = z.coerce.number({ invalid_type_error: 'Debe ser un número' }).int('Debe ser un número entero').positive('Debe ser mayor a 0');

const idReferencia = z
  .number({ invalid_type_error: 'Debe ser un número' })
  .int('Debe ser un número entero')
  .positive('Debe ser mayor a 0');

const fecha = z
  .string({ required_error: 'La fecha es obligatoria', invalid_type_error: 'Debe ser texto con formato YYYY-MM-DD' })
  .refine(esFechaValida, 'Debe ser una fecha válida con formato YYYY-MM-DD');

const OBLIGATORIO = 'Este campo es obligatorio';

const textoNoVacio = (max = 100) =>
  z
    .string({ required_error: OBLIGATORIO, invalid_type_error: 'Debe ser texto' })
    .trim()
    .min(1, OBLIGATORIO)
    .max(max, `Admite hasta ${max} caracteres`);

const numeroNoNegativo = (max) =>
  z
    .number({ required_error: OBLIGATORIO, invalid_type_error: 'Debe ser un número' })
    .nonnegative('No puede ser negativo')
    .max(max, `No puede superar ${max}`);

const numeroPositivo = (max) =>
  z
    .number({ required_error: OBLIGATORIO, invalid_type_error: 'Debe ser un número' })
    .positive('Debe ser mayor a 0')
    .max(max, `No puede superar ${max}`);

const paramsId = z.object({ id });
const paramsUsuario = z.object({ usuarioId: id });
const paramsUsuarioRegistro = z.object({ usuarioId: id, id });

const filtroFechas = z
  .object({ fecha: fecha.optional(), desde: fecha.optional(), hasta: fecha.optional() })
  .refine((q) => !(q.fecha && (q.desde || q.hasta)), {
    message: 'Use "fecha" o el rango "desde"/"hasta", no ambos',
    path: ['fecha'],
  })
  .refine((q) => !(q.desde && q.hasta && q.desde > q.hasta), {
    message: '"desde" no puede ser posterior a "hasta"',
    path: ['desde'],
  });

module.exports = {
  OBLIGATORIO,
  id,
  idReferencia,
  fecha,
  textoNoVacio,
  numeroNoNegativo,
  numeroPositivo,
  paramsId,
  paramsUsuario,
  paramsUsuarioRegistro,
  filtroFechas,
};
