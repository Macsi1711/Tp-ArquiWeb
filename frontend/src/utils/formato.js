const numero = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });

export const fmt = (valor) => numero.format(valor ?? 0);
export const kcal = (valor) => `${numero.format(Math.round(valor ?? 0))} kcal`;
export const gramos = (valor) => `${fmt(valor)} g`;
export const ml = (valor) => `${numero.format(valor ?? 0)} ml`;
