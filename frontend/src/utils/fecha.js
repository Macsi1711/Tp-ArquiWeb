export function formatearFecha(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const hoy = () => formatearFecha(new Date());

export function sumarDias(fecha, dias) {
  const [y, m, d] = fecha.split('-').map(Number);
  return formatearFecha(new Date(y, m - 1, d + dias));
}

export function fechaLarga(fecha) {
  const [y, m, d] = fecha.split('-').map(Number);
  return new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(
    new Date(y, m - 1, d),
  );
}

/** El backend guarda creadoEn en UTC ("YYYY-MM-DD HH:MM:SS"); se muestra en hora local. */
export function horaLocal(creadoEn) {
  const date = new Date(`${creadoEn.replace(' ', 'T')}Z`);
  return new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit' }).format(date);
}
