# NutriTrack

App web para registrar comidas, macronutrientes (calorías, proteínas, grasas, carbohidratos) y consumo de agua, comparando lo consumido contra los objetivos diarios de cada perfil.

Trabajo Práctico Integrador — Arquitectura Web — Universidad de Palermo · Máximo Barros (0139600)

## Requisitos

- Node.js 20 o superior

## Cómo ejecutarlo

```bash
npm install
npm run build
npm start
```

Abrir <http://localhost:3000>. Al iniciar se cargan datos de ejemplo (2 perfiles, 25 alimentos y 7 días de registros).

## Otros comandos

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Modo desarrollo con recarga automática (<http://localhost:5173>) |
| `npm test` | Tests de la API |
| `npm run db:reset` | Vuelve la base a los datos de ejemplo |
| `npm run zip` | Genera el `.zip` de entrega |

## Estructura

```
backend/    API REST (Node.js + Express + SQLite) y tests
frontend/   Interfaz (React + Vite)
docs/       Documento de entrega (Markdown y PDF)
scripts/    Utilidades (zip de entrega, PDF del documento)
```

El detalle de la arquitectura y de cada endpoint está en [`docs/Documento-TP.pdf`](docs/Documento-TP.pdf).
