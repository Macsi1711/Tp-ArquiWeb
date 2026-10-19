const { restarDias } = require('../utils/fecha');

const ALIMENTOS = [
  ['Pechuga de pollo cocida', 'Carnes', 165, 31, 3.6, 0],
  ['Carne vacuna magra cocida', 'Carnes', 217, 26, 12, 0],
  ['Salmón cocido', 'Pescados', 208, 20, 13, 0],
  ['Atún al natural', 'Pescados', 116, 26, 1, 0],
  ['Huevo entero', 'Huevos y lácteos', 155, 13, 11, 1.1],
  ['Leche descremada', 'Huevos y lácteos', 35, 3.4, 0.1, 5],
  ['Yogur natural', 'Huevos y lácteos', 61, 3.5, 3.3, 4.7],
  ['Queso cremoso', 'Huevos y lácteos', 280, 20, 22, 2],
  ['Arroz blanco cocido', 'Cereales', 130, 2.7, 0.3, 28],
  ['Fideos cocidos', 'Cereales', 158, 5.8, 0.9, 31],
  ['Avena arrollada', 'Cereales', 389, 16.9, 6.9, 66.3],
  ['Pan blanco', 'Cereales', 265, 9, 3.2, 49],
  ['Papa hervida', 'Verduras', 87, 1.9, 0.1, 20],
  ['Batata asada', 'Verduras', 90, 2, 0.2, 21],
  ['Brócoli', 'Verduras', 34, 2.8, 0.4, 7],
  ['Lechuga', 'Verduras', 15, 1.4, 0.2, 2.9],
  ['Tomate', 'Verduras', 18, 0.9, 0.2, 3.9],
  ['Banana', 'Frutas', 89, 1.1, 0.3, 23],
  ['Manzana', 'Frutas', 52, 0.3, 0.2, 14],
  ['Naranja', 'Frutas', 47, 0.9, 0.1, 12],
  ['Lentejas cocidas', 'Legumbres', 116, 9, 0.4, 20],
  ['Almendras', 'Frutos secos', 579, 21, 50, 22],
  ['Mantequilla de maní', 'Frutos secos', 588, 25, 50, 20],
  ['Aceite de oliva', 'Grasas y aceites', 884, 0, 100, 0],
  ['Palta', 'Frutas', 160, 2, 15, 9],
];

const USUARIOS = [
  { nombre: 'Ana López', email: 'ana@nutritrack.test', calorias: 2000, proteinas: 120, grasas: 65, carbohidratos: 230, aguaMl: 2500 },
  { nombre: 'Juan Pérez', email: 'juan@nutritrack.test', calorias: 2600, proteinas: 160, grasas: 80, carbohidratos: 300, aguaMl: 3000 },
];

const PLAN_DIARIO = [
  ['desayuno', 'Avena arrollada', 60],
  ['desayuno', 'Leche descremada', 250],
  ['desayuno', 'Banana', 120],
  ['almuerzo', 'Pechuga de pollo cocida', 180],
  ['almuerzo', 'Arroz blanco cocido', 200],
  ['almuerzo', 'Brócoli', 100],
  ['almuerzo', 'Aceite de oliva', 10],
  ['merienda', 'Yogur natural', 200],
  ['merienda', 'Almendras', 25],
  ['cena', 'Salmón cocido', 150],
  ['cena', 'Batata asada', 200],
  ['cena', 'Lechuga', 80],
  ['snack', 'Manzana', 150],
];

const DIAS_DE_HISTORIA = 7;

function seedIfEmpty(db) {
  const { total } = db.prepare('SELECT COUNT(*) AS total FROM usuarios').get();
  const { totalAlimentos } = db.prepare('SELECT COUNT(*) AS totalAlimentos FROM alimentos').get();
  if (total > 0 || totalAlimentos > 0) return false;
  seed(db);
  return true;
}

function seed(db) {
  const insertAlimento = db.prepare(`
    INSERT INTO alimentos (nombre, categoria, calorias, proteinas, grasas, carbohidratos)
    VALUES (?, ?, ?, ?, ?, ?)`);
  const insertUsuario = db.prepare(`
    INSERT INTO usuarios (nombre, email, objetivo_calorias, objetivo_proteinas, objetivo_grasas, objetivo_carbohidratos, objetivo_agua_ml)
    VALUES (@nombre, @email, @calorias, @proteinas, @grasas, @carbohidratos, @aguaMl)`);
  const insertComida = db.prepare(`
    INSERT INTO registros_comida (usuario_id, alimento_id, fecha, tipo_comida, gramos) VALUES (?, ?, ?, ?, ?)`);
  const insertAgua = db.prepare(`
    INSERT INTO registros_agua (usuario_id, fecha, cantidad_ml) VALUES (?, ?, ?)`);

  db.transaction(() => {
    const idsAlimentos = new Map();
    for (const fila of ALIMENTOS) {
      const { lastInsertRowid } = insertAlimento.run(...fila);
      idsAlimentos.set(fila[0], lastInsertRowid);
    }

    USUARIOS.forEach((usuario, indiceUsuario) => {
      const { lastInsertRowid: usuarioId } = insertUsuario.run(usuario);
      const escala = usuario.calorias / USUARIOS[0].calorias;

      for (let dia = 0; dia < DIAS_DE_HISTORIA; dia++) {
        const fecha = restarDias(dia);
        const plan = dia === 0 ? PLAN_DIARIO.filter(([tipo]) => tipo !== 'cena' && tipo !== 'snack') : PLAN_DIARIO;
        plan.forEach(([tipo, alimento, gramos], i) => {
          const variacion = 1 + (((dia + i + indiceUsuario) % 5) - 2) * 0.08;
          insertComida.run(usuarioId, idsAlimentos.get(alimento), fecha, tipo, Math.round(gramos * escala * variacion));
        });

        const vasos = dia === 0 ? 4 : 7 + ((dia + indiceUsuario) % 4);
        for (let v = 0; v < vasos; v++) insertAgua.run(usuarioId, fecha, v % 3 === 0 ? 500 : 250);
      }
    });
  })();
}

module.exports = { seed, seedIfEmpty };
