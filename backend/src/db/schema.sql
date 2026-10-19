CREATE TABLE IF NOT EXISTS usuarios (
  id                      INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre                  TEXT    NOT NULL,
  email                   TEXT    NOT NULL UNIQUE COLLATE NOCASE,
  objetivo_calorias       INTEGER NOT NULL CHECK (objetivo_calorias > 0),
  objetivo_proteinas      REAL    NOT NULL CHECK (objetivo_proteinas >= 0),
  objetivo_grasas         REAL    NOT NULL CHECK (objetivo_grasas >= 0),
  objetivo_carbohidratos  REAL    NOT NULL CHECK (objetivo_carbohidratos >= 0),
  objetivo_agua_ml        INTEGER NOT NULL CHECK (objetivo_agua_ml > 0),
  creado_en               TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS alimentos (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre         TEXT NOT NULL UNIQUE COLLATE NOCASE,
  categoria      TEXT NOT NULL,
  calorias       REAL NOT NULL CHECK (calorias >= 0),
  proteinas      REAL NOT NULL CHECK (proteinas >= 0),
  grasas         REAL NOT NULL CHECK (grasas >= 0),
  carbohidratos  REAL NOT NULL CHECK (carbohidratos >= 0)
);

CREATE TABLE IF NOT EXISTS registros_comida (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id   INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  alimento_id  INTEGER NOT NULL REFERENCES alimentos(id) ON DELETE RESTRICT,
  fecha        TEXT    NOT NULL,
  tipo_comida  TEXT    NOT NULL CHECK (tipo_comida IN ('desayuno', 'almuerzo', 'merienda', 'cena', 'snack')),
  gramos       REAL    NOT NULL CHECK (gramos > 0),
  creado_en    TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_registros_comida_usuario_fecha
  ON registros_comida (usuario_id, fecha);

CREATE TABLE IF NOT EXISTS registros_agua (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id   INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  fecha        TEXT    NOT NULL,
  cantidad_ml  INTEGER NOT NULL CHECK (cantidad_ml > 0),
  creado_en    TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_registros_agua_usuario_fecha
  ON registros_agua (usuario_id, fecha);
