const { crearAppDePrueba } = require('./helpers');

const nuevoAlimento = {
  nombre: 'Quinoa cocida',
  categoria: 'Cereales',
  calorias: 120,
  proteinas: 4.4,
  grasas: 1.9,
  carbohidratos: 21.3,
};

describe('/api/alimentos', () => {
  let api;
  beforeEach(() => {
    ({ api } = crearAppDePrueba());
  });

  describe('GET /api/alimentos', () => {
    test('devuelve el catálogo cargado por defecto, ordenado por nombre', async () => {
      const res = await api().get('/api/alimentos').expect(200).expect('Content-Type', /json/);
      expect(res.body.length).toBeGreaterThanOrEqual(20);
      const nombres = res.body.map((a) => a.nombre);
      expect(nombres).toEqual([...nombres].sort((a, b) => a.localeCompare(b, 'es')));
      expect(res.body[0]).toEqual(
        expect.objectContaining({ id: expect.any(Number), calorias: expect.any(Number), categoria: expect.any(String) }),
      );
    });

    test('filtra por texto (q) sin distinguir mayúsculas', async () => {
      const res = await api().get('/api/alimentos').query({ q: 'POLLO' }).expect(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].nombre).toBe('Pechuga de pollo cocida');
    });

    test('filtra por categoría', async () => {
      const res = await api().get('/api/alimentos').query({ categoria: 'Frutas' }).expect(200);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body.every((a) => a.categoria === 'Frutas')).toBe(true);
    });

    test('trata los comodines de LIKE como texto literal', async () => {
      const res = await api().get('/api/alimentos').query({ q: '%' }).expect(200);
      expect(res.body).toHaveLength(0);
    });
  });

  test('GET /api/alimentos/categorias lista las categorías sin repetir', async () => {
    const res = await api().get('/api/alimentos/categorias').expect(200);
    expect(res.body).toContain('Carnes');
    expect(new Set(res.body).size).toBe(res.body.length);
  });

  describe('GET /api/alimentos/:id', () => {
    test('devuelve el alimento', async () => {
      const res = await api().get('/api/alimentos/1').expect(200);
      expect(res.body.id).toBe(1);
    });

    test('404 si no existe', async () => {
      const res = await api().get('/api/alimentos/9999').expect(404);
      expect(res.body.error.mensaje).toMatch(/no existe/i);
    });

    test('400 si el id no es numérico', async () => {
      const res = await api().get('/api/alimentos/abc').expect(400);
      expect(res.body.error.detalles[0].campo).toBe('params.id');
    });
  });

  describe('POST /api/alimentos', () => {
    test('crea el alimento y responde 201 con Location', async () => {
      const res = await api().post('/api/alimentos').send(nuevoAlimento).expect(201);
      expect(res.body).toEqual({ id: expect.any(Number), ...nuevoAlimento });
      expect(res.headers.location).toBe(`/api/alimentos/${res.body.id}`);
      await api().get(res.headers.location).expect(200);
    });

    test('400 con el detalle de cada campo inválido', async () => {
      const res = await api()
        .post('/api/alimentos')
        .send({ nombre: '', categoria: 'X', calorias: -5, proteinas: 'mucho', grasas: 1 })
        .expect(400);
      const campos = res.body.error.detalles.map((d) => d.campo);
      expect(campos).toEqual(expect.arrayContaining(['body.nombre', 'body.calorias', 'body.proteinas', 'body.carbohidratos']));
    });

    test('400 si los macros superan 100 g cada 100 g', async () => {
      await api()
        .post('/api/alimentos')
        .send({ ...nuevoAlimento, proteinas: 60, grasas: 30, carbohidratos: 20 })
        .expect(400);
    });

    test('400 si se envían campos desconocidos', async () => {
      await api().post('/api/alimentos').send({ ...nuevoAlimento, id: 50 }).expect(400);
    });

    test('400 si el JSON está mal formado', async () => {
      const res = await api().post('/api/alimentos').set('Content-Type', 'application/json').send('{"nombre":').expect(400);
      expect(res.body.error.mensaje).toMatch(/JSON/);
    });

    test('409 si ya existe un alimento con ese nombre', async () => {
      await api()
        .post('/api/alimentos')
        .send({ ...nuevoAlimento, nombre: 'banana' })
        .expect(409);
    });
  });

  describe('PUT /api/alimentos/:id', () => {
    test('reemplaza el alimento', async () => {
      const res = await api().put('/api/alimentos/1').send(nuevoAlimento).expect(200);
      expect(res.body).toEqual({ id: 1, ...nuevoAlimento });
    });

    test('404 si no existe', async () => {
      await api().put('/api/alimentos/9999').send(nuevoAlimento).expect(404);
    });

    test('409 si el nombre ya lo usa otro alimento', async () => {
      await api().put('/api/alimentos/1').send({ ...nuevoAlimento, nombre: 'Manzana' }).expect(409);
    });
  });

  describe('DELETE /api/alimentos/:id', () => {
    test('elimina un alimento sin registros asociados (204)', async () => {
      const { body } = await api().post('/api/alimentos').send(nuevoAlimento).expect(201);
      await api().delete(`/api/alimentos/${body.id}`).expect(204);
      await api().get(`/api/alimentos/${body.id}`).expect(404);
    });

    test('409 si el alimento está usado en registros de comida', async () => {
      const res = await api().delete('/api/alimentos/1').expect(409);
      expect(res.body.error.mensaje).toMatch(/registro/);
    });

    test('404 si no existe', async () => {
      await api().delete('/api/alimentos/9999').expect(404);
    });
  });

  test('405 con header Allow para un verbo no soportado', async () => {
    const res = await api().patch('/api/alimentos/1').send({}).expect(405);
    expect(res.headers.allow).toBe('GET, PUT, DELETE, HEAD, OPTIONS');
  });
});
