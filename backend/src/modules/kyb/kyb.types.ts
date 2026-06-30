import {
  KYB_CASE_STATUS,
  KYB_DECISIONS,
  KYB_DOCUMENT_TYPES,
} from "./kyb.constants";

export type KybDocumentType =
  (typeof KYB_DOCUMENT_TYPES)[keyof typeof KYB_DOCUMENT_TYPES];

export type KybDecision =
  (typeof KYB_DECISIONS)[keyof typeof KYB_DECISIONS];

export type KybCaseStatus =
  (typeof KYB_CASE_STATUS)[keyof typeof KYB_CASE_STATUS];

export type KybDocumentStatus = "missing" | "uploaded" | "valid" | "expired";

export type KybClient = {
  rfc: string;
  legalName: string;
  address: string;
  legalRepresentativeName: string;
  shareholders?: string[];
  beneficialOwner?: string;
};

export type KybDocument = {
  id: string;
  caseId: string;
  type: KybDocumentType;
  status: KybDocumentStatus;
  issueDate?: string;
  expirationDate?: string;
  extractedRfc?: string;
  extractedLegalName?: string;
  extractedAddress?: string;
  extractedRepresentative?: string;
  fileUrl?: string;
  createdAt: string;
};

export type RiskFactor = {
  code: string;
  label: string;
  description: string;
  points: number;
  severity: "low" | "medium" | "high" | "critical";
  evidence?: Record<string, unknown>;
};

export type KybCase = {
  id: string;
  status: KybCaseStatus;
  decision: KybDecision | null;
  score: number;
  client: KybClient;
  documents: KybDocument[];
  riskFactors: RiskFactor[];
  createdAt: string;
  updatedAt: string;
};