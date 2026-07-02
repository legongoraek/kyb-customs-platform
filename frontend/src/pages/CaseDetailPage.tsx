import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  FileSearch,
  ShieldAlert,
  Download,
  Info,
} from "lucide-react";
import { kybApi, type AddDocumentMetadataPayload } from "../api/kybApi";
import { DocumentMetadataForm } from "../components/DocumentMetadataForm";
import { RiskBadge } from "../components/RiskBadge";
import { ApprovalBadge } from "../components/ApprovalBadge";
import { RiskFactorsList } from "../components/RiskFactorsList";
import type { KybCase, RiskResult } from "../types/kyb";
import { formatDate, formatDateTime } from "../utils/format";
import { ScoreCard } from "../components/ScoreCard";
import { InfoCard } from "../components/InfoCard";
import { AuditLogList } from "../components/AuditLogList";
import { SatEvidenceList } from "../components/SatEvidenceList";
import { RiskExplanationDetail } from "../components/RiskExplanationDetail";
import type { AuditLog } from "../types/kyb";

export function CaseDetailPage() {
  const { id } = useParams();

  const [kybCase, setKybCase] = useState<KybCase | null>(null);
  const [riskResult, setRiskResult] = useState<RiskResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const loadCase = async () => {
    if (!id) return;

    try {
      const data = await kybApi.getCaseById(id);
      setKybCase(data);

      const logs = await kybApi.getAuditLogs(id);
      setAuditLogs(logs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCase();
  }, [id]);

  const handleAddDocument = async (payload: AddDocumentMetadataPayload) => {
    if (!id) return;

    await kybApi.addDocumentMetadata(id, payload);
    await loadCase();
  };

  const handleSatCheck = async () => {
    if (!id) return;

    setActionLoading("sat");

    try {
      await kybApi.runSatListCheck(id);
      await loadCase();
    } finally {
      setActionLoading(null);
    }
  };

  const handleRiskCheck = async () => {
    if (!id) return;

    setActionLoading("risk");

    try {
      const result = await kybApi.runRiskCheck(id);
      setRiskResult(result);
      await loadCase();
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async () => {
    if (!id) return;

    setActionLoading("approve");

    try {
      await kybApi.approveCase(id);
      await loadCase();
    } catch {
      alert("No se puede aprobar este expediente. Debe tener decisión safe.");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: "Borrador",
      needs_update: "Requiere actualización",
      review_required: "Requiere revisión",
      high_risk: "Alto riesgo",
      approved: "Aprobado",
      rejected: "Rechazado",
    };

    return labels[status] || status;
  };

  if (loading) {
    return <div className="text-slate-500">Cargando expediente...</div>;
  }

  if (!kybCase) {
    return <div className="text-red-600">Expediente no encontrado.</div>;
  }

  const activeRiskFactors = riskResult?.riskFactors || kybCase.riskFactors;
  const currentDecision = riskResult?.decision || kybCase.decision;
  const canApproveNow = currentDecision === "safe";

  return (
    <div className="space-y-7">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <RiskBadge decision={riskResult?.decision || kybCase.decision} />
            <ApprovalBadge
              canApprove={
                riskResult
                  ? riskResult.canApprove
                  : kybCase.decision
                    ? kybCase.decision === "safe"
                    : null
              }
            />
            <h1 className="mt-4 text-3xl font-black text-slate-900">
              {kybCase.client.legalName}
            </h1>
            <p className="mt-1 text-slate-500">RFC: {kybCase.client.rfc}</p>
          </div>

        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <InfoCard label="Estado" value={getStatusLabel(kybCase.status)} />
          <InfoCard
            label="Representante"
            value={kybCase.client.legalRepresentativeName}
          />
          <InfoCard
            label="Actualizado"
            value={formatDateTime(kybCase.updatedAt)}
          />
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
            Acciones del expediente
          </p>
        
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start">
            {/* Grupo 1: verificación y aprobación */}
            <div className="flex-1">
              <p className="mb-2 text-xs font-semibold text-slate-400">
                Verificación
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <button
                  onClick={handleSatCheck}
                  disabled={actionLoading !== null}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  <FileSearch size={18} />
                  {actionLoading === "sat" ? "Consultando SAT..." : "Consultar SAT"}
                </button>

                <button
                  onClick={handleRiskCheck}
                  disabled={actionLoading !== null}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  <ShieldAlert size={18} />
                  {actionLoading === "risk" ? "Calculando score..." : "Ejecutar score KYB"}
                </button>

                <button
                  onClick={handleApprove}
                  disabled={actionLoading !== null || !canApproveNow}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
                >
                  <CheckCircle2 size={18} />
                  Aprobar expediente
                </button>
              </div>
        
              {!canApproveNow && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                  <Info size={14} className="shrink-0" />
                  Ejecuta el score KYB con resultado <span className="font-semibold">safe</span> para poder aprobar este expediente.
                </p>
              )}
            </div>
        
            {/* Divisor */}
            <div className="hidden w-px self-stretch bg-slate-200 lg:block" />
            <div className="h-px w-full bg-slate-200 lg:hidden" />
        
            {/* Grupo 2: exportación */}
            <div className="lg:w-56">
              <p className="mb-2 text-xs font-semibold text-slate-400">Reportes</p>
              <div className="grid grid-cols-2 gap-3 lg:flex lg:flex-wrap">
                <a
                  href={kybApi.getReportJsonUrl(kybCase.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200 transition-colors hover:bg-slate-50"
                >
                  <Download size={16} />
                  JSON
                </a>

                <a
                  href={kybApi.getReportPdfUrl(kybCase.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200 transition-colors hover:bg-slate-50"
                >
                  <Download size={16} />
                  PDF
                </a>
              </div>
            </div>
          </div>
        </div>

        {(riskResult?.explanation || activeRiskFactors?.length > 0) && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
              Factores de riesgo
            </p>

            {riskResult?.explanation ? (
              <RiskExplanationDetail explanation={riskResult.explanation} />
            ) : (
              <div className="mt-3 flex gap-3">
                <AlertTriangle className="mt-1 shrink-0 text-amber-600" size={20} />
                <p className="text-sm leading-6 text-slate-700">
                  El expediente ya tiene factores de riesgo calculados.
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      <ScoreCard
        score={riskResult?.score ?? kybCase.score}
        decision={riskResult?.decision || kybCase.decision}
      />

      <section className="grid items-start gap-6 lg:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black text-slate-900">Documentos</h2>

            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
              {kybCase.documents.length === 0 ? (
                <div className="p-5 text-sm text-slate-500">
                  No hay documentos registrados.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                  {kybCase.documents.map((document) => (
                    <div
                      key={document.id}
                      className="grid gap-3 p-4 md:grid-cols-[1fr_auto]"
                    >
                      <div>
                        <p className="font-bold text-slate-900">
                          {document.type}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Emitido: {formatDate(document.issueDate)} · Vence:{" "}
                          {formatDate(document.expirationDate)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          RFC: {document.extractedRfc || "—"} · Razón social:{" "}
                          {document.extractedLegalName || "—"}
                        </p>
                      </div>

                      <span
                        className={`h-fit rounded-full px-3 py-1 text-xs font-bold ${
                          document.status === "expired"
                            ? "bg-red-100 text-red-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {document.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <SatEvidenceList checks={kybCase.satListChecks} />

          <RiskFactorsList factors={activeRiskFactors} />

          <AuditLogList logs={auditLogs} />
        </div>

        <DocumentMetadataForm onSubmit={handleAddDocument} />
      </section>
    </div>
  );
}
