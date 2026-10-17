const SELECT = `
  SELECT id, usuario_id AS usuarioId, fecha, cantidad_ml AS cantidadMl, creado_en AS creadoEn
  FROM registros_agua`;

function createAguaRepository(db) {
  const stmts = {
    porId: db.prepare(`${SELECT} WHERE id = ? AND usuario_id = ?`),
    insertar: db.prepare(`
      INSERT INTO registros_agua (usuario_id, fecha, cantidad_ml) VALUES (@usuarioId, @fecha, @cantidadMl)`),
    actualizar: db.prepare(`
      UPDATE registros_agua SET fecha = @fecha, cantidad_ml = @cantidadMl WHERE id = @id AND usuario_id = @usuarioId`),
    eliminar: db.prepare('DELETE FROM registros_agua WHERE id = ? AND usuario_id = ?'),
  };

  return {
    listar(usuarioId, { fecha, desde, hasta } = {}) {
      const condiciones = ['usuario_id = @usuarioId'];
      if (fecha) condiciones.push('fecha = @fecha');
      if (desde) condiciones.push('fecha >= @desde');
      if (hasta) condiciones.push('fecha <= @hasta');
      return db
        .prepare(`${SELECT} WHERE ${condiciones.join(' AND ')} ORDER BY fecha, id`)
        .all({ usuarioId, fecha, desde, hasta });
    },
    buscarPorId: (usuarioId, id) => stmts.porId.get(id, usuarioId),
    crear(usuarioId, datos) {
      const { lastInsertRowid } = stmts.insertar.run({ ...datos, usuarioId });
      return stmts.porId.get(lastInsertRowid, usuarioId);
    },
    actualizar(usuarioId, id, datos) {
      stmts.actualizar.run({ ...datos, id, usuarioId });
      return stmts.porId.get(id, usuarioId);
    },
    eliminar: (usuarioId, id) => stmts.eliminar.run(id, usuarioId).changes > 0,
  };
}

module.exports = { createAguaRepository };
