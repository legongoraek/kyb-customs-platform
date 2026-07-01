# KYB Customs Platform

Plataforma KYB para agencia aduanal que evalúa si una persona moral mexicana es segura, requiere revisión o representa alto riesgo para operar comercio exterior.

## Stack

- React + Vite + TypeScript
- Tailwind CSS
- Recharts
- Node.js + Express + TypeScript
- PostgreSQL / Supabase

## Features

- Crear expediente KYB
- Registrar metadata documental auditable
- Validar documentos faltantes y vencidos
- Revisar RFC contra listas fiscales SAT
- Calcular score determinístico y explicable
- Clasificar como safe, review_required o high_risk
- Bloquear aprobación si no es safe
- Guardar audit log

## Backend

```bash
cd backend
npm install
npm run dev