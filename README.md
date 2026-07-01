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

## Revisión SAT y fuentes públicas

La plataforma consulta RFCs contra `sat_list_entries`, una tabla local normalizada con entradas provenientes de fuentes públicas del SAT.

Cada revisión ejecutada por la plataforma queda registrada en `sat_list_checks`, incluyendo:

- RFC buscado
- Fuente consultada
- Resultado
- URL de referencia
- Evidencia cruda del match
- Fecha/hora de revisión

Para este MVP, `seed_sat_list_entries.sql` contiene registros de demostración con estructura auditable, referencias a fuentes públicas SAT y criterios de riesgo. La arquitectura permite reemplazar o complementar esta carga con un importador automático de archivos oficiales SAT.

Fuentes consideradas:

- SAT Datos Abiertos - Contribuyentes publicados
- Consulta SAT de contribuyentes incumplidos
- Consulta SAT de operaciones presuntamente inexistentes
- Portal SAT para artículos 69-B y 69-B Bis
- Portal SAT PLD como fuente pública justificable para contexto preventivo