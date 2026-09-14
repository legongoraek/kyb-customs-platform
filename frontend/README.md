# Frontend - KYB Customs Platform

Frontend React/Vite de una prueba técnica KYB para comercio exterior. La raíz pública funciona como case study del trabajo realizado y la demo operativa vive bajo `/app`.

## Requisitos

- Node.js 20+
- npm 10+
- Backend ejecutándose (por defecto en `http://localhost:4000`)

## Instalación

```bash
cd frontend
npm install
```

## Variables de entorno

```env
VITE_API_URL=http://localhost:4000
VITE_SITE_URL=http://localhost:5173
```

`VITE_API_URL` apunta al backend. `VITE_SITE_URL` controla el origen canonical; si no se define, se utiliza `https://kyb-customs-platform.vercel.app`.

## Scripts

- `npm run dev`: servidor de desarrollo Vite.
- `npm run build`: compila TypeScript y genera `dist/`.
- `npm run preview`: previsualiza el build.
- `npm run lint`: ejecuta ESLint.
- `npm run test:seo`: ejecuta las pruebas del validador SEO/GEO.
- `npm run seo:check`: valida metadata, assets públicos y separación de rutas indexables.

## Navegación principal

- `/`: landing pública / case study técnico.
- `/app`: dashboard de la demo KYB.
- `/app/cases/new`: creación de expediente.
- `/app/cases/:id`: detalle, evidencia, score y aprobación.
- `/app/sat/imports`: historial de importaciones SAT.

Las rutas históricas `/cases/new`, `/cases/:id` y `/sat/imports` se conservan como redirects de compatibilidad hacia `/app/**`.

Las rutas operativas se marcan `noindex, nofollow` y no aparecen en el sitemap.

## SEO + GEO

El frontend incluye:

- metadata estática de respaldo en `index.html`;
- componente `Seo` para metadata por superficie;
- canonical, Open Graph y Twitter metadata;
- JSON-LD factual para el proyecto, autor y FAQ;
- `public/robots.txt`;
- `public/sitemap.xml` con la ruta pública únicamente;
- `public/llms.txt` con información factual y limitaciones del proyecto;
- validación automatizada en `scripts/seo-check.mjs`.

La landing presenta el repositorio como **prueba técnica / implementación demostrativa**, no como un SaaS productivo ni como un servicio oficial del SAT.

## Estructura principal

```text
frontend/
├─ public/
│  ├─ robots.txt
│  ├─ sitemap.xml
│  └─ llms.txt
├─ scripts/
│  ├─ seo-check.mjs
│  └─ seo-check.test.mjs
├─ src/
│  ├─ api/
│  ├─ components/
│  │  ├─ Layout.tsx
│  │  ├─ Seo.tsx
│  │  └─ ...
│  ├─ pages/
│  │  ├─ LandingPage.tsx
│  │  ├─ DashboardPage.tsx
│  │  ├─ CreateCasePage.tsx
│  │  ├─ CaseDetailPage.tsx
│  │  └─ SatImportLogsPage.tsx
│  ├─ App.tsx
│  ├─ main.tsx
│  └─ index.css
├─ index.html
├─ package.json
└─ vercel.json
```

## Capa API

Funciones principales del cliente HTTP:

- `getCases`, `getCaseById`, `createCase`
- `addDocumentMetadata`
- `runSatListCheck`, `runRiskCheck`, `approveCase`
- `getAuditLogs`
- `getSatImportLogs`, `runSatImport`
- `getReportJsonUrl`, `getReportPdfUrl`

`wakeUpBackend()` se ejecuta al entrar a la demo operativa, no al visitar la landing pública.

## Flujo funcional típico

1. Abrir `/app`.
2. Crear un expediente.
3. Capturar metadata documental.
4. Ejecutar revisión SAT.
5. Ejecutar cálculo de riesgo.
6. Revisar factores, evidencia y auditoría.
7. Aprobar solo si el resultado cumple la política implementada.

## Verificación

```bash
npm run test:seo
npm run seo:check
npm run lint
npm run build
```

## Despliegue

- Build command: `npm run build`
- Output directory: `dist/`
- Variables: `VITE_API_URL` y opcionalmente `VITE_SITE_URL`

En Vercel, `robots.txt`, `sitemap.xml` y `llms.txt` se sirven como assets estáticos y no pasan por el rewrite de la SPA.
