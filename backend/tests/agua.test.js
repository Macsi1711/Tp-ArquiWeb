const { crearAppDePrueba } = require('./helpers');
const { hoy } = require('../src/utils/fecha');

const BASE = '/api/usuarios/1/agua';

describe('/api/usuarios/:usuarioId/agua', () => {
  let api;
  beforeEach(() => {
    ({ api } = crearAppDePrueba());
  });

  test('GET lista el consumo de agua del día', async () => {
    const res = await api().get(BASE).query({ fecha: hoy() }).expect(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toEqual(
      expect.objectContaining({ id: expect.any(Number), usuarioId: 1, fecha: hoy(), cantidadMl: expect.any(Number) }),
    );
  });

  test('POST registra un vaso de agua (201 + Location)', async () => {
    const res = await api().post(BASE).send({ fecha: hoy(), cantidadMl: 300 }).expect(201);
    expect(res.body).toEqual(expect.objectContaining({ fecha: hoy(), cantidadMl: 300 }));
    expect(res.headers.location).toBe(`${BASE}/${res.body.id}`);
  });

  test('POST 400 con cantidad no positiva, no entera o fecha faltante', async () => {
    await api().post(BASE).send({ fecha: hoy(), cantidadMl: -1 }).expect(400);
    await api().post(BASE).send({ fecha: hoy(), cantidadMl: 250.5 }).expect(400);
    const res = await api().post(BASE).send({ cantidadMl: 250 }).expect(400);
    expect(res.body.error.detalles[0].campo).toBe('body.fecha');
  });

  test('PUT modifica la cantidad', async () => {
    const { body } = await api().post(BASE).send({ fecha: hoy(), cantidadMl: 300 });
    const res = await api().put(`${BASE}/${body.id}`).send({ fecha: hoy(), cantidadMl: 750 }).expect(200);
    expect(res.body.cantidadMl).toBe(750);
  });

  test('DELETE elimina el registro y luego responde 404', async () => {
    const { body } = await api().post(BASE).send({ fecha: hoy(), cantidadMl: 300 });
    await api().delete(`${BASE}/${body.id}`).expect(204);
    await api().get(`${BASE}/${body.id}`).expect(404);
  });

  test('404 si el usuario no existe', async () => {
    await api().post('/api/usuarios/999/agua').send({ fecha: hoy(), cantidadMl: 250 }).expect(404);
  });
});
