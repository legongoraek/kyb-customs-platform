# KYB Customs Platform

Plataforma KYB para agencia aduanal que evalúa si una persona moral mexicana es segura, requiere revisión o representa alto riesgo para operar comercio exterior.

## Tabla de contenidos

- [Arquitectura](#arquitectura)
- [Stack tecnológico](#stack-tecnologico)
- [Funcionalidades principales](#funcionalidades-principales)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Requisitos](#requisitos)
- [Puesta en marcha rápida](#puesta-en-marcha-rapida)
- [Variables de entorno mínimas](#variables-de-entorno-minimas)
- [Scripts útiles](#scripts-utiles)
- [Documentación por módulo](#documentacion-por-modulo)
- [Flujo funcional sugerido](#flujo-funcional-sugerido)
- [Despliegue](#despliegue)
- [Revisión SAT y trazabilidad](#revision-sat-y-trazabilidad)

## Arquitectura

Este repositorio está organizado como monorepo simple con dos aplicaciones:

- `backend/`: API REST en Node.js + Express + TypeScript.
- `frontend/`: aplicación web en React + Vite + TypeScript.

## Stack tecnológico

- Frontend: React, Vite, TypeScript, Tailwind CSS, Recharts.
- Backend: Node.js, Express, TypeScript, Zod.
- Base de datos: PostgreSQL (local o Supabase).

## Funcionalidades principales

- Crear expediente KYB.
- Registrar metadata documental auditable.
- Validar documentos faltantes y vencidos.
- Revisar RFC contra listas fiscales SAT.
- Calcular score determinístico y explicable.
- Clasificar como `safe`, `review_required` o `high_risk`.
- Bloquear aprobación cuando el caso no es `safe`.
- Mantener bitácora de auditoría (audit log).

## Estructura del repositorio

```text
kyb-customs-platform/
├─ backend/
│  └─ README.md
├─ frontend/
│  └─ README.md
└─ README.md
```

## Requisitos

- Node.js 20+
- npm 10+
- PostgreSQL (si usas base local)

## Puesta en marcha rápida

1. Clona el repositorio y entra a la carpeta raíz.
2. Configura variables de entorno en `backend/.env` y `frontend/.env`.
3. Instala dependencias de backend.
4. Instala dependencias de frontend.
5. Levanta ambas aplicaciones en terminales separadas.

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

- Frontend: `http://localhost:5173`
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
```

## Scripts útiles

### Raíz del monorepo

Actualmente no hay scripts globales en la raíz. Se ejecutan comandos por módulo (`backend` y `frontend`).

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

## Documentación por módulo

- Backend: ver [backend/README.md](backend/README.md)
- Frontend: ver [frontend/README.md](frontend/README.md)

## Flujo funcional sugerido

1. Crear expediente KYB desde frontend.
2. Registrar metadata documental.
3. Ejecutar validación SAT para el RFC.
4. Ejecutar motor de riesgo.
5. Revisar evidencia y auditoría.
6. Aprobar solo si el resultado es compatible con política de riesgo.

## Despliegue

### Frontend

- Comando build: `npm run build`
- Carpeta de salida: `dist/`
- Variable clave: `VITE_API_URL`

### Backend

- Comando build: `npm run build`
- Comando arranque: `npm start`
- Entry point: `dist/server.js`
- Variables clave: `PORT`, `DATABASE_URL`, `FRONTEND_URL`, `NODE_ENV`

## Revisión SAT y trazabilidad

La plataforma consulta RFCs contra entradas normalizadas de fuentes públicas SAT y guarda evidencia de cada revisión (resultado, fuente, URL de referencia, evidencia de match y marca de tiempo). Este enfoque mantiene trazabilidad y soporte de auditoría para decisiones de riesgo.