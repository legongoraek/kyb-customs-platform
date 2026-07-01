import * as cheerio from "cheerio";
import { satImportRepository } from "./sat.import.repository";
import { SAT_IMPORT_SOURCES, SatImportSource } from "./sat.import.sources";

const RFC_REGEX = /\b[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}\b/g;

const normalizeText = (value?: string | null) => {
  return (value || "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
};

const extractRfcsFromText = (text: string) => {
  const matches = text.toUpperCase().match(RFC_REGEX) || [];

  return Array.from(new Set(matches));
};

const extractReadableTextFromHtml = (html: string) => {
  const $ = cheerio.load(html);

  $("script, style, noscript").remove();

  return $("body").text();
};

const buildRawData = (input: {
  source: SatImportSource;
  rfc: string;
  importUrl: string;
}) => {
  return {
    idioma: "es-MX",
    tipo_registro: "entrada_importada_sat",
    fuente_nombre: input.source.sourceName,
    fuente_url: input.source.sourceUrl,
    url_importada: input.importUrl,
    articulo_cff: input.source.article,
    tipo_listado: input.source.listType,
    descripcion:
      "Registro importado automáticamente desde una fuente pública SAT configurada en la plataforma.",
    criterio_riesgo:
      input.source.riskLevel === "critical"
        ? "Coincidencia crítica. El expediente debe clasificarse como high_risk y bloquear aprobación."
        : "Coincidencia que requiere revisión. El expediente debe incrementar riesgo y requerir revisión humana.",
    nivel_riesgo_kyb: input.source.riskLevel,
    fecha_importacion: new Date().toISOString(),
    rfc_detectado: input.rfc,
    nota:
      "La importación automática extrae RFCs detectados en contenido público SAT y los normaliza en sat_list_entries para consultas auditables.",
  };
};

const importFromSource = async (source: SatImportSource) => {
  const importLog = await satImportRepository.createImportLog({
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
        "User-Agent":
          "KYB-Customs-Platform/1.0 (+https://kyb-customs-platform.vercel.app)",
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
      await satImportRepository.upsertSatEntry({
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

    await satImportRepository.finishImportLog({
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
      status: "success" as const,
      importedCount: rfcs.length,
      referenceUrl: source.sourceUrl,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error desconocido";

    await satImportRepository.finishImportLog({
      id: importLog.id,
      status: "failed",
      importedCount: 0,
      errorMessage: message,
    });

    return {
      source: source.source,
      sourceName: source.sourceName,
      status: "failed" as const,
      importedCount: 0,
      referenceUrl: source.sourceUrl,
      error: message,
    };
  }
};

export const satImportService = {
  async importAllSources() {
    const results = [];

    for (const source of SAT_IMPORT_SOURCES) {
      const result = await importFromSource(source);
      results.push(result);
    }

    return results;
  },

  async getImportLogs() {
    return satImportRepository.findImportLogs();
  },
};