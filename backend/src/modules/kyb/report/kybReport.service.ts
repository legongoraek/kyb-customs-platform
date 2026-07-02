import PDFDocument from "pdfkit";
import { KybCase } from "../kyb.types";

export type KybReportData = {
  generatedAt: string;
  kybCase: KybCase;
  auditLogs: {
    id: string;
    action: string;
    entityType: string;
    entityId?: string;
    message: string;
    metadata: Record<string, unknown>;
    createdAt: string;
  }[];
  latestRiskScore?: {
    id: string;
    score: number;
    decision: string;
    can_approve: boolean;
    explanation?: string;
    created_at: string;
  } | null;
};

const writeSectionTitle = (doc: PDFKit.PDFDocument, title: string) => {
  doc.moveDown(1);
  doc.fontSize(15).font("Helvetica-Bold").fillColor("#000000").text(title);
  doc.moveDown(0.4);
};

const writeKeyValue = (
  doc: PDFKit.PDFDocument,
  label: string,
  value?: string | number | null
) => {
  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .fillColor("#000000")
    .text(`${label}: `, { continued: true })
    .font("Helvetica")
    .text(value === undefined || value === null || value === "" ? "—" : String(value));
};

type ParsedRiskSummary = {
  score: number | null;
  decision: string | null;
  suggestedAction: string | null;
};

const DECISION_LABELS: Record<string, string> = {
  safe: "Safe",
  review_required: "Revisión requerida",
  high_risk: "Alto riesgo",
};

const DECISION_COLORS: Record<string, string> = {
  safe: "#047857",
  review_required: "#b45309",
  high_risk: "#b91c1c",
};

function parseRiskSummary(text: string): ParsedRiskSummary {
  const headerMatch = text.match(/Score\s+(\d+)\.\s*Decisión:\s*([a-z_]+)\./i);
  const score = headerMatch ? Number(headerMatch[1]) : null;
  const decision = headerMatch ? headerMatch[2] : null;

  const actionIndex = text.indexOf("Acción sugerida:");
  const suggestedAction =
    actionIndex >= 0
      ? text.slice(actionIndex + "Acción sugerida:".length).trim()
      : null;

  return { score, decision, suggestedAction };
}

const writeRiskScoreSummary = (
  doc: PDFKit.PDFDocument,
  latestRiskScore: NonNullable<KybReportData["latestRiskScore"]>
) => {
  const parsed = parseRiskSummary(latestRiskScore.explanation || "");
  const score = parsed.score ?? latestRiskScore.score;
  const decisionKey = parsed.decision ?? latestRiskScore.decision;
  const decisionLabel = DECISION_LABELS[decisionKey] || decisionKey || "—";
  const decisionColor = DECISION_COLORS[decisionKey] || "#334155";

  // Score grande + "/100"
  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor("#0f172a")
    .text(`${score}`, { continued: true })
    .font("Helvetica")
    .fontSize(12)
    .fillColor("#64748b")
    .text(" / 100");

  // Badge de decisión
  doc.moveDown(0.15);
  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor(decisionColor)
    .text(`Decisión: ${decisionLabel}`);

  // Fecha de cálculo
  doc.moveDown(0.2);
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor("#64748b")
    .text(`Calculado: ${latestRiskScore.created_at}`);

  doc.fillColor("#000000");

  // Recuadro de acción sugerida
  if (parsed.suggestedAction) {
    doc.moveDown(0.6);

    const boxX = doc.x;
    const boxWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const label = "Acción sugerida: ";
    const contentWidth = boxWidth - 20;

    doc.font("Helvetica-Bold").fontSize(9.5);
    const labelHeight = doc.heightOfString(label, { width: contentWidth, continued: true } as any);
    doc.font("Helvetica").fontSize(9.5);
    const textHeight = doc.heightOfString(`${label}${parsed.suggestedAction}`, {
      width: contentWidth,
    });
    void labelHeight;

    const boxY = doc.y;
    const boxHeight = textHeight + 16;

    doc.save();
    doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 6).fill("#fffbeb");
    doc.restore();

    doc
      .fillColor("#92400e")
      .font("Helvetica-Bold")
      .fontSize(9.5)
      .text(label, boxX + 10, boxY + 8, { continued: true, width: contentWidth })
      .font("Helvetica")
      .fillColor("#78350f")
      .text(parsed.suggestedAction, { width: contentWidth });

    doc.fillColor("#000000");
    doc.x = boxX;
    doc.y = boxY + boxHeight + 6;
  }
};

