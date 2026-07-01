import { Request, Response } from "express";
import {
  addKybDocumentMetadataSchema,
  createKybCaseSchema,
} from "./kyb.schemas";
import { kybRepository } from "./kyb.repository";
import { calculateKybRisk } from "./risk/riskEngine";
import { satService } from "./sat/sat.service";
import { satImportService } from "./sat/sat.import.service";

const getParamId = (req: Request) => {
  const { id } = req.params;

  return Array.isArray(id) ? id[0] : id;
};

export const createKybCase = async (req: Request, res: Response) => {
  const validation = createKybCaseSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      ok: false,
      message: "Datos inválidos",
      errors: validation.error.flatten(),
    });
  }

  try {
    const kybCase = await kybRepository.createCase(validation.data);

    await kybRepository.createAuditLog({
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
  } catch (error) {
    console.error("createKybCase error:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al crear expediente KYB",
    });
  }
};

export const getKybCases = async (_req: Request, res: Response) => {
  try {
    const cases = await kybRepository.findAllCases();

    return res.json({
      ok: true,
      data: cases,
    });
  } catch (error) {
    console.error("getKybCases error:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al obtener expedientes KYB",
    });
  }
};

export const getKybCaseById = async (req: Request, res: Response) => {
  try {
    const kybCase = await kybRepository.findCaseById(getParamId(req));

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
  } catch (error) {
    console.error("getKybCaseById error:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al obtener expediente KYB",
    });
  }
};

