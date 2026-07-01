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
  'Contribuyente publicado como definitivo en términos del artículo 69-B CFF.',
  'https://www.sat.gob.mx/minisitio/DatosAbiertos/contribuyentes_publicados.html',
  '2026-05-31',
  '{"source_note":"SAT datos abiertos Artículo 69-B"}'
),
(
  'BBB010101BBB',
  'EMPRESA EN PRESUNCION SA DE CV',
  'SAT_ART_69B',
  'presuntos',
  'Contribuyente publicado como presunto en términos del artículo 69-B CFF.',
  'https://www.sat.gob.mx/minisitio/DatosAbiertos/contribuyentes_publicados.html',
  '2026-05-31',
  '{"source_note":"SAT datos abiertos Artículo 69-B"}'
),
(
  'CCC010101CCC',
  'EMPRESA INCUMPLIDA SA DE CV',
  'SAT_ART_69',
  'incumplidos',
  'Contribuyente publicado en relación de contribuyentes incumplidos.',
  'https://wwwmat.sat.gob.mx/consultas/11981/consulta-la-relacion-de-contribuyentes-incumplidos',
  '2026-04-01',
  '{"source_note":"SAT consulta contribuyentes incumplidos"}'
),
(
  'DDD010101DDD',
  'EMPRESA 69B BIS SA DE CV',
  'SAT_ART_69B_BIS',
  'definitivos',
  'Contribuyente publicado en términos del artículo 69-B Bis CFF.',
  'https://www.sat.gob.mx/minisitio/DatosAbiertos/contribuyentes_publicados.html',
  '2026-03-12',
  '{"source_note":"SAT datos abiertos Artículo 69-B Bis"}'
)
on conflict do nothing;