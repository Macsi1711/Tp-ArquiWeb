const { z } = require('zod');
const { textoNoVacio, numeroNoNegativo } = require('./comunes');

const alimentoBody = z
  .object({
    nombre: textoNoVacio(),
    categoria: textoNoVacio(50),
    calorias: numeroNoNegativo(900),
    proteinas: numeroNoNegativo(100),
    grasas: numeroNoNegativo(100),
    carbohidratos: numeroNoNegativo(100),
  })
  .strict()
  .refine((a) => a.proteinas + a.grasas + a.carbohidratos <= 100, {
    message: 'La suma de macronutrientes no puede superar los 100 g cada 100 g de alimento',
    path: ['proteinas'],
  });

const listarAlimentosQuery = z.object({
  q: z.string().trim().max(100).optional(),
  categoria: z.string().trim().max(50).optional(),
});

module.exports = { alimentoBody, listarAlimentosQuery };
