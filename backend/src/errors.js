class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.details = details;
  }
}

class ValidationError extends HttpError {
  constructor(message = 'Datos inválidos', details) {
    super(400, message, details);
  }
}

class NotFoundError extends HttpError {
  constructor(message = 'Recurso no encontrado') {
    super(404, message);
  }
}

class ConflictError extends HttpError {
  constructor(message = 'Conflicto con el estado actual del recurso') {
    super(409, message);
  }
}

module.exports = { HttpError, ValidationError, NotFoundError, ConflictError };
