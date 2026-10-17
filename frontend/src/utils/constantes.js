export const TIPOS_COMIDA = [
  { valor: 'desayuno', etiqueta: 'Desayuno' },
  { valor: 'almuerzo', etiqueta: 'Almuerzo' },
  { valor: 'merienda', etiqueta: 'Merienda' },
  { valor: 'cena', etiqueta: 'Cena' },
  { valor: 'snack', etiqueta: 'Snack' },
];

export const etiquetaTipoComida = (valor) => TIPOS_COMIDA.find((t) => t.valor === valor)?.etiqueta ?? valor;

export const MACROS = [
  { clave: 'proteinas', etiqueta: 'Proteínas' },
  { clave: 'grasas', etiqueta: 'Grasas' },
  { clave: 'carbohidratos', etiqueta: 'Carbohidratos' },
];
