"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.satService = void 0;
const sat_constants_1 = require("./sat.constants");
const sat_repository_1 = require("./sat.repository");
const DEFAULT_REFERENCE_URL = "https://www.sat.gob.mx/minisitio/DatosAbiertos/contribuyentes_publicados.html";
const getRiskLevelFromEntry = (entry) => {
    if (entry.source === sat_constants_1.SAT_SOURCES.ART_69B &&
        entry.listType === sat_constants_1.SAT_LIST_TYPES.DEFINITIVOS) {
        return "critical";
    }
    if (entry.source === sat_constants_1.SAT_SOURCES.ART_69B_BIS) {
        return "critical";
    }
    if (entry.source === sat_constants_1.SAT_SOURCES.ART_69B &&
        entry.listType === sat_constants_1.SAT_LIST_TYPES.PRESUNTOS) {
        return "review";
    }
    if (entry.source === sat_constants_1.SAT_SOURCES.ART_69) {
        return "review";
    }
    if (entry.source === sat_constants_1.SAT_SOURCES.ART_49_BIS) {
        return "review";
    }
    return "review";
};
exports.satService = {
    async checkRfcAgainstSatLists(input) {
        const rfc = input.rfc.trim().toUpperCase();
        const entries = await sat_repository_1.satRepository.findEntriesByRfc(rfc);
        if (entries.length === 0) {
            const check = await sat_repository_1.satRepository.createSatListCheck({
                caseId: input.caseId,
                rfcSearched: rfc,
                source: "SAT_ALL",
                result: "no_match",
                referenceUrl: DEFAULT_REFERENCE_URL,
                rawMatch: {
                    entries: [],
                },
            });
            return {
                result: "no_match",
                riskLevel: "clean",
                entries: [],
                checkIds: [check.id],
            };
        }
        const checkIds = [];
        for (const entry of entries) {
            const check = await sat_repository_1.satRepository.createSatListCheck({
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
                },
            });
            checkIds.push(check.id);
        }
        const hasCritical = entries.some((entry) => getRiskLevelFromEntry(entry) === "critical");
        const riskLevel = hasCritical ? "critical" : "review";
        return {
            result: "match",
            riskLevel,
            entries,
            checkIds,
        };
    },
    async getLatestChecks(caseId) {
        return sat_repository_1.satRepository.findLatestChecksByCaseId(caseId);
    },
};
