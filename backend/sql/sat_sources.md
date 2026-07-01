# Fuentes SAT utilizadas

La plataforma utiliza una tabla local normalizada llamada `sat_list_entries` para consultar RFCs contra entradas provenientes de fuentes públicas del SAT.

Cada revisión operativa se guarda en `sat_list_checks` con:

- RFC buscado
- Fuente
- Resultado
- URL de referencia
- Evidencia cruda
- Fecha/hora de revisión

## Fuentes consideradas

### Datos abiertos SAT - Contribuyentes publicados

URL:

https://www.sat.gob.mx/minisitio/DatosAbiertos/contribuyentes_publicados.html

Usada para justificar entradas de:

- Artículo 69 CFF
- Artículo 69-B CFF
- Artículo 69-B Bis CFF

### Contribuyentes incumplidos

URL:

https://wwwmat.sat.gob.mx/consultas/11981/consulta-la-relacion-de-contribuyentes-incumplidos

### Operaciones presuntamente inexistentes

URL:

https://wwwmat.sat.gob.mx/consultas/76674/consulta-la-relacion-de-contribuyentes-con-operaciones-presuntamente-inexistentes

### Portal SAT PLD

URL:

https://sppld.sat.gob.mx/pld/interiores/obligaciones.html

## Nota técnica

Para este MVP, la consulta de riesgo no depende de mocks en memoria. El servicio consulta `sat_list_entries`, una tabla normalizada que representa entradas de fuentes públicas SAT, y guarda cada revisión en `sat_list_checks`.

La importación automática de archivos SAT puede agregarse posteriormente mediante un job programado.

## Revisión de listas fiscales SAT

El sistema consulta RFCs contra una tabla normalizada llamada `sat_list_entries`, que representa entradas provenientes de fuentes públicas del SAT.

Cada revisión ejecutada desde la plataforma se guarda en `sat_list_checks`, incluyendo:

- RFC buscado
- Fuente consultada
- Resultado
- URL de referencia
- Evidencia cruda del match
- Fecha/hora de revisión

Este diseño permite que cada consulta sea auditable y trazable.

Fuentes consideradas:

- SAT Datos Abiertos - Contribuyentes publicados
- Artículo 69 CFF
- Artículo 69-B CFF
- Artículo 69-B Bis CFF
- Consultas públicas del SAT para contribuyentes incumplidos y operaciones presuntamente inexistentes

Para el MVP se utiliza una tabla local normalizada. La importación automática de archivos SAT puede agregarse como mejora futura mediante un proceso programado.