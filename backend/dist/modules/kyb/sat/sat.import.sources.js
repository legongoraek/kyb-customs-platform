"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SAT_IMPORT_SOURCES = void 0;
exports.SAT_IMPORT_SOURCES = [
    {
        source: "SAT_ART_69",
        sourceName: "SAT - Contribuyentes incumplidos",
        sourceUrl: "https://wwwmat.sat.gob.mx/consultas/11981/consulta-la-relacion-de-contribuyentes-incumplidos",
        listType: "incumplidos",
        situation: "Contribuyente localizado en consulta pública de contribuyentes incumplidos.",
        riskLevel: "review",
        article: "69",
    },
    {
        source: "SAT_ART_69B",
        sourceName: "SAT - Operaciones presuntamente inexistentes",
        sourceUrl: "https://wwwmat.sat.gob.mx/consultas/76674/consulta-la-relacion-de-contribuyentes-con-operaciones-presuntamente-inexistentes",
        listType: "presuntos",
        situation: "Contribuyente localizado en consulta pública de operaciones presuntamente inexistentes.",
        riskLevel: "review",
        article: "69-B",
    },
    {
        source: "SAT_ART_69B_BIS",
        sourceName: "SAT Datos Abiertos - Contribuyentes publicados",
        sourceUrl: "https://www.sat.gob.mx/minisitio/DatosAbiertos/contribuyentes_publicados.html",
        listType: "publicados",
        situation: "Contribuyente localizado en datos abiertos SAT de contribuyentes publicados.",
        riskLevel: "critical",
        article: "69-B Bis",
    },
    {
        source: "SAT_ART_49_BIS",
        sourceName: "SAT PLD - Obligaciones",
        sourceUrl: "https://sppld.sat.gob.mx/pld/interiores/obligaciones.html",
        listType: "fuente_publica_contextual",
        situation: "Fuente pública contextual utilizada para justificar revisión preventiva.",
        riskLevel: "review",
        article: "49 Bis",
    },
];
