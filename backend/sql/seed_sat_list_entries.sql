insert into sat_list_entries (
  rfc,
  legal_name,
  source,
  list_type,
  situation,
  reference_url,
  published_at,
  raw_data
)
values
(
  'AAA010101AAA',
  'EMPRESA DE RIESGO DEFINITIVO SA DE CV',
  'SAT_ART_69B',
  'definitivos',
  'Contribuyente publicado como definitivo en términos del artículo 69-B del Código Fiscal de la Federación.',
  'https://www.sat.gob.mx/minisitio/DatosAbiertos/contribuyentes_publicados.html',
  '2026-05-31',
  '{
    "idioma": "es-MX",
    "tipo_registro": "entrada_normalizada_sat",
    "fuente_nombre": "SAT Datos Abiertos - Contribuyentes publicados",
    "fuente_url": "https://www.sat.gob.mx/minisitio/DatosAbiertos/contribuyentes_publicados.html",
    "fuente_consulta_publica": "https://wwwmat.sat.gob.mx/consultas/76674/consulta-la-relacion-de-contribuyentes-con-operaciones-presuntamente-inexistentes",
    "articulo_cff": "69-B",
    "categoria_sat": "Operaciones presuntamente inexistentes",
    "tipo_listado": "Definitivos",
    "descripcion": "Registro normalizado para representar un contribuyente publicado como definitivo en términos del artículo 69-B del CFF.",
    "criterio_riesgo": "Coincidencia crítica. El expediente debe clasificarse como high_risk y bloquear aprobación.",
    "nivel_riesgo_kyb": "critical",
    "accion_sugerida": "Bloquear aprobación y solicitar revisión legal/fiscal especializada.",
    "fecha_publicacion_fuente": "2026-05-31",
    "fecha_normalizacion": "2026-07-01",
    "nota": "Registro de demostración para validar el flujo KYB usando estructura de fuentes públicas SAT. La importación automática desde archivos oficiales puede agregarse como job programado."
  }'::jsonb
),
(
  'BBB010101BBB',
  'EMPRESA EN PRESUNCION SA DE CV',
  'SAT_ART_69B',
  'presuntos',
  'Contribuyente publicado como presunto en términos del artículo 69-B del Código Fiscal de la Federación.',
  'https://www.sat.gob.mx/minisitio/DatosAbiertos/contribuyentes_publicados.html',
  '2026-05-31',
  '{
    "idioma": "es-MX",
    "tipo_registro": "entrada_normalizada_sat",
    "fuente_nombre": "SAT Datos Abiertos - Contribuyentes publicados",
    "fuente_url": "https://www.sat.gob.mx/minisitio/DatosAbiertos/contribuyentes_publicados.html",
    "fuente_consulta_publica": "https://wwwmat.sat.gob.mx/consultas/76674/consulta-la-relacion-de-contribuyentes-con-operaciones-presuntamente-inexistentes",
    "articulo_cff": "69-B",
    "categoria_sat": "Operaciones presuntamente inexistentes",
    "tipo_listado": "Presuntos",
    "descripcion": "Registro normalizado para representar un contribuyente publicado como presunto en términos del artículo 69-B del CFF.",
    "criterio_riesgo": "Coincidencia que requiere revisión. El expediente debe incrementar riesgo y requerir revisión humana.",
    "nivel_riesgo_kyb": "review",
    "accion_sugerida": "Solicitar revisión fiscal antes de aprobar el expediente.",
    "fecha_publicacion_fuente": "2026-05-31",
    "fecha_normalizacion": "2026-07-01",
    "nota": "Registro de demostración para validar el flujo KYB usando estructura de fuentes públicas SAT. La importación automática desde archivos oficiales puede agregarse como job programado."
  }'::jsonb
),
(
  'CCC010101CCC',
  'EMPRESA INCUMPLIDA SA DE CV',
  'SAT_ART_69',
  'incumplidos',
  'Contribuyente publicado en la relación de contribuyentes incumplidos.',
  'https://wwwmat.sat.gob.mx/consultas/11981/consulta-la-relacion-de-contribuyentes-incumplidos',
  '2026-04-01',
  '{
    "idioma": "es-MX",
    "tipo_registro": "entrada_normalizada_sat",
    "fuente_nombre": "SAT - Consulta de contribuyentes incumplidos",
    "fuente_url": "https://wwwmat.sat.gob.mx/consultas/11981/consulta-la-relacion-de-contribuyentes-incumplidos",
    "fuente_datos_abiertos": "https://www.sat.gob.mx/minisitio/DatosAbiertos/contribuyentes_publicados.html",
    "articulo_cff": "69",
    "categoria_sat": "Contribuyentes incumplidos",
    "tipo_listado": "Incumplidos",
    "descripcion": "Registro normalizado para representar un contribuyente publicado en la relación de contribuyentes incumplidos.",
    "criterio_riesgo": "Coincidencia que requiere revisión. El expediente debe incrementar riesgo y requerir revisión humana.",
    "nivel_riesgo_kyb": "review",
    "accion_sugerida": "Revisar situación fiscal del contribuyente antes de aprobar.",
    "fecha_publicacion_fuente": "2026-04-01",
    "fecha_normalizacion": "2026-07-01",
    "nota": "Registro de demostración para validar el flujo KYB usando estructura de fuentes públicas SAT. La importación automática desde archivos oficiales puede agregarse como job programado."
  }'::jsonb
),
(
  'DDD010101DDD',
  'EMPRESA 69B BIS SA DE CV',
  'SAT_ART_69B_BIS',
  'definitivos',
  'Contribuyente publicado en términos del artículo 69-B Bis del Código Fiscal de la Federación.',
  'https://www.sat.gob.mx/minisitio/DatosAbiertos/contribuyentes_publicados.html',
  '2026-03-12',
  '{
    "idioma": "es-MX",
    "tipo_registro": "entrada_normalizada_sat",
    "fuente_nombre": "SAT Datos Abiertos - Contribuyentes publicados",
    "fuente_url": "https://www.sat.gob.mx/minisitio/DatosAbiertos/contribuyentes_publicados.html",
    "fuente_tramite_sat": "https://www.sat.gob.mx/portal/public/tramites/articulo-69-del-cff",
    "articulo_cff": "69-B Bis",
    "categoria_sat": "Transmisión indebida del derecho a disminuir pérdidas fiscales",
    "tipo_listado": "Definitivos",
    "descripcion": "Registro normalizado para representar un contribuyente publicado en términos del artículo 69-B Bis del CFF.",
    "criterio_riesgo": "Coincidencia crítica. El expediente debe clasificarse como high_risk y bloquear aprobación.",
    "nivel_riesgo_kyb": "critical",
    "accion_sugerida": "Bloquear aprobación y solicitar revisión legal/fiscal especializada.",
    "fecha_publicacion_fuente": "2026-03-12",
    "fecha_normalizacion": "2026-07-01",
    "nota": "Registro de demostración para validar el flujo KYB usando estructura de fuentes públicas SAT. La importación automática desde archivos oficiales puede agregarse como job programado."
  }'::jsonb
)
on conflict (rfc, source, list_type)
do update set
  legal_name = excluded.legal_name,
  situation = excluded.situation,
  reference_url = excluded.reference_url,
  published_at = excluded.published_at,
  raw_data = excluded.raw_data,
  imported_at = now();