# Fuentes SAT utilizadas

La plataforma utiliza una tabla local normalizada llamada `sat_list_entries` para consultar RFCs contra entradas provenientes de fuentes públicas del SAT.

Cada revisión operativa se guarda en `sat_list_checks` con:

- RFC buscado
- Fuente consultada
- Resultado
- URL de referencia
- Evidencia cruda del match
- Fecha/hora de revisión

Este diseño permite que cada consulta sea auditable, trazable y reproducible.

## Fuentes consideradas

### SAT Datos Abiertos - Contribuyentes publicados

URL:

https://www.sat.gob.mx/minisitio/DatosAbiertos/contribuyentes_publicados.html

Uso dentro de la plataforma:

- Artículo 69 CFF
- Artículo 69-B CFF
- Artículo 69-B Bis CFF

### Consulta pública de contribuyentes incumplidos

URL:

https://wwwmat.sat.gob.mx/consultas/11981/consulta-la-relacion-de-contribuyentes-incumplidos

Uso dentro de la plataforma:

- Artículo 69 CFF
- Contribuyentes con adeudos firmes, exigibles, no localizados, cancelados, con sentencia condenatoria por delito fiscal o con créditos fiscales condonados.

### Consulta pública de operaciones presuntamente inexistentes

URL:

https://wwwmat.sat.gob.mx/consultas/76674/consulta-la-relacion-de-contribuyentes-con-operaciones-presuntamente-inexistentes

Uso dentro de la plataforma:

- Artículo 69-B CFF
- Contribuyentes relacionados con presunción de operaciones inexistentes.

### Artículo 69-B y 69-B Bis en portal SAT

URL:

https://www.sat.gob.mx/portal/public/tramites/articulo-69-del-cff

Uso dentro de la plataforma:

- Presuntos
- Definitivos
- Desvirtuados
- Medios de defensa favorables
- Transmisión indebida del derecho a disminuir pérdidas fiscales

### Portal SAT PLD

URL:

https://sppld.sat.gob.mx/pld/interiores/obligaciones.html

Uso dentro de la plataforma:

- Fuente pública justificable para obligaciones y contexto de prevención.

## Nota técnica

Para este MVP, la consulta de riesgo no depende de mocks en memoria.

El servicio consulta `sat_list_entries`, una tabla normalizada que representa entradas provenientes de fuentes públicas SAT. Cada revisión real ejecutada por la plataforma se registra en `sat_list_checks`.

El archivo `seed_sat_list_entries.sql` contiene registros de demostración con estructura auditable para validar el flujo KYB. La importación automática de archivos oficiales SAT puede agregarse posteriormente mediante un job programado.