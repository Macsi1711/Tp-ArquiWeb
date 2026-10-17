const { crearAppDePrueba } = require('./helpers');
const { hoy } = require('../src/utils/fecha');

describe('GET /api/usuarios/:usuarioId/reportes/resumen-diario', () => {
  let api;
  beforeEach(() => {
    ({ api } = crearAppDePrueba());
  });

  const resumen = (usuarioId, query = {}) => api().get(`/api/usuarios/${usuarioId}/reportes/resumen-diario`).query(query);

  test('usa la fecha de hoy si no se indica', async () => {
    const res = await resumen(1).expect(200);
    expect(res.body.fecha).toBe(hoy());
    expect(res.body.usuario).toEqual({ id: 1, nombre: 'Ana López' });
  });

  test('los totales coinciden con la suma de los registros del día', async () => {
    const fecha = hoy();
    const [{ body: rep }, { body: comidas }, { body: agua }] = await Promise.all([
      resumen(1, { fecha }),
      api().get('/api/usuarios/1/comidas').query({ fecha }),
      api().get('/api/usuarios/1/agua').query({ fecha }),
    ]);
    const sumar = (campo) => comidas.reduce((acc, c) => acc + c[campo], 0);

    expect(rep.consumido.calorias).toBeCloseTo(sumar('calorias'), 0);
    expect(rep.consumido.proteinas).toBeCloseTo(sumar('proteinas'), 0);
    expect(rep.consumido.aguaMl).toBe(agua.reduce((acc, a) => acc + a.cantidadMl, 0));
    expect(rep.cantidadRegistros).toEqual({ comidas: comidas.length, agua: agua.length });
  });

  test('compara contra los objetivos del usuario (porcentaje y restante)', async () => {
    const { body } = await resumen(1).expect(200);
    expect(body.objetivo).toEqual({ calorias: 2000, proteinas: 120, grasas: 65, carbohidratos: 230, aguaMl: 2500 });
    expect(body.porcentaje.calorias).toBeCloseTo((body.consumido.calorias / 2000) * 100, 0);
    expect(body.restante.aguaMl).toBe(2500 - body.consumido.aguaMl);
  });

  test('desglosa por tipo de comida y la distribución calórica suma ~100%', async () => {
    const { body } = await resumen(1).expect(200);
    expect(body.porTipoComida.map((t) => t.tipoComida)).toEqual(['desayuno', 'almuerzo', 'merienda', 'cena', 'snack']);
    const kcalPorTipo = body.porTipoComida.reduce((acc, t) => acc + t.calorias, 0);
    expect(kcalPorTipo).toBeCloseTo(body.consumido.calorias, 0);
    const { proteinas, grasas, carbohidratos } = body.distribucionCalorica;
    expect(proteinas + grasas + carbohidratos).toBeCloseTo(100, 0);
  });

  test('un día sin registros devuelve todo en cero y el objetivo completo como restante', async () => {
    const { body } = await resumen(1, { fecha: '2020-01-01' }).expect(200);
    expect(body.consumido).toEqual({ calorias: 0, proteinas: 0, grasas: 0, carbohidratos: 0, aguaMl: 0 });
    expect(body.restante).toEqual(body.objetivo);
    expect(body.distribucionCalorica).toEqual({ proteinas: 0, grasas: 0, carbohidratos: 0 });
  });

  test('un registro nuevo impacta en el resumen y un exceso da restante negativo', async () => {
    const antes = (await resumen(1)).body;
    await api()
      .post('/api/usuarios/1/comidas')
      .send({ alimentoId: 24, fecha: hoy(), tipoComida: 'cena', gramos: 300 }) // 300 g de aceite de oliva
      .expect(201);
    const despues = (await resumen(1)).body;
    expect(despues.consumido.calorias).toBeCloseTo(antes.consumido.calorias + 884 * 3, 0);
    expect(despues.restante.calorias).toBeLessThan(0);
    expect(despues.porcentaje.calorias).toBeGreaterThan(100);
  });

  test('400 con fecha inválida y 404 con usuario inexistente', async () => {
    await resumen(1, { fecha: 'ayer' }).expect(400);
    await resumen(999).expect(404);
  });
});
