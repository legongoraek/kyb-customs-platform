import { describe, expect, it } from "vitest";
import { calculateKybRisk } from "./riskEngine";
import type { KybCase, KybDocument, SatListCheck } from "../kyb.types";

const now = new Date();
const currentMonthDate = new Date(
  now.getFullYear(),
  now.getMonth(),
  5
)
  .toISOString()
  .slice(0, 10);

const futureDate = new Date(
  now.getFullYear() + 1,
  now.getMonth(),
  5
)
  .toISOString()
  .slice(0, 10);

const pastDate = new Date(
  now.getFullYear() - 1,
  now.getMonth(),
  5
)
  .toISOString()
  .slice(0, 10);

const olderThanThreeMonths = new Date(
  now.getFullYear(),
  now.getMonth() - 4,
  5
).toISOString();

const baseClient = {
  rfc: "ABC010101AB1",
  legalName: "EMPRESA LIMPIA SA DE CV",
  address: "CALLE 10 NUM 200 MERIDA YUCATAN",
  legalRepresentativeName: "JUAN PEREZ LOPEZ",
  shareholders: ["JUAN PEREZ LOPEZ"],
  beneficialOwner: "JUAN PEREZ LOPEZ",
};

const createDocument = (
  input: Partial<KybDocument> & Pick<KybDocument, "type">
): KybDocument => ({
  id: `doc-${Math.random()}`,
  caseId: "case-test-id",
  type: input.type,
  status: input.status || "uploaded",
  issueDate: input.issueDate,
  expirationDate: input.expirationDate,
  extractedRfc: input.extractedRfc,
  extractedLegalName: input.extractedLegalName,
  extractedAddress: input.extractedAddress,
  extractedRepresentative: input.extractedRepresentative,
  fileUrl: input.fileUrl,
  createdAt: new Date().toISOString(),
});

const createNoMatchSatCheck = (): SatListCheck => ({
  id: `sat-${Math.random()}`,
  caseId: "case-test-id",
  rfcSearched: "ABC010101AB1",
  source: "SAT_ALL",
  result: "no_match",
  referenceUrl:
    "https://www.sat.gob.mx/minisitio/DatosAbiertos/contribuyentes_publicados.html",
  rawMatch: {
    entries: [],
  },
  checkedAt: new Date().toISOString(),
});

const createCriticalSatCheck = (): SatListCheck => ({
  id: `sat-${Math.random()}`,
  caseId: "case-test-id",
  rfcSearched: "AAA010101AAA",
  source: "SAT_ART_69B",
  result: "match",
  referenceUrl:
    "https://www.sat.gob.mx/minisitio/DatosAbiertos/contribuyentes_publicados.html",
  rawMatch: {
    listType: "definitivos",
    situation:
      "Contribuyente publicado como definitivo en términos del artículo 69-B CFF.",
  },
  checkedAt: new Date().toISOString(),
});

const createOldSatCheck = (): SatListCheck => ({
  ...createNoMatchSatCheck(),
  checkedAt: olderThanThreeMonths,
});

const createCompleteDocuments = (): KybDocument[] => [
  createDocument({
    type: "ACTA_CONSTITUTIVA",
    extractedRfc: baseClient.rfc,
    extractedLegalName: baseClient.legalName,
  }),
  createDocument({
    type: "IDENTIFICACION_REPRESENTANTE",
    extractedRepresentative: baseClient.legalRepresentativeName,
  }),
  createDocument({
    type: "PODER_REPRESENTANTE",
    extractedRepresentative: baseClient.legalRepresentativeName,
  }),
  createDocument({
    type: "COMPROBANTE_DOMICILIO",
    issueDate: currentMonthDate,
    expirationDate: futureDate,
    extractedAddress: baseClient.address,
  }),
  createDocument({
    type: "RFC",
    extractedRfc: baseClient.rfc,
    extractedLegalName: baseClient.legalName,
  }),
  createDocument({
    type: "CONSTANCIA_SITUACION_FISCAL",
    issueDate: currentMonthDate,
    extractedRfc: baseClient.rfc,
    extractedLegalName: baseClient.legalName,
    extractedAddress: baseClient.address,
  }),
  createDocument({
    type: "MANIFESTACION_BAJO_PROTESTA",
  }),
  createDocument({
    type: "SOCIOS_ACCIONISTAS",
  }),
  createDocument({
    type: "BENEFICIARIO_CONTROLADOR",
  }),
];

