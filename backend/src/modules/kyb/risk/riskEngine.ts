    import {
  KYB_DECISIONS,
  KYB_DOCUMENT_TYPES,
  RISK_RULES,
} from "../kyb.constants";
import { KybCase, KybDecision, RiskFactor } from "../kyb.types";

const REQUIRED_DOCUMENTS = [
  KYB_DOCUMENT_TYPES.ACTA_CONSTITUTIVA,
  KYB_DOCUMENT_TYPES.IDENTIFICACION_REPRESENTANTE,
  KYB_DOCUMENT_TYPES.COMPROBANTE_DOMICILIO,
  KYB_DOCUMENT_TYPES.RFC,
  KYB_DOCUMENT_TYPES.CONSTANCIA_SITUACION_FISCAL,
  KYB_DOCUMENT_TYPES.MANIFESTACION_BAJO_PROTESTA,
];

const normalizeText = (value?: string | null) => {
  return (value || "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,]/g, "")
    .replace(/\s+/g, " ");
};

const isSameText = (a?: string | null, b?: string | null) => {
  return normalizeText(a) === normalizeText(b);
};

const isCurrentMonth = (date?: string) => {
  if (!date) return false;

  const inputDate = new Date(date);
  const now = new Date();

  return (
    inputDate.getUTCFullYear() === now.getUTCFullYear() &&
    inputDate.getUTCMonth() === now.getUTCMonth()
  );
};

const createRiskFactor = (input: RiskFactor): RiskFactor => input;

const getDecision = (score: number, hasCriticalRisk: boolean): KybDecision => {
  if (hasCriticalRisk) return KYB_DECISIONS.HIGH_RISK;
  if (score >= 60) return KYB_DECISIONS.HIGH_RISK;
  if (score >= 25) return KYB_DECISIONS.REVIEW_REQUIRED;

  return KYB_DECISIONS.SAFE;
};

export const calculateKybRisk = (kybCase: KybCase) => {
  const riskFactors: RiskFactor[] = [];
  let hasCriticalRisk = false;
  let needsUpdate = false;

  const documents = kybCase.documents || [];

  const findDocument = (type: string) => {
    return documents.find((document) => document.type === type);
  };

  /**
   * 1. Documentos faltantes
   */
  for (const documentType of REQUIRED_DOCUMENTS) {
    const document = findDocument(documentType);

    if (!document) {
      riskFactors.push(
        createRiskFactor({
          code: "MISSING_REQUIRED_DOCUMENT",
          label: "Documento obligatorio faltante",
          description: `No se registró el documento obligatorio: ${documentType}.`,
          points: RISK_RULES.MISSING_REQUIRED_DOCUMENT,
          severity: "medium",
          evidence: {
            documentType,
          },
        })
      );
    }
  }

  /**
   * 2. Documentos vencidos
   */
  for (const document of documents) {
    const isExpired =
      document.status === "expired" ||
      Boolean(
        document.expirationDate &&
        new Date(document.expirationDate).getTime() < Date.now(),
      );

    if (isExpired) {
      needsUpdate = true;
      riskFactors.push(
        createRiskFactor({
          code: "EXPIRED_DOCUMENT",
          label: "Documento vencido",
          description: `El documento ${document.type} está vencido.`,
          points: RISK_RULES.EXPIRED_DOCUMENT,
          severity: "high",
          evidence: {
            documentId: document.id,
            documentType: document.type,
            expirationDate: document.expirationDate,
          },
        }),
      );
    }
  }

  /**
   * 3. CSF fuera del mes vigente
   */
  const csfDocument = findDocument(KYB_DOCUMENT_TYPES.CONSTANCIA_SITUACION_FISCAL);

  if (!csfDocument) {
    riskFactors.push(
      createRiskFactor({
        code: "MISSING_CSF",
        label: "Constancia de situación fiscal faltante",
        description: "No se registró la constancia de situación fiscal.",
        points: RISK_RULES.MISSING_REQUIRED_DOCUMENT,
        severity: "medium",
        evidence: {
          documentType: KYB_DOCUMENT_TYPES.CONSTANCIA_SITUACION_FISCAL,
        },
      })
    );
  } else if (!isCurrentMonth(csfDocument.issueDate)) {
    needsUpdate = true;
    riskFactors.push(
      createRiskFactor({
        code: "CSF_NOT_CURRENT_MONTH",
        label: "CSF fuera del mes vigente",
        description:
          "La constancia de situación fiscal no corresponde al mes vigente.",
        points: RISK_RULES.CSF_NOT_CURRENT_MONTH,
        severity: "high",
        evidence: {
          documentId: csfDocument.id,
          issueDate: csfDocument.issueDate,
        },
      })
    );
  }

  /**
   * 4. Discrepancias RFC y razón social
   */
  const documentsWithRfc = documents.filter((document) => document.extractedRfc);

  for (const document of documentsWithRfc) {
    if (!isSameText(kybCase.client.rfc, document.extractedRfc)) {
      riskFactors.push(
        createRiskFactor({
          code: "RFC_DISCREPANCY",
          label: "Discrepancia de RFC",
          description: `El RFC del formulario no coincide con el RFC extraído del documento ${document.type}.`,
          points: RISK_RULES.MATERIAL_DISCREPANCY,
          severity: "high",
          evidence: {
            documentId: document.id,
            documentType: document.type,
            formValue: kybCase.client.rfc,
            documentValue: document.extractedRfc,
          },
        })
      );
    }
  }

  const documentsWithLegalName = documents.filter(
    (document) => document.extractedLegalName
  );

  for (const document of documentsWithLegalName) {
    if (!isSameText(kybCase.client.legalName, document.extractedLegalName)) {
      riskFactors.push(
        createRiskFactor({
          code: "LEGAL_NAME_DISCREPANCY",
          label: "Discrepancia de razón social",
          description: `La razón social del formulario no coincide con la razón social extraída del documento ${document.type}.`,
          points: RISK_RULES.MATERIAL_DISCREPANCY,
          severity: "high",
          evidence: {
            documentId: document.id,
            documentType: document.type,
            formValue: kybCase.client.legalName,
            documentValue: document.extractedLegalName,
          },
        })
      );
    }
  }

  /**
   * 5. Discrepancias de domicilio
   */
  const documentsWithAddress = documents.filter(
    (document) => document.extractedAddress
  );

  for (const document of documentsWithAddress) {
    if (!isSameText(kybCase.client.address, document.extractedAddress)) {
      riskFactors.push(
        createRiskFactor({
          code: "ADDRESS_DISCREPANCY",
          label: "Discrepancia de domicilio",
          description: `El domicilio del formulario no coincide con el domicilio extraído del documento ${document.type}.`,
          points: RISK_RULES.MATERIAL_DISCREPANCY,
          severity: "high",
          evidence: {
            documentId: document.id,
            documentType: document.type,
            formValue: kybCase.client.address,
            documentValue: document.extractedAddress,
          },
        })
      );
    }
  }

  /**
   * 6. Representante legal incompleto o discrepante
   */
  if (!kybCase.client.legalRepresentativeName) {
    riskFactors.push(
      createRiskFactor({
        code: "INCOMPLETE_LEGAL_REPRESENTATIVE",
        label: "Representante legal incompleto",
        description: "No se registró representante legal en el expediente.",
        points: RISK_RULES.INCOMPLETE_LEGAL_REPRESENTATIVE,
        severity: "high",
        evidence: {},
      })
    );
  }

  const documentsWithRepresentative = documents.filter(
    (document) => document.extractedRepresentative
  );

  for (const document of documentsWithRepresentative) {
    if (
      !isSameText(
        kybCase.client.legalRepresentativeName,
        document.extractedRepresentative
      )
    ) {
      riskFactors.push(
        createRiskFactor({
          code: "LEGAL_REPRESENTATIVE_DISCREPANCY",
          label: "Discrepancia de representante legal",
          description: `El representante legal del formulario no coincide con el representante extraído del documento ${document.type}.`,
          points: RISK_RULES.MATERIAL_DISCREPANCY,
          severity: "high",
          evidence: {
            documentId: document.id,
            documentType: document.type,
            formValue: kybCase.client.legalRepresentativeName,
            documentValue: document.extractedRepresentative,
          },
        })
      );
    }
  }

  /**
   * 7. Socios, accionistas o beneficiario controlador incompleto
   */
  const hasShareholders =
    Array.isArray(kybCase.client.shareholders) &&
    kybCase.client.shareholders.length > 0;

  const hasBeneficialOwner = Boolean(kybCase.client.beneficialOwner);

  const shareholdersDocument = findDocument(KYB_DOCUMENT_TYPES.SOCIOS_ACCIONISTAS);
  const beneficialOwnerDocument = findDocument(
    KYB_DOCUMENT_TYPES.BENEFICIARIO_CONTROLADOR
  );

  if (
    !hasShareholders &&
    !hasBeneficialOwner &&
    !shareholdersDocument &&
    !beneficialOwnerDocument
  ) {
    riskFactors.push(
      createRiskFactor({
        code: "INCOMPLETE_SHAREHOLDERS_OR_BENEFICIAL_OWNER",
        label: "Socios o beneficiario controlador incompletos",
        description:
          "No se registró información de socios, accionistas o beneficiario controlador.",
        points: RISK_RULES.INCOMPLETE_SHAREHOLDERS_OR_BENEFICIAL_OWNER,
        severity: "medium",
        evidence: {},
      })
    );
  }

    /**
     * 8. Revisión real contra listas SAT
     */
    const satChecks = kybCase.satListChecks || [];

    if (satChecks.length === 0) {
      riskFactors.push(
        createRiskFactor({
          code: "SAT_LIST_CHECK_PENDING",
          label: "Revisión SAT pendiente",
          description:
              "Todavía no se ha ejecutado la revisión contra listas fiscales públicas del SAT.",
          points: RISK_RULES.FISCAL_LIST_REVIEW_OLDER_THAN_3_MONTHS,
          severity: "medium",
          evidence: {
              source: "SAT",
              status: "pending",
          },
        })
      );
    } else {
      const latestCheckDate = satChecks
          .map((check) => new Date(check.checkedAt).getTime())
          .sort((a, b) => b - a)[0];

      const threeMonthsInMs = 1000 * 60 * 60 * 24 * 90;
      const isOlderThanThreeMonths = Date.now() - latestCheckDate > threeMonthsInMs;

      if (isOlderThanThreeMonths) {
        needsUpdate = true;
        riskFactors.push(
          createRiskFactor({
              code: "SAT_LIST_CHECK_OLDER_THAN_3_MONTHS",
              label: "Revisión SAT vencida",
              description:
              "La revisión de listas fiscales SAT tiene más de 3 meses.",
              points: RISK_RULES.FISCAL_LIST_REVIEW_OLDER_THAN_3_MONTHS,
              severity: "medium",
              evidence: {
              latestCheckDate: new Date(latestCheckDate).toISOString(),
              },
          })
        );
      }

      const satMatches = satChecks.filter((check) => check.result === "match");

      for (const check of satMatches) {
        const rawMatch = check.rawMatch || {};
        const source = String(rawMatch.source || check.source);
        const listType = String(rawMatch.listType || "");

        const isCritical =
          (source === "SAT_ART_69B" && listType === "definitivos") ||
          source === "SAT_ART_69B_BIS";

        if (isCritical) {
          hasCriticalRisk = true;

          riskFactors.push(
            createRiskFactor({
              code: "SAT_CRITICAL_MATCH",
              label: "Coincidencia crítica en listas SAT",
              description: `El RFC aparece en una lista fiscal crítica del SAT: ${source} / ${listType}.`,
              points: RISK_RULES.SAT_LIST_MATCH_CRITICAL,
              severity: "critical",
              evidence: {
                checkId: check.id,
                source,
                listType,
                referenceUrl: check.referenceUrl,
                rawMatch,
              },
            }),
          );
        } else {
          riskFactors.push(
            createRiskFactor({
              code: "SAT_REVIEW_MATCH",
              label: "Coincidencia en listas SAT",
              description: `El RFC aparece en una lista fiscal del SAT que requiere revisión: ${source} / ${listType}.`,
              points: RISK_RULES.SAT_LIST_MATCH_REVIEW,
              severity: "high",
              evidence: {
                checkId: check.id,
                source,
                listType,
                referenceUrl: check.referenceUrl,
                rawMatch,
              },
            }),
          );
        }
      }
    }

    /**
     * 9. Cambios reportados por el cliente
     */
    if (kybCase.clientReportedChanges) {
      needsUpdate = true;

      riskFactors.push(
        createRiskFactor({
          code: "CLIENT_REPORTED_CHANGES",
          label: "Cambios reportados por el cliente",
          description:
            "El cliente reportó cambios y el expediente requiere actualización.",
          points: 20,
          severity: "medium",
          evidence: {
            clientReportedChanges: true,
          },
        })
      );
    }

  /**
   * 10. Riesgo crítico.
   * En Paso 4, coincidencias críticas del SAT marcarán hasCriticalRisk = true.
   */
  const score = riskFactors.reduce((total, factor) => total + factor.points, 0);
  const cappedScore = Math.min(score, 100);
  const decision = getDecision(cappedScore, hasCriticalRisk);
  const canApprove =
    decision === KYB_DECISIONS.SAFE && needsUpdate === false;

  const explanation = buildRiskExplanation({
    score: cappedScore,
    decision,
    riskFactors,
    canApprove,
    needsUpdate,
  });

  return {
    score: cappedScore,
    decision,
    canApprove,
    needsUpdate,
    riskFactors,
    explanation,
  };
};

const buildRiskExplanation = (input: {
  score: number;
  decision: KybDecision;
  canApprove: boolean;
  riskFactors: RiskFactor[];
  needsUpdate: boolean;
}) => {
  const { score, decision, canApprove, riskFactors, needsUpdate } = input;

  if (riskFactors.length === 0) {
    return "El expediente no presenta factores de riesgo. Puede aprobarse.";
  }

  const factorsText = riskFactors
    .map((factor) => `+${factor.points} ${factor.label}: ${factor.description}`)
    .join(" ");

  const hasCriticalFactor = riskFactors.some(
    (factor) => factor.severity === "critical"
  );

    const action = canApprove
      ? "Acción sugerida: aprobar expediente."
      : needsUpdate
        ? "Acción sugerida: actualizar el expediente antes de aprobar."
        : decision === KYB_DECISIONS.HIGH_RISK && hasCriticalFactor
          ? "Acción sugerida: bloquear aprobación por riesgo crítico."
          : decision === KYB_DECISIONS.HIGH_RISK
            ? "Acción sugerida: bloquear aprobación hasta corregir documentos, discrepancias o revisiones pendientes."
            : "Acción sugerida: corregir información, actualizar documentos o enviar a revisión manual.";

  return `Score ${score}. Decisión: ${decision}. ${factorsText} ${action}`;
};