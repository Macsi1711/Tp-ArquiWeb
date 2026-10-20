const { crearAppDePrueba } = require('./helpers');

describe('Comportamiento general de la API', () => {
  let api;
  beforeEach(() => {
    ({ api } = crearAppDePrueba());
  });

  test('GET /api/health', async () => {
    await api().get('/api/health').expect(200, { estado: 'ok' });
  });

  test('404 en JSON para rutas inexistentes de la API', async () => {
    const res = await api().get('/api/no-existe').expect(404).expect('Content-Type', /json/);
    expect(res.body.error.status).toBe(404);
  });

  test('OPTIONS informa los verbos permitidos', async () => {
    const res = await api().options('/api/usuarios').expect(204);
    expect(res.headers.allow).toBe('GET, POST, HEAD, OPTIONS');
  });
});
