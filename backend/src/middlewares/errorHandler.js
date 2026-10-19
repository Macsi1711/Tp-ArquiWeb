const { HttpError } = require('../utils/errors');

function notFound(req, res, next) {
  next(new HttpError(404, `No existe el recurso ${req.method} ${req.originalUrl}`));
}

function errorHandler(err, req, res, next) {
  if (err.type === 'entity.parse.failed') {
    err = new HttpError(400, 'El cuerpo de la petición no es un JSON válido');
  } else if (err.type === 'entity.too.large') {
    err = new HttpError(413, 'El cuerpo de la petición es demasiado grande');
  }

  if (!(err instanceof HttpError)) {
    console.error(err);
    err = new HttpError(500, 'Error interno del servidor');
  }

  const body = { error: { status: err.status, mensaje: err.message } };
  if (err.details) body.error.detalles = err.details;
  res.status(err.status).json(body);
}

module.exports = { notFound, errorHandler };