const createCase = (
  overrides?: Partial<KybCase>
): KybCase => ({
  id: "case-test-id",
  status: "draft",
  decision: null,
  score: 0,
  canApprove: false,
  clientReportedChanges: false,
  client: baseClient,
  documents: createCompleteDocuments(),
  satListChecks: [createNoMatchSatCheck()],
  riskFactors: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe("calculateKybRisk", () => {
  it("returns safe when case is complete, SAT is clean and documents are valid", () => {
    const kybCase = createCase();

    const result = calculateKybRisk(kybCase);

    expect(result.score).toBe(0);
    expect(result.decision).toBe("safe");
    expect(result.canApprove).toBe(true);
    expect(result.needsUpdate).toBe(false);
    expect(result.riskFactors).toHaveLength(0);
  });

  it("returns needsUpdate when a document is expired", () => {
    const documents = createCompleteDocuments().map((document) => {
      if (document.type !== "COMPROBANTE_DOMICILIO") {
        return document;
      }

      return {
        ...document,
        status: "expired" as const,
        expirationDate: pastDate,
      };
    });

    const kybCase = createCase({
      documents,
    });

    const result = calculateKybRisk(kybCase);

    expect(result.needsUpdate).toBe(true);
    expect(result.canApprove).toBe(false);
    expect(result.riskFactors.some((factor) => factor.code === "EXPIRED_DOCUMENT")).toBe(
      true
    );
  });

  it("returns needsUpdate when CSF is not from current month", () => {
    const documents = createCompleteDocuments().map((document) => {
      if (document.type !== "CONSTANCIA_SITUACION_FISCAL") {
        return document;
      }

      return {
        ...document,
        issueDate: pastDate,
      };
    });

    const kybCase = createCase({
      documents,
    });

    const result = calculateKybRisk(kybCase);

    expect(result.needsUpdate).toBe(true);
    expect(result.canApprove).toBe(false);
    expect(
      result.riskFactors.some(
        (factor) => factor.code === "CSF_NOT_CURRENT_MONTH"
      )
    ).toBe(true);
  });

  it("returns high_risk when SAT has a critical 69-B definitive match", () => {
    const kybCase = createCase({
      client: {
        ...baseClient,
        rfc: "AAA010101AAA",
        legalName: "EMPRESA DE RIESGO DEFINITIVO SA DE CV",
      },
      satListChecks: [createCriticalSatCheck()],
    });

    const result = calculateKybRisk(kybCase);

    expect(result.score).toBe(100);
    expect(result.decision).toBe("high_risk");
    expect(result.canApprove).toBe(false);
    expect(
      result.riskFactors.some((factor) => factor.code === "SAT_CRITICAL_MATCH")
    ).toBe(true);
  });

  it("returns review_required or higher when legal name has a material discrepancy", () => {
    const documents = createCompleteDocuments().map((document) => {
      if (document.type !== "CONSTANCIA_SITUACION_FISCAL") {
        return document;
      }

      return {
        ...document,
        extractedLegalName: "OTRA EMPRESA SA DE CV",
      };
    });

    const kybCase = createCase({
      documents,
    });

    const result = calculateKybRisk(kybCase);

    expect(result.canApprove).toBe(false);
    expect(["review_required", "high_risk"]).toContain(result.decision);
    expect(
      result.riskFactors.some(
        (factor) => factor.code === "LEGAL_NAME_DISCREPANCY"
      )
    ).toBe(true);
  });

  it("returns needsUpdate when SAT review is older than 3 months", () => {
    const kybCase = createCase({
      satListChecks: [createOldSatCheck()],
    });

    const result = calculateKybRisk(kybCase);

    expect(result.needsUpdate).toBe(true);
    expect(result.canApprove).toBe(false);
    expect(
      result.riskFactors.some(
        (factor) => factor.code === "SAT_LIST_CHECK_OLDER_THAN_3_MONTHS"
      )
    ).toBe(true);
  });
});