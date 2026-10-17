const { crearAppDePrueba } = require('./helpers');

const nuevoUsuario = {
  nombre: 'Lucía Gómez',
  email: 'lucia@nutritrack.test',
  objetivoCalorias: 1800,
  objetivoProteinas: 100,
  objetivoGrasas: 60,
  objetivoCarbohidratos: 210,
  objetivoAguaMl: 2000,
};

describe('/api/usuarios', () => {
  let api;
  let db;
  beforeEach(() => {
    ({ api, db } = crearAppDePrueba());
  });

  test('GET lista los usuarios de ejemplo', async () => {
    const res = await api().get('/api/usuarios').expect(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toEqual(expect.objectContaining({ nombre: 'Ana López', objetivoCalorias: 2000 }));
  });

  test('GET /:id devuelve el usuario y 404 si no existe', async () => {
    await api().get('/api/usuarios/1').expect(200);
    await api().get('/api/usuarios/999').expect(404);
  });

  test('POST crea un usuario (201 + Location) normalizando el email', async () => {
    const res = await api()
      .post('/api/usuarios')
      .send({ ...nuevoUsuario, email: '  Lucia@NutriTrack.test ' })
      .expect(201);
    expect(res.body).toEqual(expect.objectContaining({ ...nuevoUsuario, id: expect.any(Number) }));
    expect(res.headers.location).toBe(`/api/usuarios/${res.body.id}`);
  });

  test('POST 400 si faltan objetivos o el email es inválido', async () => {
    const res = await api().post('/api/usuarios').send({ nombre: 'X', email: 'no-es-email' }).expect(400);
    const campos = res.body.error.detalles.map((d) => d.campo);
    expect(campos).toEqual(expect.arrayContaining(['body.email', 'body.objetivoCalorias', 'body.objetivoAguaMl']));
  });

  test('POST 409 si el email ya está registrado', async () => {
    await api()
      .post('/api/usuarios')
      .send({ ...nuevoUsuario, email: 'ANA@nutritrack.test' })
      .expect(409);
  });

  test('PUT actualiza los objetivos', async () => {
    const res = await api()
      .put('/api/usuarios/1')
      .send({ ...nuevoUsuario, email: 'ana@nutritrack.test', objetivoCalorias: 2200 })
      .expect(200);
    expect(res.body.objetivoCalorias).toBe(2200);
  });

  test('PUT 404 si no existe', async () => {
    await api().put('/api/usuarios/999').send(nuevoUsuario).expect(404);
  });

  test('DELETE elimina el usuario y sus registros en cascada', async () => {
    await api().delete('/api/usuarios/1').expect(204);
    await api().get('/api/usuarios/1').expect(404);
    await api().get('/api/usuarios/1/comidas').expect(404);
    const cuenta = (tabla) => db.prepare(`SELECT COUNT(*) AS n FROM ${tabla} WHERE usuario_id = 1`).get().n;
    expect(cuenta('registros_comida')).toBe(0);
    expect(cuenta('registros_agua')).toBe(0);
  });

  test('DELETE 404 si no existe', async () => {
    await api().delete('/api/usuarios/999').expect(404);
  });
});
