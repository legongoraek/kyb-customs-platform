import { Request, Response } from "express";
import { randomUUID } from "crypto";
import {
  addKybDocumentMetadataSchema,
  createKybCaseSchema,
} from "./kyb.schemas";
import { kybCases } from "./kyb.mock-data";
import { KYB_CASE_STATUS } from "./kyb.constants";
import { KybCase, KybDocument } from "./kyb.types";

export const createKybCase = async (req: Request, res: Response) => {
  const validation = createKybCaseSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      ok: false,
      message: "Datos inválidos",
      errors: validation.error.flatten(),
    });
  }

  const now = new Date().toISOString();

  const newCase: KybCase = {
    id: randomUUID(),
    status: KYB_CASE_STATUS.DRAFT,
    decision: null,
    score: 0,
    client: validation.data,
    documents: [],
    riskFactors: [],
    createdAt: now,
    updatedAt: now,
  };

  kybCases.push(newCase);

  return res.status(201).json({
    ok: true,
    message: "Expediente KYB creado correctamente",
    data: newCase,
  });
};

export const getKybCases = async (_req: Request, res: Response) => {
  return res.json({
    ok: true,
    data: kybCases,
  });
};

export const getKybCaseById = async (req: Request, res: Response) => {
  const kybCase = kybCases.find((item) => item.id === req.params.id);

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
};

export const addKybDocumentMetadata = async (req: Request, res: Response) => {
  const kybCase = kybCases.find((item) => item.id === req.params.id);

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

  const now = new Date().toISOString();

  const expirationDate = validation.data.expirationDate;
  const isExpired = expirationDate
    ? new Date(expirationDate).getTime() < Date.now()
    : false;

  const document: KybDocument = {
    id: randomUUID(),
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
    createdAt: now,
  };

  kybCase.documents.push(document);
  kybCase.updatedAt = now;

  return res.status(201).json({
    ok: true,
    message: "Metadata de documento registrada correctamente",
    data: document,
  });
};

export const runKybCheck = async (req: Request, res: Response) => {
  const kybCase = kybCases.find((item) => item.id === req.params.id);

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
};

export const approveKybCase = async (req: Request, res: Response) => {
  const kybCase = kybCases.find((item) => item.id === req.params.id);

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

  kybCase.status = KYB_CASE_STATUS.APPROVED;
  kybCase.updatedAt = new Date().toISOString();

  return res.json({
    ok: true,
    message: "Expediente aprobado",
    data: kybCase,
  });
};