export const addKybDocumentMetadata = async (req: Request, res: Response) => {
  try {
    const kybCase = await kybRepository.findCaseById(getParamId(req));

    if (!kybCase) {
      return res.status(404).json({
        ok: false,
        message: "Expediente KYB no encontrado",
      });
    }

    const validation = addKybDocumentMetadataSchema.safeParse(req.body);

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

    const document = await kybRepository.addDocumentMetadata({
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

    await kybRepository.createAuditLog({
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
  } catch (error) {
    console.error("addKybDocumentMetadata error:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al registrar metadata de documento",
    });
  }
};

export const runKybCheck = async (req: Request, res: Response) => {
  try {
    const kybCase = await kybRepository.findCaseById(getParamId(req));

    if (!kybCase) {
      return res.status(404).json({
        ok: false,
        message: "Expediente KYB no encontrado",
      });
    }

    const riskResult = calculateKybRisk(kybCase);

    const savedRisk = await kybRepository.saveRiskResult({
      caseId: kybCase.id,
      score: riskResult.score,
      decision: riskResult.decision,
      canApprove: riskResult.canApprove,
      needsUpdate: riskResult.needsUpdate,
      explanation: riskResult.explanation,
      riskFactors: riskResult.riskFactors,
    });

    await kybRepository.createAuditLog({
      caseId: kybCase.id,
      action: "KYB_RISK_CHECK_EXECUTED",
      entityType: "risk_score",
      entityId: savedRisk.riskScoreId,
      message: "Score de riesgo KYB calculado correctamente.",
      metadata: {
        score: riskResult.score,
        decision: riskResult.decision,
        canApprove: riskResult.canApprove,
        needsUpdate: riskResult.needsUpdate,
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
        needsUpdate: riskResult.needsUpdate,
        riskFactors: riskResult.riskFactors,
        explanation: riskResult.explanation,
      },
    });
  } catch (error) {
    console.error("runKybCheck error:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al ejecutar validación KYB",
    });
  }
};

export const approveKybCase = async (req: Request, res: Response) => {
  try {
    const kybCase = await kybRepository.findCaseById(getParamId(req));

    if (!kybCase) {
      return res.status(404).json({
        ok: false,
        message: "Expediente KYB no encontrado",
      });
    }

    if (kybCase.decision !== "safe") {
      return res.status(409).json({
        ok: false,
        message:
          "No se puede aprobar el expediente porque no tiene decisión safe.",
        data: {
          decision: kybCase.decision,
          score: kybCase.score,
        },
      });
    }

    await kybRepository.createAuditLog({
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
  } catch (error) {
    console.error("approveKybCase error:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al aprobar expediente KYB",
    });
  }
};

export const runSatListCheck = async (req: Request, res: Response) => {
  try {
    const kybCase = await kybRepository.findCaseById(getParamId(req));

    if (!kybCase) {
      return res.status(404).json({
        ok: false,
        message: "Expediente KYB no encontrado",
      });
    }

    const result = await satService.checkRfcAgainstSatLists({
      caseId: kybCase.id,
      rfc: kybCase.client.rfc,
    });

    await kybRepository.createAuditLog({
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
  } catch (error) {
    console.error("runSatListCheck error:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al ejecutar revisión SAT",
    });
  }
};

export const getSatSources = async (_req: Request, res: Response) => {
  return res.json({
    ok: true,
    data: [
      {
        source: "SAT_ART_69",
        name: "Artículo 69 CFF / Contribuyentes incumplidos",
        description:
          "Consulta pública del SAT para conocer RFC, nombre, denominación o razón social de contribuyentes con adeudos firmes, exigibles, no localizados, cancelados, con sentencia condenatoria por delito fiscal o con créditos fiscales condonados.",
        riskUse:
          "Una coincidencia en esta fuente incrementa el riesgo y requiere revisión humana.",
        kybRiskLevel: "review",
        referenceUrl:
          "https://wwwmat.sat.gob.mx/consultas/11981/consulta-la-relacion-de-contribuyentes-incumplidos",
      },
      {
        source: "SAT_ART_69B",
        name: "Artículo 69-B CFF / Operaciones presuntamente inexistentes",
        description:
          "Consulta pública del SAT para conocer si un contribuyente se ubica en la presunción de realizar operaciones inexistentes mediante la emisión de facturas o comprobantes fiscales.",
        riskUse:
          "Una coincidencia como presunto requiere revisión humana; una coincidencia como definitivo se considera crítica y bloquea aprobación.",
        kybRiskLevel: "review_or_critical",
        referenceUrl:
          "https://wwwmat.sat.gob.mx/consultas/76674/consulta-la-relacion-de-contribuyentes-con-operaciones-presuntamente-inexistentes",
      },
      {
        source: "SAT_ART_69B_BIS",
        name: "Artículo 69-B Bis CFF / Datos abiertos SAT",
        description:
          "Fuente pública del SAT relacionada con contribuyentes publicados conforme a los artículos 69-B y 69-B Bis del Código Fiscal de la Federación.",
        riskUse:
          "Una coincidencia en esta fuente se considera crítica para el flujo KYB y bloquea aprobación.",
        kybRiskLevel: "critical",
        referenceUrl:
          "https://www.sat.gob.mx/minisitio/DatosAbiertos/contribuyentes_publicados.html",
      },
      {
        source: "SAT_ART_49_BIS",
        name: "Artículo 49 Bis CFF / Fuente pública justificable",
        description:
          "Fuente pública considerada para justificar revisión de obligaciones y contexto de riesgo fiscal/preventivo.",
        riskUse:
          "Una coincidencia o alerta asociada a esta fuente requiere revisión humana.",
        kybRiskLevel: "review",
        referenceUrl:
          "https://sppld.sat.gob.mx/pld/interiores/obligaciones.html",
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
      description:
        "Cada revisión SAT guarda fuente, fecha/hora, RFC buscado, resultado, referencia utilizada y evidencia cruda.",
    },
  });
};

export const importSatSources = async (_req: Request, res: Response) => {
  try {
    const results = await satImportService.importAllSources();

    return res.json({
      ok: true,
      message: "Importación SAT ejecutada correctamente",
      data: results,
    });
  } catch (error) {
    console.error("importSatSources error:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al ejecutar importación SAT",
    });
  }
};

export const getSatImportLogs = async (_req: Request, res: Response) => {
  try {
    const logs = await satImportService.getImportLogs();

    return res.json({
      ok: true,
      data: logs,
    });
  } catch (error) {
    console.error("getSatImportLogs error:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al obtener logs de importación SAT",
    });
  }
};