# KYB Customs Platform

Prueba técnica / case study de una plataforma KYB para comercio exterior mexicano. El proyecto demuestra cómo modelar expedientes de personas morales, validaciones documentales, revisiones de RFC relacionadas con fuentes públicas SAT, scoring de riesgo explicable y trazabilidad de decisiones.

> **Alcance:** este repositorio es una implementación demostrativa. No se presenta como SaaS productivo, servicio oficial del SAT, certificación regulatoria ni solución de cumplimiento completa.

## Demo desplegada

- **Case study público:** https://kyb-customs-platform.vercel.app/
- **Demo operativa:** https://kyb-customs-platform.vercel.app/app
- **Backend / API:** https://kyb-customs-platform.onrender.com
- **Repositorio:** https://github.com/legongoraek/kyb-customs-platform
- **Autor:** Luis Enrique Góngora Ek — https://www.legongoraek.me/

> Nota: el backend está desplegado en Render (plan gratuito), por lo que puede tardar unos segundos en despertar tras periodos de inactividad. La demo operativa ejecuta `wakeUpBackend()` al cargar.

## Arquitectura

Este repositorio está organizado como monorepo simple con dos aplicaciones:

- `backend/`: API REST en Node.js + Express + TypeScript.
- `frontend/`: aplicación web en React + Vite + TypeScript.

La superficie web se separa en:

- `/`: landing pública y case study indexable.
- `/app`: dashboard de la demo operativa.
- `/app/cases/new`: creación de expediente KYB.
- `/app/cases/:id`: detalle del expediente, evidencia y scoring.
- `/app/sat/imports`: historial de importaciones SAT.

Las rutas operativas usan `noindex, nofollow` y no forman parte del sitemap público.

## Stack tecnológico

- Frontend: React, Vite, TypeScript, Tailwind CSS, Recharts.
- Backend: Node.js, Express, TypeScript, Zod.
- Base de datos: PostgreSQL (local o Supabase).

## Funcionalidades principales

- Crear expediente KYB.
- Registrar metadata documental auditable.
- Validar documentos faltantes y vencidos.
- Revisar RFC contra listas fiscales SAT normalizadas.
- Calcular score determinístico y explicable.
- Clasificar como `safe`, `review_required` o `high_risk`.
- Bloquear aprobación cuando el caso no es `safe`.
- Mantener bitácora de auditoría (audit log).

## SEO + GEO

La landing pública incluye una capa orientada tanto a buscadores tradicionales como a motores generativos:

- metadata base en español (`es-MX`);
- canonical configurable mediante `VITE_SITE_URL`;
- Open Graph y Twitter metadata;
- JSON-LD para `SoftwareApplication`, `Person` y `FAQPage`;
- `robots.txt`;
- `sitemap.xml` limitado a la ruta pública;
- `llms.txt` con propósito, autoría, capacidades verificables, stack y limitaciones;
- `noindex, nofollow` para la demo operativa;
- validador automatizado `npm run seo:check`.

El origen canonical por defecto es `https://kyb-customs-platform.vercel.app`. Para un dominio futuro se puede definir:

```env
VITE_SITE_URL=https://example.com
```

## Estructura del repositorio

```text
kyb-customs-platform/
├─ backend/
│  └─ README.md
├─ frontend/
│  ├─ public/
│  │  ├─ robots.txt
│  │  ├─ sitemap.xml
│  │  └─ llms.txt
│  └─ README.md
├─ docs/superpowers/
│  ├─ specs/
│  └─ plans/
└─ README.md
```

## Requisitos

- Node.js 20+
- npm 10+
- PostgreSQL (si usas base local)

## Puesta en marcha rápida

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Con esta configuración:

- Landing: `http://localhost:5173/`
- Demo: `http://localhost:5173/app`
- Backend: `http://localhost:4000`

## Variables de entorno mínimas

### `backend/.env`

```env
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://usuario:password@localhost:5432/kyb_customs
FRONTEND_URL=http://localhost:5173
```

### `frontend/.env`

```env
VITE_API_URL=http://localhost:4000
VITE_SITE_URL=http://localhost:5173
```

`VITE_SITE_URL` es opcional en producción; si no existe, el frontend utiliza el dominio público de Vercel como fallback canonical.

## Scripts útiles

### Backend

- `npm run dev`: desarrollo con recarga.
- `npm run build`: compila TypeScript a `dist/`.
- `npm start`: ejecuta build compilado.
- `npm test`: ejecuta pruebas con Vitest.

### Frontend

- `npm run dev`: desarrollo con Vite.
- `npm run build`: build de producción.
- `npm run preview`: previsualización del build.
- `npm run lint`: análisis estático con ESLint.
- `npm run test:seo`: pruebas del validador SEO/GEO con el runner nativo de Node.
- `npm run seo:check`: valida metadata, assets de crawl/GEO, sitemap y separación de rutas.

Verificación recomendada:

```bash
cd frontend
npm run test:seo
npm run seo:check
npm run lint
npm run build
```

## Documentación por módulo

- Backend: ver [backend/README.md](backend/README.md)
- Frontend: ver [frontend/README.md](frontend/README.md)
- Diseño SEO/GEO: ver [docs/superpowers/specs/2026-09-13-seo-geo-design.md](docs/superpowers/specs/2026-09-13-seo-geo-design.md)
- Plan SEO/GEO: ver [docs/superpowers/plans/2026-09-13-seo-geo.md](docs/superpowers/plans/2026-09-13-seo-geo.md)

## Flujo funcional sugerido

1. Abrir la demo en `/app`.
2. Crear expediente KYB.
3. Registrar metadata documental.
4. Ejecutar validación SAT para el RFC.
5. Ejecutar motor de riesgo.
6. Revisar evidencia y auditoría.
7. Aprobar solo si el resultado es compatible con la política de riesgo implementada.

## Despliegue

### Frontend

- Plataforma: Vercel
- URL pública: https://kyb-customs-platform.vercel.app/
- Demo: https://kyb-customs-platform.vercel.app/app
- Comando build: `npm run build`
- Carpeta de salida: `dist/`
- Variables: `VITE_API_URL`, `VITE_SITE_URL` (opcional)

### Backend

- Plataforma: Render
- URL: https://kyb-customs-platform.onrender.com
- Comando build: `npm run build`
- Comando arranque: `npm start`
- Entry point: `dist/server.js`
- Variables clave: `PORT`, `DATABASE_URL`, `FRONTEND_URL`, `NODE_ENV`

## Revisión SAT y trazabilidad

La plataforma consulta RFCs contra entradas normalizadas de fuentes públicas SAT y guarda evidencia de cada revisión (resultado, fuente, URL de referencia, evidencia de match y marca de tiempo). El objetivo de la prueba técnica es demostrar trazabilidad y soporte de auditoría para decisiones de riesgo sin afirmar afiliación oficial ni cobertura regulatoria productiva.
