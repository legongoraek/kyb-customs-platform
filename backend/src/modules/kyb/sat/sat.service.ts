import { SAT_LIST_TYPES, SAT_SOURCES } from "./sat.constants";
import { satRepository } from "./sat.repository";

const DEFAULT_REFERENCE_URL =
  "https://www.sat.gob.mx/minisitio/DatosAbiertos/contribuyentes_publicados.html";

const getRiskLevelFromEntry = (entry: {
  source: string;
  listType: string;
}) => {
  if (
    entry.source === SAT_SOURCES.ART_69B &&
    entry.listType === SAT_LIST_TYPES.DEFINITIVOS
  ) {
    return "critical";
  }

  if (entry.source === SAT_SOURCES.ART_69B_BIS) {
    return "critical";
  }

  if (
    entry.source === SAT_SOURCES.ART_69B &&
    entry.listType === SAT_LIST_TYPES.PRESUNTOS
  ) {
    return "review";
  }

  if (entry.source === SAT_SOURCES.ART_69) {
    return "review";
  }

  if (entry.source === SAT_SOURCES.ART_49_BIS) {
    return "review";
  }

  return "review";
};

export const satService = {
  async checkRfcAgainstSatLists(input: {
    caseId: string;
    rfc: string;
  }) {
    const rfc = input.rfc.trim().toUpperCase();

    const entries = await satRepository.findEntriesByRfc(rfc);

    if (entries.length === 0) {
      const check = await satRepository.createSatListCheck({
        caseId: input.caseId,
        rfcSearched: rfc,
        source: "SAT_ALL",
        result: "no_match",
        referenceUrl: DEFAULT_REFERENCE_URL,
        rawMatch: {
          entries: [],
          audit: {
            rfcSearched: rfc,
            checkedAt: new Date().toISOString(),
            result: "no_match",
            sourcesChecked: [
              "SAT_ART_69",
              "SAT_ART_69B",
              "SAT_ART_69B_BIS",
              "SAT_ART_49_BIS",
            ],
            sourceTable: "sat_list_entries",
            evidenceTable: "sat_list_checks",
          },
        },
      });

      return {
        result: "no_match" as const,
        riskLevel: "clean" as const,
        entries: [],
        checkIds: [check.id],
      };
    }

    const checkIds: string[] = [];

    for (const entry of entries) {
      const check = await satRepository.createSatListCheck({
        caseId: input.caseId,
        rfcSearched: rfc,
        source: entry.source,
        result: "match",
        referenceUrl: entry.referenceUrl,
        rawMatch: {
          id: entry.id,
          rfc: entry.rfc,
          legalName: entry.legalName,
          source: entry.source,
          listType: entry.listType,
          situation: entry.situation,
          publishedAt: entry.publishedAt,
          referenceUrl: entry.referenceUrl,
          importedAt: entry.importedAt,
          rawData: entry.rawData || {},
          audit: {
            rfcSearched: rfc,
            checkedAt: new Date().toISOString(),
            result: "match",
            sourceTable: "sat_list_entries",
            evidenceTable: "sat_list_checks",
          },
        },
      });

      checkIds.push(check.id);
    }

    const hasCritical = entries.some(
      (entry) => getRiskLevelFromEntry(entry) === "critical"
    );

    const riskLevel = hasCritical ? "critical" : "review";

    return {
      result: "match" as const,
      riskLevel,
      entries,
      checkIds,
    };
  },

  async getLatestChecks(caseId: string) {
    return satRepository.findLatestChecksByCaseId(caseId);
  },
};