"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKybCaseReportPdf = exports.getKybCaseReportJson = exports.getKybCaseAuditLogs = exports.getSatImportLogs = exports.importSatSources = exports.getSatSources = exports.runSatListCheck = exports.approveKybCase = exports.runKybCheck = exports.addKybDocumentMetadata = exports.getKybCaseById = exports.getKybCases = exports.createKybCase = void 0;
const kyb_schemas_1 = require("./kyb.schemas");
const kyb_repository_1 = require("./kyb.repository");
const riskEngine_1 = require("./risk/riskEngine");
const sat_service_1 = require("./sat/sat.service");
const sat_import_service_1 = require("./sat/sat.import.service");
const kybReport_service_1 = require("./report/kybReport.service");
const getParamId = (req) => {
    const { id } = req.params;
    return Array.isArray(id) ? id[0] : id;
};
const recalculateAndPersistKybRisk = async (caseId, input) => {
    const updatedCase = await kyb_repository_1.kybRepository.findCaseById(caseId);
    if (!updatedCase) {
        return null;
    }
    const riskResult = (0, riskEngine_1.calculateKybRisk)(updatedCase);
    const savedRisk = await kyb_repository_1.kybRepository.saveRiskResult({
        caseId: updatedCase.id,
        score: riskResult.score,
        decision: riskResult.decision,
        canApprove: riskResult.canApprove,
        needsUpdate: riskResult.needsUpdate,
        explanation: riskResult.explanation,
        riskFactors: riskResult.riskFactors,
    });
    await kyb_repository_1.kybRepository.createAuditLog({
        caseId: updatedCase.id,
        action: input.action,
        entityType: input.entityType || "risk_score",
        entityId: input.entityId || savedRisk.riskScoreId,
        message: input.message,
        metadata: {
            triggeredBy: input.triggeredBy,
            score: riskResult.score,
            decision: riskResult.decision,
            canApprove: riskResult.canApprove,
            needsUpdate: riskResult.needsUpdate,
            totalFactors: riskResult.riskFactors.length,
            riskScoreId: savedRisk.riskScoreId,
        },
    });
    return {
        riskScoreId: savedRisk.riskScoreId,
        riskResult,
    };
};
const createKybCase = async (req, res) => {
    const validation = kyb_schemas_1.createKybCaseSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({
            ok: false,
            message: "Datos inválidos",
            errors: validation.error.flatten(),
        });
    }
    try {
        const kybCase = await kyb_repository_1.kybRepository.createCase(validation.data);
        await kyb_repository_1.kybRepository.createAuditLog({
            caseId: kybCase.id,
            action: "KYB_CASE_CREATED",
            entityType: "kyb_case",
            entityId: kybCase.id,
            message: "Expediente KYB creado correctamente.",
            metadata: {
                rfc: kybCase.client.rfc,
                legalName: kybCase.client.legalName,
            },
        });
        return res.status(201).json({
            ok: true,
            message: "Expediente KYB creado correctamente",
            data: kybCase,
        });
    }
    catch (error) {
        console.error("createKybCase error:", error);
        return res.status(500).json({
            ok: false,
            message: "Error al crear expediente KYB",
        });
    }
};
exports.createKybCase = createKybCase;
const getKybCases = async (_req, res) => {
    try {
        const cases = await kyb_repository_1.kybRepository.findAllCases();
        return res.json({
            ok: true,
            data: cases,
        });
    }
    catch (error) {
        console.error("getKybCases error:", error);
        return res.status(500).json({
            ok: false,
            message: "Error al obtener expedientes KYB",
        });
    }
};
exports.getKybCases = getKybCases;
const getKybCaseById = async (req, res) => {
    try {
        const kybCase = await kyb_repository_1.kybRepository.findCaseById(getParamId(req));
        if (!kybCase) {
            return res.status(404).json({
                ok: false,
                message: "Expediente KYB no encontrado",
            });
        }
        return res.json({
            ok: true,
            data: kybCase,
        });
    }
    catch (error) {
        console.error("getKybCaseById error:", error);
        return res.status(500).json({
            ok: false,
            message: "Error al obtener expediente KYB",
        });
    }
};
exports.getKybCaseById = getKybCaseById;
const addKybDocumentMetadata = async (req, res) => {
    try {
        const kybCase = await kyb_repository_1.kybRepository.findCaseById(getParamId(req));
        if (!kybCase) {
            return res.status(404).json({
                ok: false,
                message: "Expediente KYB no encontrado",
            });
        }
        const validation = kyb_schemas_1.addKybDocumentMetadataSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                ok: false,
                message: "Metadata de documento inválida",
                errors: validation.error.flatten(),
            });
        }
        const expirationDate = validation.data.expirationDate;
        const isExpired = expirationDate
            ? new Date(expirationDate).getTime() < Date.now()
            : false;
        const document = await kyb_repository_1.kybRepository.addDocumentMetadata({
            caseId: kybCase.id,
            type: validation.data.type,
            status: isExpired ? "expired" : "uploaded",
            issueDate: validation.data.issueDate,
            expirationDate: validation.data.expirationDate,
            extractedRfc: validation.data.extractedRfc?.trim().toUpperCase(),
            extractedLegalName: validation.data.extractedLegalName?.trim().toUpperCase(),
            extractedAddress: validation.data.extractedAddress?.trim(),
            extractedRepresentative: validation.data.extractedRepresentative
                ?.trim()
                .toUpperCase(),
            fileUrl: validation.data.fileUrl,
        });
        await kyb_repository_1.kybRepository.createAuditLog({
            caseId: kybCase.id,
            action: "KYB_DOCUMENT_METADATA_ADDED",
            entityType: "kyb_document",
            entityId: document.id,
            message: `Metadata registrada para documento ${document.type}.`,
            metadata: {
                documentType: document.type,
                status: document.status,
            },
        });
        const recalculatedRisk = await recalculateAndPersistKybRisk(kybCase.id, {
            action: "KYB_RISK_RECALCULATED_AFTER_DOCUMENT_METADATA",
            message: "Score de riesgo KYB recalculado automáticamente después de registrar metadata documental.",
            triggeredBy: "document_metadata_added",
            entityType: "kyb_document",
            entityId: document.id,
        });
        return res.status(201).json({
            ok: true,
            message: "Metadata de documento registrada correctamente y score KYB recalculado automáticamente",
            data: document,
            riskResult: recalculatedRisk?.riskResult || null,
        });
    }
    catch (error) {
        console.error("addKybDocumentMetadata error:", error);
        return res.status(500).json({
            ok: false,
            message: "Error al registrar metadata de documento",
        });
    }
};
exports.addKybDocumentMetadata = addKybDocumentMetadata;
const runKybCheck = async (req, res) => {
    try {
        const caseId = getParamId(req);
        const kybCase = await kyb_repository_1.kybRepository.findCaseById(caseId);
        if (!kybCase) {
            return res.status(404).json({
                ok: false,
                message: "Expediente KYB no encontrado",
            });
        }
        const recalculatedRisk = await recalculateAndPersistKybRisk(kybCase.id, {
            action: "KYB_RISK_CHECK_EXECUTED",
            message: "Score de riesgo KYB calculado correctamente.",
            triggeredBy: "manual_risk_check",
        });
        if (!recalculatedRisk) {
            return res.status(404).json({
                ok: false,
                message: "Expediente KYB no encontrado",
            });
        }
        const { riskResult } = recalculatedRisk;
        return res.json({
            ok: true,
            message: "Validación KYB ejecutada",
            data: {
                id: kybCase.id,
                score: riskResult.score,
                decision: riskResult.decision,
                canApprove: riskResult.canApprove,
                needsUpdate: riskResult.needsUpdate,
                riskFactors: riskResult.riskFactors,
                explanation: riskResult.explanation,
            },
        });
    }
    catch (error) {
        console.error("runKybCheck error:", error);
        return res.status(500).json({
            ok: false,
            message: "Error al ejecutar validación KYB",
        });
    }
};
exports.runKybCheck = runKybCheck;
const approveKybCase = async (req, res) => {
    try {
        const kybCase = await kyb_repository_1.kybRepository.findCaseById(getParamId(req));
        if (!kybCase) {
            return res.status(404).json({
                ok: false,
                message: "Expediente KYB no encontrado",
            });
        }
        if (kybCase.decision !== "safe") {
            return res.status(409).json({
                ok: false,
                message: "No se puede aprobar el expediente porque no tiene decisión safe.",
                data: {
                    decision: kybCase.decision,
                    score: kybCase.score,
                },
            });
        }
        await kyb_repository_1.kybRepository.createAuditLog({
            caseId: kybCase.id,
            action: "KYB_CASE_APPROVAL_ATTEMPTED",
            entityType: "kyb_case",
            entityId: kybCase.id,
            message: "Intento de aprobación de expediente KYB.",
            metadata: {
                decision: kybCase.decision,
                score: kybCase.score,
            },
        });
        return res.json({
            ok: true,
            message: "Expediente aprobado",
            data: kybCase,
        });
    }
    catch (error) {
        console.error("approveKybCase error:", error);
        return res.status(500).json({
            ok: false,
            message: "Error al aprobar expediente KYB",
        });
    }
};
exports.approveKybCase = approveKybCase;
const runSatListCheck = async (req, res) => {
    try {
        const kybCase = await kyb_repository_1.kybRepository.findCaseById(getParamId(req));
        if (!kybCase) {
            return res.status(404).json({
                ok: false,
                message: "Expediente KYB no encontrado",
            });
        }
        const result = await sat_service_1.satService.checkRfcAgainstSatLists({
            caseId: kybCase.id,
            rfc: kybCase.client.rfc,
        });
        await kyb_repository_1.kybRepository.createAuditLog({
            caseId: kybCase.id,
            action: "SAT_LIST_CHECK_EXECUTED",
            entityType: "sat_list_check",
            message: "Revisión contra listas fiscales SAT ejecutada.",
            metadata: {
                rfc: kybCase.client.rfc,
                result: result.result,
                riskLevel: result.riskLevel,
                matches: result.entries.length,
                checkIds: result.checkIds,
            },
        });
        const recalculatedRisk = await recalculateAndPersistKybRisk(kybCase.id, {
            action: "KYB_RISK_RECALCULATED_AFTER_SAT_CHECK",
            message: "Score de riesgo KYB recalculado automáticamente después de la revisión SAT.",
            triggeredBy: "sat_list_check",
            entityType: "sat_list_check",
            entityId: result.checkIds?.[0],
        });
        return res.json({
            ok: true,
            message: "Revisión SAT ejecutada correctamente y score KYB recalculado automáticamente",
            data: result,
            riskResult: recalculatedRisk?.riskResult || null,
        });
    }
    catch (error) {
        console.error("runSatListCheck error:", error);
        return res.status(500).json({
            ok: false,
            message: "Error al ejecutar revisión SAT",
        });
    }
};
exports.runSatListCheck = runSatListCheck;
const getSatSources = async (_req, res) => {
    return res.json({
        ok: true,
        data: [
            {
                source: "SAT_ART_69",
                name: "Artículo 69 CFF / Contribuyentes incumplidos",
                description: "Consulta pública del SAT para conocer RFC, nombre, denominación o razón social de contribuyentes con adeudos firmes, exigibles, no localizados, cancelados, con sentencia condenatoria por delito fiscal o con créditos fiscales condonados.",
                riskUse: "Una coincidencia en esta fuente incrementa el riesgo y requiere revisión humana.",
                kybRiskLevel: "review",
                referenceUrl: "https://wwwmat.sat.gob.mx/consultas/11981/consulta-la-relacion-de-contribuyentes-incumplidos",
            },
            {
                source: "SAT_ART_69B",
                name: "Artículo 69-B CFF / Operaciones presuntamente inexistentes",
                description: "Consulta pública del SAT para conocer si un contribuyente se ubica en la presunción de realizar operaciones inexistentes mediante la emisión de facturas o comprobantes fiscales.",
                riskUse: "Una coincidencia como presunto requiere revisión humana; una coincidencia como definitivo se considera crítica y bloquea aprobación.",
                kybRiskLevel: "review_or_critical",
                referenceUrl: "https://wwwmat.sat.gob.mx/consultas/76674/consulta-la-relacion-de-contribuyentes-con-operaciones-presuntamente-inexistentes",
            },
            {
                source: "SAT_ART_69B_BIS",
                name: "Artículo 69-B Bis CFF / Datos abiertos SAT",
                description: "Fuente pública del SAT relacionada con contribuyentes publicados conforme a los artículos 69-B y 69-B Bis del Código Fiscal de la Federación.",
                riskUse: "Una coincidencia en esta fuente se considera crítica para el flujo KYB y bloquea aprobación.",
                kybRiskLevel: "critical",
                referenceUrl: "https://www.sat.gob.mx/minisitio/DatosAbiertos/contribuyentes_publicados.html",
            },
            {
                source: "SAT_ART_49_BIS",
                name: "Artículo 49 Bis CFF / Fuente pública justificable",
                description: "Fuente pública considerada para justificar revisión de obligaciones y contexto de riesgo fiscal/preventivo.",
                riskUse: "Una coincidencia o alerta asociada a esta fuente requiere revisión humana.",
                kybRiskLevel: "review",
                referenceUrl: "https://sppld.sat.gob.mx/pld/interiores/obligaciones.html",
            },
        ],
        auditModel: {
            table: "sat_list_checks",
            fields: [
                "rfc_searched",
                "source",
                "result",
                "reference_url",
                "raw_match",
                "checked_at",
            ],
            description: "Cada revisión SAT guarda fuente, fecha/hora, RFC buscado, resultado, referencia utilizada y evidencia cruda.",
        },
    });
};
exports.getSatSources = getSatSources;
const importSatSources = async (_req, res) => {
    try {
        const results = await sat_import_service_1.satImportService.importAllSources();
        return res.json({
            ok: true,
            message: "Importación SAT ejecutada correctamente",
            data: results,
        });
    }
    catch (error) {
        console.error("importSatSources error:", error);
        return res.status(500).json({
            ok: false,
            message: "Error al ejecutar importación SAT",
        });
    }
};
exports.importSatSources = importSatSources;
const getSatImportLogs = async (_req, res) => {
    try {
        const logs = await sat_import_service_1.satImportService.getImportLogs();
        return res.json({
            ok: true,
            data: logs,
        });
    }
    catch (error) {
        console.error("getSatImportLogs error:", error);
        return res.status(500).json({
            ok: false,
            message: "Error al obtener logs de importación SAT",
        });
    }
};
exports.getSatImportLogs = getSatImportLogs;
const getKybCaseAuditLogs = async (req, res) => {
    try {
        const caseId = getParamId(req);
        const kybCase = await kyb_repository_1.kybRepository.findCaseById(caseId);
        if (!kybCase) {
            return res.status(404).json({
                ok: false,
                message: "Expediente KYB no encontrado",
            });
        }
        const auditLogs = await kyb_repository_1.kybRepository.findAuditLogsByCaseId(caseId);
        return res.json({
            ok: true,
            data: auditLogs,
        });
    }
    catch (error) {
        console.error("getKybCaseAuditLogs error:", error);
        return res.status(500).json({
            ok: false,
            message: "Error al obtener audit logs",
        });
    }
};
exports.getKybCaseAuditLogs = getKybCaseAuditLogs;
const getKybCaseReportJson = async (req, res) => {
    try {
        const caseId = getParamId(req);
        const kybCase = await kyb_repository_1.kybRepository.findCaseById(caseId);
        if (!kybCase) {
            return res.status(404).json({
                ok: false,
                message: "Expediente KYB no encontrado",
            });
        }
        const auditLogs = await kyb_repository_1.kybRepository.findAuditLogsByCaseId(caseId);
        const latestRiskScore = await kyb_repository_1.kybRepository.findLatestRiskScoreByCaseId(caseId);
        const report = kybReport_service_1.kybReportService.buildJsonReport({
            generatedAt: new Date().toISOString(),
            kybCase,
            auditLogs,
            latestRiskScore,
        });
        return res.json({
            ok: true,
            data: report,
        });
    }
    catch (error) {
        console.error("getKybCaseReportJson error:", error);
        return res.status(500).json({
            ok: false,
            message: "Error al generar reporte JSON",
        });
    }
};
exports.getKybCaseReportJson = getKybCaseReportJson;
const getKybCaseReportPdf = async (req, res) => {
    try {
        const caseId = getParamId(req);
        const kybCase = await kyb_repository_1.kybRepository.findCaseById(caseId);
        if (!kybCase) {
            return res.status(404).json({
                ok: false,
                message: "Expediente KYB no encontrado",
            });
        }
        const auditLogs = await kyb_repository_1.kybRepository.findAuditLogsByCaseId(caseId);
        const latestRiskScore = await kyb_repository_1.kybRepository.findLatestRiskScoreByCaseId(caseId);
        const reportData = {
            generatedAt: new Date().toISOString(),
            kybCase,
            auditLogs,
            latestRiskScore,
        };
        const pdf = kybReport_service_1.kybReportService.buildPdfReport(reportData);
        const filename = `kyb-report-${kybCase.client.rfc}.pdf`;
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        pdf.pipe(res);
    }
    catch (error) {
        console.error("getKybCaseReportPdf error:", error);
        return res.status(500).json({
            ok: false,
            message: "Error al generar reporte PDF",
        });
    }
};
exports.getKybCaseReportPdf = getKybCaseReportPdf;
