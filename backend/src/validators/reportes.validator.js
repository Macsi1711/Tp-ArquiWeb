const { z } = require('zod');
const { fecha } = require('./comunes');
const { hoy } = require('../utils/fecha');

const resumenDiarioQuery = z.object({ fecha: fecha.optional().transform((f) => f ?? hoy()) });

module.exports = { resumenDiarioQuery };
