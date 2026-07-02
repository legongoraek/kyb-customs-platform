# Frontend - KYB Customs Platform

Aplicación web para captura, análisis y seguimiento de expedientes KYB.

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

Crea un archivo `.env` dentro de `frontend`:

```env
VITE_API_URL=http://localhost:4000
```

Si no se define, la app usa `http://localhost:4000` como valor por defecto.

## Scripts

- `npm run dev`: levanta servidor de desarrollo con Vite.
- `npm run build`: compila TypeScript y genera build de producción.
- `npm run preview`: sirve localmente el build de producción.
- `npm run lint`: ejecuta ESLint.

## Estructura principal

```text
frontend/
├─ src/
│  ├─ api/
│  │  └─ kybApi.ts
│  ├─ components/
│  │  ├─ Layout.tsx
│  │  ├─ RiskBadge.tsx
│  │  ├─ RiskFactorsList.tsx
│  │  ├─ DocumentMetadataForm.tsx
│  │  ├─ ScoreCard.tsx
│  │  ├─ AuditLogList.tsx
│  │  ├─ SatEvidenceList.tsx
│  │  └─ ...
│  ├─ pages/
│  │  ├─ DashboardPage.tsx
│  │  ├─ CreateCasePage.tsx
│  │  ├─ CaseDetailPage.tsx
│  │  └─ SatImportLogsPage.tsx
│  ├─ types/
│  │  └─ kyb.ts
│  ├─ utils/
│  │  └─ format.ts
│  ├─ App.tsx
│  ├─ main.tsx
│  └─ index.css
├─ package.json
└─ vite.config.ts
```

## Navegación principal

- `/`: dashboard de casos.
- `/cases/new`: creación de expediente KYB.
- `/cases/:id`: detalle del expediente, evidencia, score y aprobación.
- `/sat/imports`: historial de importaciones SAT.

## Capa API (`src/api/kybApi.ts`)

Funciones principales del cliente HTTP:

- `getCases`, `getCaseById`, `createCase`
- `addDocumentMetadata`
- `runSatListCheck`, `runRiskCheck`, `approveCase`
- `getAuditLogs`
- `getSatImportLogs`, `runSatImport`
- `getReportJsonUrl`, `getReportPdfUrl`

La app también ejecuta `wakeUpBackend()` al cargar para reducir latencia inicial en entornos con cold start.

## Flujo funcional típico

1. Crear un expediente en `/cases/new`.
2. Capturar metadata documental.
3. Ejecutar revisión SAT.
4. Ejecutar cálculo de riesgo.
5. Revisar factores, evidencia y auditoría.
6. Aprobar solo si el resultado cumple política.

## Ejecución

### Desarrollo

```bash
npm run dev
```

### Producción local

```bash
npm run build
npm run preview
```
