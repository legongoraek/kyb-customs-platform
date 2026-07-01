"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSatListCheck = exports.approveKybCase = exports.runKybCheck = exports.addKybDocumentMetadata = exports.getKybCaseById = exports.getKybCases = exports.createKybCase = void 0;
const kyb_schemas_1 = require("./kyb.schemas");
const kyb_repository_1 = require("./kyb.repository");
const riskEngine_1 = require("./risk/riskEngine");
const sat_service_1 = require("./sat/sat.service");
const getParamId = (req) => {
    const { id } = req.params;
    return Array.isArray(id) ? id[0] : id;
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
        return res.status(201).json({
            ok: true,
            message: "Metadata de documento registrada correctamente",
            data: document,
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
        const kybCase = await kyb_repository_1.kybRepository.findCaseById(getParamId(req));
        if (!kybCase) {
            return res.status(404).json({
                ok: false,
                message: "Expediente KYB no encontrado",
            });
        }
        const riskResult = (0, riskEngine_1.calculateKybRisk)(kybCase);
        const savedRisk = await kyb_repository_1.kybRepository.saveRiskResult({
            caseId: kybCase.id,
            score: riskResult.score,
            decision: riskResult.decision,
            canApprove: riskResult.canApprove,
            explanation: riskResult.explanation,
            riskFactors: riskResult.riskFactors,
        });
        await kyb_repository_1.kybRepository.createAuditLog({
            caseId: kybCase.id,
            action: "KYB_RISK_CHECK_EXECUTED",
            entityType: "risk_score",
            entityId: savedRisk.riskScoreId,
            message: "Score de riesgo KYB calculado correctamente.",
            metadata: {
                score: riskResult.score,
                decision: riskResult.decision,
                canApprove: riskResult.canApprove,
                totalFactors: riskResult.riskFactors.length,
            },
        });
        return res.json({
            ok: true,
            message: "Validación KYB ejecutada",
            data: {
                id: kybCase.id,
                score: riskResult.score,
                decision: riskResult.decision,
                canApprove: riskResult.canApprove,
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
        return res.json({
            ok: true,
            message: "Revisión SAT ejecutada correctamente",
            data: result,
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
