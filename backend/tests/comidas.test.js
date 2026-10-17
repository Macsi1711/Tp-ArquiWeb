const { crearAppDePrueba } = require('./helpers');
const { hoy, restarDias } = require('../src/utils/fecha');

const BASE = '/api/usuarios/1/comidas';

describe('/api/usuarios/:usuarioId/comidas', () => {
  let api;
  beforeEach(() => {
    ({ api } = crearAppDePrueba());
  });

  describe('GET', () => {
    test('lista los registros de una fecha con los macros calculados', async () => {
      const res = await api().get(BASE).query({ fecha: hoy() }).expect(200);
      expect(res.body.length).toBeGreaterThan(0);
      for (const r of res.body) {
        expect(r.fecha).toBe(hoy());
        expect(r.usuarioId).toBe(1);
        expect(r.alimento).toEqual({ id: r.alimentoId, nombre: expect.any(String) });
      }
    });

    test('ordena por tipo de comida dentro del día', async () => {
      const res = await api().get(BASE).query({ fecha: restarDias(1) }).expect(200);
      const orden = ['desayuno', 'almuerzo', 'merienda', 'cena', 'snack'];
      const indices = res.body.map((r) => orden.indexOf(r.tipoComida));
      expect(indices).toEqual([...indices].sort((a, b) => a - b));
    });

    test('filtra por rango de fechas y tipo de comida', async () => {
      const res = await api()
        .get(BASE)
        .query({ desde: restarDias(3), hasta: restarDias(1), tipoComida: 'cena' })
        .expect(200);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body.every((r) => r.tipoComida === 'cena' && r.fecha >= restarDias(3) && r.fecha <= restarDias(1))).toBe(true);
    });

    test('400 si se combinan fecha y rango o el rango está invertido', async () => {
      await api().get(BASE).query({ fecha: hoy(), desde: hoy() }).expect(400);
      await api().get(BASE).query({ desde: hoy(), hasta: restarDias(2) }).expect(400);
    });

    test('400 con una fecha inexistente en el calendario', async () => {
      await api().get(BASE).query({ fecha: '2025-02-30' }).expect(400);
    });

    test('404 si el usuario no existe', async () => {
      await api().get('/api/usuarios/999/comidas').expect(404);
    });

    test('no expone registros de otro usuario', async () => {
      const { body } = await api().get('/api/usuarios/2/comidas').query({ fecha: hoy() });
      await api().get(`${BASE}/${body[0].id}`).expect(404);
    });
  });

  describe('POST', () => {
    test('crea el registro y calcula los macros según los gramos', async () => {
      const pollo = (await api().get('/api/alimentos').query({ q: 'pollo' })).body[0];
      const res = await api()
        .post(BASE)
        .send({ alimentoId: pollo.id, fecha: hoy(), tipoComida: 'cena', gramos: 200 })
        .expect(201);
      expect(res.headers.location).toBe(`${BASE}/${res.body.id}`);
      expect(res.body).toEqual(
        expect.objectContaining({
          tipoComida: 'cena',
          gramos: 200,
          calorias: pollo.calorias * 2,
          proteinas: pollo.proteinas * 2,
          grasas: pollo.grasas * 2,
          carbohidratos: pollo.carbohidratos * 2,
        }),
      );
    });

    test('400 con tipo de comida o gramos inválidos', async () => {
      const res = await api()
        .post(BASE)
        .send({ alimentoId: 1, fecha: hoy(), tipoComida: 'brunch', gramos: 0 })
        .expect(400);
      const campos = res.body.error.detalles.map((d) => d.campo);
      expect(campos).toEqual(expect.arrayContaining(['body.tipoComida', 'body.gramos']));
    });

    test('422 si el alimento no existe', async () => {
      await api().post(BASE).send({ alimentoId: 9999, fecha: hoy(), tipoComida: 'cena', gramos: 100 }).expect(422);
    });

    test('404 si el usuario no existe', async () => {
      await api()
        .post('/api/usuarios/999/comidas')
        .send({ alimentoId: 1, fecha: hoy(), tipoComida: 'cena', gramos: 100 })
        .expect(404);
    });
  });

  describe('GET /:id, PUT y DELETE', () => {
    let registro;
    beforeEach(async () => {
      registro = (await api().get(BASE).query({ fecha: hoy() })).body[0];
    });

    test('GET devuelve el registro', async () => {
      const res = await api().get(`${BASE}/${registro.id}`).expect(200);
      expect(res.body).toEqual(registro);
    });

    test('PUT modifica gramos y tipo de comida', async () => {
      const res = await api()
        .put(`${BASE}/${registro.id}`)
        .send({ alimentoId: registro.alimentoId, fecha: registro.fecha, tipoComida: 'snack', gramos: registro.gramos * 2 })
        .expect(200);
      expect(res.body.tipoComida).toBe('snack');
      expect(res.body.calorias).toBeCloseTo(registro.calorias * 2, 0);
    });

    test('PUT 422 si el alimento no existe', async () => {
      await api()
        .put(`${BASE}/${registro.id}`)
        .send({ alimentoId: 9999, fecha: registro.fecha, tipoComida: 'snack', gramos: 10 })
        .expect(422);
    });

    test('DELETE elimina el registro', async () => {
      await api().delete(`${BASE}/${registro.id}`).expect(204);
      await api().get(`${BASE}/${registro.id}`).expect(404);
      await api().delete(`${BASE}/${registro.id}`).expect(404);
    });
  });
});
