# NutriTrack

Aplicación web para registrar la alimentación diaria: comidas con sus macronutrientes (calorías, proteínas, grasas y carbohidratos) y consumo de agua, comparando lo consumido contra los objetivos de cada perfil.

Trabajo Práctico Integrador — Arquitectura Web — Universidad de Palermo
Autor: Máximo Barros (legajo 0139600)

El documento de entrega (carátula, alcance, justificación de la arquitectura y detalle de endpoints) está en [`docs/Documento-TP.md`](docs/Documento-TP.md) y en PDF en [`docs/Documento-TP.pdf`](docs/Documento-TP.pdf).

## Tecnologías

| Capa | Tecnología |
| --- | --- |
| Frontend | React 18 + React Router 7, empaquetado con Vite 6. CSS propio, sin frameworks. |
| Backend | Node.js + Express 5 (API REST), validación con Zod, headers de seguridad con Helmet, logs con Morgan |
| Persistencia | SQLite mediante `better-sqlite3` (archivo local, se crea y carga con datos de ejemplo al iniciar) |
| Testing | Jest + Supertest sobre los endpoints HTTP (base SQLite en memoria) |

## Requisitos

- Node.js **20 o superior** (probado con Node 22) y npm 10.
- No hace falta instalar ningún motor de base de datos: SQLite está embebido.

## Instalación

```bash
npm install
```

Instala las dependencias de los dos paquetes (`backend/` y `frontend/`) gracias a los *npm workspaces*.

## Ejecución

### Modo producción (un solo servidor)

```bash
npm run build   # compila el frontend en frontend/dist
npm start       # levanta Express en http://localhost:3000 (API + frontend)
```

Abrir <http://localhost:3000>.

### Modo desarrollo (recarga en caliente)

```bash
npm run dev
```

- Frontend (Vite): <http://localhost:5173> — redirige las llamadas `/api` al backend.
- API (Express): <http://localhost:3000/api>

## Datos de ejemplo

Al iniciar, si la base está vacía se carga automáticamente:

- 25 alimentos con sus valores cada 100 g.
- 2 perfiles (Ana López y Juan Pérez) con objetivos diarios.
- Registros de comidas y agua de los **últimos 7 días** (las fechas son relativas al día en que se levanta la app, así siempre hay datos para "hoy").

La base se guarda en `backend/data/nutritrack.db`. Para volver al estado inicial:

```bash
npm run db:reset
```

## Tests

```bash
npm test                # 62 tests de endpoints (Jest + Supertest)
npm run test:coverage   # idem, con reporte de cobertura
```

Cada suite crea una base SQLite **en memoria** con los datos de ejemplo, así los tests son independientes entre sí y no tocan la base local.

## Scripts disponibles (raíz)

| Script | Descripción |
| --- | --- |
| `npm run dev` | Backend y frontend en modo desarrollo, en paralelo |
| `npm run build` | Build de producción del frontend |
| `npm start` | Servidor Express (API + frontend compilado) |
| `npm test` | Tests de la API |
| `npm run test:coverage` | Tests con cobertura |
| `npm run db:reset` | Regenera la base con los datos de ejemplo |
| `npm run zip` | Genera el `.zip` de entrega a partir de los archivos versionados en git (sin dependencias) y controla que pese menos de 3 MB |

## Variables de entorno (opcionales)

| Variable | Valor por defecto | Uso |
| --- | --- | --- |
| `PORT` | `3000` | Puerto del servidor Express |
| `DB_PATH` | `backend/data/nutritrack.db` | Ubicación del archivo SQLite |

## Estructura del proyecto

```
.
├── backend/
│   ├── src/
│   │   ├── app.js            # composición de la app Express (inyección de la base)
│   │   ├── server.js         # punto de entrada: abre la base, carga datos y escucha
│   │   ├── routes/           # definición de recursos y verbos HTTP
│   │   ├── controllers/      # traducen HTTP <-> servicios (status, headers)
│   │   ├── services/         # reglas de negocio y reportes
│   │   ├── repositories/     # acceso a datos (SQL)
│   │   ├── validators/       # esquemas Zod de params, query y body
│   │   ├── middlewares/      # validación y manejo de errores
│   │   └── db/               # esquema SQL, conexión, datos de ejemplo
│   └── tests/                # tests de endpoints
├── frontend/
│   └── src/
│       ├── api/              # cliente HTTP de la API
│       ├── pages/            # Diario, Reporte, Alimentos, Perfiles
│       ├── components/       # formularios, modal, barras de progreso…
│       ├── context/          # perfil activo
│       ├── hooks/            # carga de datos, formularios, fecha en la URL
│       └── styles/           # hoja de estilos
├── docs/                     # documento de entrega (Markdown + PDF)
└── scripts/                  # utilidades (zip de entrega)
```

## Resumen de la API

Base: `/api`. Todas las respuestas son JSON. Detalle completo en el documento de entrega.

| Verbo | Endpoint | Descripción |
| --- | --- | --- |
| GET | `/health` | Estado del servicio |
| GET, POST | `/alimentos` | Listar (filtros `q`, `categoria`) / crear alimentos |
| GET | `/alimentos/categorias` | Categorías existentes |
| GET, PUT, DELETE | `/alimentos/:id` | Obtener / reemplazar / eliminar un alimento |
| GET, POST | `/usuarios` | Listar / crear perfiles |
| GET, PUT, DELETE | `/usuarios/:id` | Obtener / reemplazar / eliminar un perfil |
| GET, POST | `/usuarios/:usuarioId/comidas` | Listar (filtros `fecha`, `desde`, `hasta`, `tipoComida`) / registrar comidas |
| GET, PUT, DELETE | `/usuarios/:usuarioId/comidas/:id` | Obtener / modificar / eliminar un registro de comida |
| GET, POST | `/usuarios/:usuarioId/agua` | Listar (filtros `fecha`, `desde`, `hasta`) / registrar agua |
| GET, PUT, DELETE | `/usuarios/:usuarioId/agua/:id` | Obtener / modificar / eliminar un registro de agua |
| GET | `/usuarios/:usuarioId/reportes/resumen-diario?fecha=` | Reporte del día vs. objetivos |
