const { ValidationError } = require('../errors');

/**
 * Valida params, query y body con esquemas zod. Los datos ya parseados
 * (con tipos convertidos y valores por defecto) quedan en req.validated.
 */
function validate(schemas) {
  return (req, res, next) => {
    const errores = [];
    req.validated = {};
    for (const parte of ['params', 'query', 'body']) {
      const schema = schemas[parte];
      if (!schema) continue;
      const resultado = schema.safeParse(req[parte] ?? {});
      if (resultado.success) {
        req.validated[parte] = resultado.data;
      } else {
        for (const issue of resultado.error.issues) {
          errores.push({ campo: [parte, ...issue.path].join('.'), mensaje: issue.message });
        }
      }
    }
    if (errores.length) return next(new ValidationError('Los datos enviados no son válidos', errores));
    next();
  };
}

module.exports = { validate };
