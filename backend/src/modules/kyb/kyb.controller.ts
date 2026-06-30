import { Request, Response } from "express";
import {
  addKybDocumentMetadataSchema,
  createKybCaseSchema,
} from "./kyb.schemas";
import { kybRepository } from "./kyb.repository";

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
    const kybCase = await kybRepository.findCaseById(req.params.id);

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
    const kybCase = await kybRepository.findCaseById(req.params.id);

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
    const kybCase = await kybRepository.findCaseById(req.params.id);

    if (!kybCase) {
      return res.status(404).json({
        ok: false,
        message: "Expediente KYB no encontrado",
      });
    }

    return res.json({
      ok: true,
      message: "Validación KYB ejecutada",
      data: {
        id: kybCase.id,
        score: kybCase.score,
        decision: kybCase.decision,
        riskFactors: kybCase.riskFactors,
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
    const kybCase = await kybRepository.findCaseById(req.params.id);

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