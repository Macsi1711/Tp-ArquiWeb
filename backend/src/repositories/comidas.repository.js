const SELECT = `
  SELECT rc.id, rc.usuario_id AS usuarioId, rc.alimento_id AS alimentoId, a.nombre AS alimentoNombre,
    rc.fecha, rc.tipo_comida AS tipoComida, rc.gramos,
    a.calorias * rc.gramos / 100 AS calorias,
    a.proteinas * rc.gramos / 100 AS proteinas,
    a.grasas * rc.gramos / 100 AS grasas,
    a.carbohidratos * rc.gramos / 100 AS carbohidratos,
    rc.creado_en AS creadoEn
  FROM registros_comida rc
  JOIN alimentos a ON a.id = rc.alimento_id`;

const ORDEN = `
  ORDER BY rc.fecha,
    CASE rc.tipo_comida WHEN 'desayuno' THEN 1 WHEN 'almuerzo' THEN 2 WHEN 'merienda' THEN 3 WHEN 'cena' THEN 4 ELSE 5 END,
    rc.id`;

function createComidasRepository(db) {
  const stmts = {
    porId: db.prepare(`${SELECT} WHERE rc.id = ? AND rc.usuario_id = ?`),
    insertar: db.prepare(`
      INSERT INTO registros_comida (usuario_id, alimento_id, fecha, tipo_comida, gramos)
      VALUES (@usuarioId, @alimentoId, @fecha, @tipoComida, @gramos)`),
    actualizar: db.prepare(`
      UPDATE registros_comida SET alimento_id = @alimentoId, fecha = @fecha, tipo_comida = @tipoComida, gramos = @gramos
      WHERE id = @id AND usuario_id = @usuarioId`),
    eliminar: db.prepare('DELETE FROM registros_comida WHERE id = ? AND usuario_id = ?'),
  };

  return {
    listar(usuarioId, { fecha, desde, hasta, tipoComida } = {}) {
      const condiciones = ['rc.usuario_id = @usuarioId'];
      if (fecha) condiciones.push('rc.fecha = @fecha');
      if (desde) condiciones.push('rc.fecha >= @desde');
      if (hasta) condiciones.push('rc.fecha <= @hasta');
      if (tipoComida) condiciones.push('rc.tipo_comida = @tipoComida');
      return db
        .prepare(`${SELECT} WHERE ${condiciones.join(' AND ')} ${ORDEN}`)
        .all({ usuarioId, fecha, desde, hasta, tipoComida });
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

module.exports = { createComidasRepository };
