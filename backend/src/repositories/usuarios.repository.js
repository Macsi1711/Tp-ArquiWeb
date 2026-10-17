const SELECT = `
  SELECT id, nombre, email,
    objetivo_calorias AS objetivoCalorias,
    objetivo_proteinas AS objetivoProteinas,
    objetivo_grasas AS objetivoGrasas,
    objetivo_carbohidratos AS objetivoCarbohidratos,
    objetivo_agua_ml AS objetivoAguaMl,
    creado_en AS creadoEn
  FROM usuarios`;

function createUsuariosRepository(db) {
  const stmts = {
    todos: db.prepare(`${SELECT} ORDER BY nombre`),
    porId: db.prepare(`${SELECT} WHERE id = ?`),
    insertar: db.prepare(`
      INSERT INTO usuarios (nombre, email, objetivo_calorias, objetivo_proteinas, objetivo_grasas, objetivo_carbohidratos, objetivo_agua_ml)
      VALUES (@nombre, @email, @objetivoCalorias, @objetivoProteinas, @objetivoGrasas, @objetivoCarbohidratos, @objetivoAguaMl)`),
    actualizar: db.prepare(`
      UPDATE usuarios SET nombre = @nombre, email = @email,
        objetivo_calorias = @objetivoCalorias, objetivo_proteinas = @objetivoProteinas,
        objetivo_grasas = @objetivoGrasas, objetivo_carbohidratos = @objetivoCarbohidratos,
        objetivo_agua_ml = @objetivoAguaMl
      WHERE id = @id`),
    eliminar: db.prepare('DELETE FROM usuarios WHERE id = ?'),
  };

  return {
    listar: () => stmts.todos.all(),
    buscarPorId: (id) => stmts.porId.get(id),
    crear(datos) {
      const { lastInsertRowid } = stmts.insertar.run(datos);
      return stmts.porId.get(lastInsertRowid);
    },
    actualizar(id, datos) {
      stmts.actualizar.run({ ...datos, id });
      return stmts.porId.get(id);
    },
    eliminar: (id) => stmts.eliminar.run(id).changes > 0,
  };
}

module.exports = { createUsuariosRepository };