export const kybReportService = {
  buildJsonReport(data: KybReportData) {
    return {
      generatedAt: data.generatedAt,
      case: data.kybCase,
      latestRiskScore: data.latestRiskScore || null,
      auditLogs: data.auditLogs,
      summary: {
        rfc: data.kybCase.client.rfc,
        legalName: data.kybCase.client.legalName,
        status: data.kybCase.status,
        decision: data.kybCase.decision,
        score: data.kybCase.score,
        documentsCount: data.kybCase.documents.length,
        satChecksCount: data.kybCase.satListChecks.length,
        riskFactorsCount: data.kybCase.riskFactors.length,
        auditLogsCount: data.auditLogs.length,
      },
    };
  },

  buildPdfReport(data: KybReportData) {
    const doc = new PDFDocument({
      size: "A4",
      margin: 48,
      info: {
        Title: `Reporte KYB - ${data.kybCase.client.rfc}`,
        Author: "KYB Customs Platform",
      },
    });

    doc.font("Helvetica-Bold").fontSize(20).text("Reporte KYB");
    doc
      .font("Helvetica")
      .fontSize(10)
      .text(`Generado: ${data.generatedAt}`)
      .moveDown(1);

    writeSectionTitle(doc, "Resumen del expediente");
    writeKeyValue(doc, "RFC", data.kybCase.client.rfc);
    writeKeyValue(doc, "Razón social", data.kybCase.client.legalName);
    writeKeyValue(doc, "Domicilio", data.kybCase.client.address);
    writeKeyValue(
      doc,
      "Representante legal",
      data.kybCase.client.legalRepresentativeName
    );
    writeKeyValue(doc, "Estado", data.kybCase.status);
    writeKeyValue(doc, "Decisión", data.kybCase.decision || "Pendiente");
    writeKeyValue(doc, "Score", data.kybCase.score);

    writeSectionTitle(doc, "Score de riesgo");
    if (data.latestRiskScore) {
      writeRiskScoreSummary(doc, data.latestRiskScore);
    } else {
      doc.font("Helvetica").fontSize(10).fillColor("#000000").text("No hay score calculado.");
    }

    writeSectionTitle(doc, "Factores de riesgo");
    if (data.kybCase.riskFactors.length === 0) {
      doc.font("Helvetica").fontSize(10).text("No hay factores registrados.");
    } else {
      data.kybCase.riskFactors.forEach((factor, index) => {
        doc
          .font("Helvetica-Bold")
          .fontSize(10)
          .text(`${index + 1}. ${factor.label} (+${factor.points})`);
        doc.font("Helvetica").fontSize(9).text(factor.description);
        doc.moveDown(0.4);
      });
    }

    writeSectionTitle(doc, "Documentos");
    if (data.kybCase.documents.length === 0) {
      doc.font("Helvetica").fontSize(10).text("No hay documentos registrados.");
    } else {
      data.kybCase.documents.forEach((document, index) => {
        doc.font("Helvetica-Bold").fontSize(10).text(`${index + 1}. ${document.type}`);
        writeKeyValue(doc, "Estado", document.status);
        writeKeyValue(doc, "Fecha emisión", document.issueDate);
        writeKeyValue(doc, "Fecha vencimiento", document.expirationDate);
        writeKeyValue(doc, "RFC extraído", document.extractedRfc);
        writeKeyValue(doc, "Razón social extraída", document.extractedLegalName);
        writeKeyValue(doc, "Domicilio extraído", document.extractedAddress);
        doc.moveDown(0.5);
      });
    }

    writeSectionTitle(doc, "Revisiones SAT");
    if (data.kybCase.satListChecks.length === 0) {
      doc.font("Helvetica").fontSize(10).text("No hay revisiones SAT registradas.");
    } else {
      data.kybCase.satListChecks.forEach((check, index) => {
        doc.font("Helvetica-Bold").fontSize(10).text(`${index + 1}. ${check.source}`);
        writeKeyValue(doc, "RFC buscado", check.rfcSearched);
        writeKeyValue(doc, "Resultado", check.result);
        writeKeyValue(doc, "Fecha revisión", check.checkedAt);
        writeKeyValue(doc, "Referencia", check.referenceUrl);
        doc.moveDown(0.5);
      });
    }

    writeSectionTitle(doc, "Audit log");
    if (data.auditLogs.length === 0) {
      doc.font("Helvetica").fontSize(10).text("No hay audit logs registrados.");
    } else {
      data.auditLogs.slice(0, 30).forEach((log, index) => {
        doc.font("Helvetica-Bold").fontSize(10).text(`${index + 1}. ${log.action}`);
        writeKeyValue(doc, "Entidad", log.entityType);
        writeKeyValue(doc, "Mensaje", log.message);
        writeKeyValue(doc, "Fecha", log.createdAt);
        doc.moveDown(0.4);
      });
    }

    doc.end();

    return doc;
  },
};