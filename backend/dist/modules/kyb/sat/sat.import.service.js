"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.satImportService = void 0;
const cheerio = __importStar(require("cheerio"));
const sat_import_repository_1 = require("./sat.import.repository");
const sat_import_sources_1 = require("./sat.import.sources");
const RFC_REGEX = /\b[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}\b/g;
const normalizeText = (value) => {
    return (value || "")
        .replace(/\s+/g, " ")
        .trim()
        .toUpperCase();
};
const extractRfcsFromText = (text) => {
    const matches = text.toUpperCase().match(RFC_REGEX) || [];
    return Array.from(new Set(matches));
};
const extractReadableTextFromHtml = (html) => {
    const $ = cheerio.load(html);
    $("script, style, noscript").remove();
    return $("body").text();
};
const buildRawData = (input) => {
    return {
        idioma: "es-MX",
        tipo_registro: "entrada_importada_sat",
        fuente_nombre: input.source.sourceName,
        fuente_url: input.source.sourceUrl,
        url_importada: input.importUrl,
        articulo_cff: input.source.article,
        tipo_listado: input.source.listType,
        descripcion: "Registro importado automáticamente desde una fuente pública SAT configurada en la plataforma.",
        criterio_riesgo: input.source.riskLevel === "critical"
            ? "Coincidencia crítica. El expediente debe clasificarse como high_risk y bloquear aprobación."
            : "Coincidencia que requiere revisión. El expediente debe incrementar riesgo y requerir revisión humana.",
        nivel_riesgo_kyb: input.source.riskLevel,
        fecha_importacion: new Date().toISOString(),
        rfc_detectado: input.rfc,
        nota: "La importación automática extrae RFCs detectados en contenido público SAT y los normaliza en sat_list_entries para consultas auditables.",
    };
};
const importFromSource = async (source) => {
    const importLog = await sat_import_repository_1.satImportRepository.createImportLog({
        source: source.source,
        sourceName: source.sourceName,
        sourceUrl: source.sourceUrl,
        metadata: {
            article: source.article,
            listType: source.listType,
            riskLevel: source.riskLevel,
        },
    });
    try {
        const response = await fetch(source.sourceUrl, {
            headers: {
                "User-Agent": "KYB-Customs-Platform/1.0 (+https://kyb-customs-platform.vercel.app)",
                Accept: "text/html,text/plain,application/json,*/*",
            },
        });
        if (!response.ok) {
            throw new Error(`SAT source responded ${response.status}`);
        }
        const contentType = response.headers.get("content-type") || "";
        const rawContent = await response.text();
        const readableText = contentType.includes("html")
            ? extractReadableTextFromHtml(rawContent)
            : rawContent;
        const rfcs = extractRfcsFromText(readableText);
        for (const rfc of rfcs) {
            await sat_import_repository_1.satImportRepository.upsertSatEntry({
                rfc,
                legalName: undefined,
                source: source.source,
                listType: source.listType,
                situation: source.situation,
                referenceUrl: source.sourceUrl,
                publishedAt: undefined,
                rawData: buildRawData({
                    source,
                    rfc,
                    importUrl: source.sourceUrl,
                }),
            });
        }
        await sat_import_repository_1.satImportRepository.finishImportLog({
            id: importLog.id,
            status: "success",
            importedCount: rfcs.length,
            metadata: {
                contentType,
                detectedRfcs: rfcs.length,
            },
        });
        return {
            source: source.source,
            sourceName: source.sourceName,
            status: "success",
            importedCount: rfcs.length,
            referenceUrl: source.sourceUrl,
        };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Error desconocido";
        await sat_import_repository_1.satImportRepository.finishImportLog({
            id: importLog.id,
            status: "failed",
            importedCount: 0,
            errorMessage: message,
        });
        return {
            source: source.source,
            sourceName: source.sourceName,
            status: "failed",
            importedCount: 0,
            referenceUrl: source.sourceUrl,
            error: message,
        };
    }
};
exports.satImportService = {
    async importAllSources() {
        const results = [];
        for (const source of sat_import_sources_1.SAT_IMPORT_SOURCES) {
            const result = await importFromSource(source);
            results.push(result);
        }
        return results;
    },
    async getImportLogs() {
        return sat_import_repository_1.satImportRepository.findImportLogs();
    },
};
