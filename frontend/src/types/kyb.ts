export type KybDecision = "safe" | "review_required" | "high_risk" | null;

export type KybStatus =
  | "draft"
  | "needs_update"
  | "in_review"
  | "approved"
  | "rejected"
  | "review_required"
  | "high_risk";

export type KybDocumentType =
  | "ACTA_CONSTITUTIVA"
  | "IDENTIFICACION_REPRESENTANTE"
  | "PODER_REPRESENTANTE"
  | "COMPROBANTE_DOMICILIO"
  | "RFC"
  | "CONSTANCIA_SITUACION_FISCAL"
  | "MANIFESTACION_BAJO_PROTESTA"
  | "SOCIOS_ACCIONISTAS"
  | "BENEFICIARIO_CONTROLADOR";

export type KybDocument = {
  id: string;
  caseId: string;
  type: KybDocumentType;
  status: "missing" | "uploaded" | "valid" | "expired";
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

export type SatListCheck = {
  id: string;
  caseId: string;
  rfcSearched: string;
  source: string;
  result: "match" | "no_match" | "error";
  referenceUrl: string;
  rawMatch?: Record<string, unknown>;
  checkedAt: string;
};

export type KybCase = {
  id: string;
  status: KybStatus;
  decision: KybDecision;
  score: number;
  canApprove: boolean;
  client: {
    rfc: string;
    legalName: string;
    address: string;
    legalRepresentativeName: string;
    shareholders?: string[];
    beneficialOwner?: string;
  };
  documents: KybDocument[];
  satListChecks: SatListCheck[];
  riskFactors: RiskFactor[];
  createdAt: string;
  updatedAt: string;
};

export type RiskResult = {
  id: string;
  score: number;
  decision: Exclude<KybDecision, null>;
  canApprove: boolean;
  riskFactors: RiskFactor[];
  explanation: string;
};