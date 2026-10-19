function formatearFecha(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function hoy() {
  return formatearFecha(new Date());
}

function restarDias(dias, desde = new Date()) {
  const date = new Date(desde);
  date.setDate(date.getDate() - dias);
  return formatearFecha(date);
}

function esFechaValida(valor) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const [y, m, d] = valor.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

module.exports = { formatearFecha, hoy, restarDias, esFechaValida };
