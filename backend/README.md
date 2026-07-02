# Backend - KYB Customs Platform

API REST para gestionar expedientes KYB, validaciones SAT, scoring de riesgo y generación de reportes.

## Requisitos

- Node.js 20+
- npm 10+
- PostgreSQL (local o Supabase)

## Instalación

```bash
cd backend
npm install
```

## Variables de entorno

Crea un archivo `.env` dentro de `backend`:

```env
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://usuario:password@localhost:5432/kyb_customs
FRONTEND_URL=http://localhost:5173
```

Notas:

- `DATABASE_URL` es obligatoria para conexión a base de datos.
- Si el host es Supabase o `NODE_ENV=production`, la conexión usa SSL automáticamente.

## Scripts

- `npm run dev`: inicia servidor en modo desarrollo con recarga.
- `npm run build`: compila TypeScript a `dist/`.
- `npm start`: ejecuta build compilado (`dist/server.js`).
- `npm test`: ejecuta pruebas con Vitest.

## Estructura principal

```text
backend/
├─ src/
│  ├─ app.ts
│  ├─ server.ts
│  ├─ config/
│  │  └─ env.ts
│  ├─ db/
│  │  └─ pool.ts
│  └─ modules/
│     ├─ health/
│     │  └─ health.routes.ts
│     └─ kyb/
│        ├─ kyb.routes.ts
│        ├─ kyb.controller.ts
│        ├─ kyb.schemas.ts
│        ├─ kyb.repository.ts
│        ├─ kyb.types.ts
│        ├─ kyb.constants.ts
│        ├─ kyb.mock-data.ts
│        ├─ report/
│        │  └─ kybReport.service.ts
│        ├─ risk/
│        │  ├─ riskEngine.ts
│        │  └─ riskEngine.test.ts
│        └─ sat/
│           ├─ sat.service.ts
│           ├─ sat.repository.ts
│           ├─ sat.constants.ts
│           ├─ sat.import.service.ts
│           ├─ sat.import.repository.ts
│           └─ sat.import.sources.ts
├─ sql/
├─ package.json
└─ tsconfig.json
```

## Endpoints

Base URL local: `http://localhost:4000`

### Salud

- `GET /api/health`  
  Verifica disponibilidad de API y conexión a base de datos.

### Casos KYB

- `GET /api/kyb-cases`
- `POST /api/kyb-cases`
- `GET /api/kyb-cases/:id`
- `GET /api/kyb-cases/:id/audit-logs`
- `POST /api/kyb-cases/:id/documents/metadata`
- `POST /api/kyb-cases/:id/sat-list-check`
- `POST /api/kyb-cases/:id/run-check`
- `POST /api/kyb-cases/:id/approve`

### Reportes

- `GET /api/kyb-cases/:id/report.json`
- `GET /api/kyb-cases/:id/report.pdf`

### Importación SAT

- `GET /api/kyb-cases/sat/sources`
- `POST /api/kyb-cases/sat/import`
- `GET /api/kyb-cases/sat/import-logs`

## Flujo recomendado de desarrollo

1. Levantar base de datos y configurar `.env`.
2. Ejecutar `npm run dev`.
3. Probar `GET /api/health`.
4. Crear caso KYB y agregar metadata documental.
5. Ejecutar revisión SAT y scoring de riesgo.
6. Generar/consultar reporte JSON o PDF.

## Build y ejecución en producción

```bash
npm run build
npm start
```

La aplicación inicia desde `dist/server.js` y escucha en `PORT`.
