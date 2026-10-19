function redondear(valor, decimales = 1) {
  const factor = 10 ** decimales;
  return Math.round((Number(valor) || 0) * factor) / factor;
}

module.exports = { redondear };
