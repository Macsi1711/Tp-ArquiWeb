const COLUMNAS = 'id, nombre, categoria, calorias, proteinas, grasas, carbohidratos';

function createAlimentosRepository(db) {
  const stmts = {
    porId: db.prepare(`SELECT ${COLUMNAS} FROM alimentos WHERE id = ?`),
    categorias: db.prepare('SELECT DISTINCT categoria FROM alimentos ORDER BY categoria'),
    insertar: db.prepare(`
      INSERT INTO alimentos (nombre, categoria, calorias, proteinas, grasas, carbohidratos)
      VALUES (@nombre, @categoria, @calorias, @proteinas, @grasas, @carbohidratos)`),
    actualizar: db.prepare(`
      UPDATE alimentos SET nombre = @nombre, categoria = @categoria, calorias = @calorias,
        proteinas = @proteinas, grasas = @grasas, carbohidratos = @carbohidratos
      WHERE id = @id`),
    eliminar: db.prepare('DELETE FROM alimentos WHERE id = ?'),
    usos: db.prepare('SELECT COUNT(*) AS total FROM registros_comida WHERE alimento_id = ?'),
  };

  return {
    listar({ q, categoria } = {}) {
      const condiciones = [];
      const params = {};
      if (q) {
        condiciones.push("nombre LIKE @q ESCAPE '\\'");
        params.q = `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
      }
      if (categoria) {
        condiciones.push('categoria = @categoria COLLATE NOCASE');
        params.categoria = categoria;
      }
      const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
      return db.prepare(`SELECT ${COLUMNAS} FROM alimentos ${where} ORDER BY nombre`).all(params);
    },
    buscarPorId: (id) => stmts.porId.get(id),
    listarCategorias: () => stmts.categorias.all().map((f) => f.categoria),
    crear(datos) {
      const { lastInsertRowid } = stmts.insertar.run(datos);
      return stmts.porId.get(lastInsertRowid);
    },
    actualizar(id, datos) {
      stmts.actualizar.run({ ...datos, id });
      return stmts.porId.get(id);
    },
    eliminar: (id) => stmts.eliminar.run(id).changes > 0,
    contarUsos: (id) => stmts.usos.get(id).total,
  };
}

module.exports = { createAlimentosRepository };
