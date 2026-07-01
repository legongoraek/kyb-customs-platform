import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  FileSearch,
  ShieldAlert,
} from "lucide-react";
import { kybApi, type AddDocumentMetadataPayload } from "../api/kybApi";
import { DocumentMetadataForm } from "../components/DocumentMetadataForm";
import { RiskBadge } from "../components/RiskBadge";
import { ApprovalBadge } from "../components/ApprovalBadge";
import { RiskFactorsList } from "../components/RiskFactorsList";
import type { KybCase, RiskResult } from "../types/kyb";
import { formatDate, formatDateTime } from "../utils/format";
import { ScoreCard } from "../components/ScoreCard";

export function CaseDetailPage() {
  const { id } = useParams();

  const [kybCase, setKybCase] = useState<KybCase | null>(null);
  const [riskResult, setRiskResult] = useState<RiskResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadCase = async () => {
    if (!id) return;

    try {
      const data = await kybApi.getCaseById(id);
      setKybCase(data);
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

  if (loading) {
    return <div className="text-slate-500">Cargando expediente...</div>;
  }

  if (!kybCase) {
    return <div className="text-red-600">Expediente no encontrado.</div>;
  }

  const activeRiskFactors = riskResult?.riskFactors || kybCase.riskFactors;

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
          <InfoCard label="Estado" value={kybCase.status} />
          <InfoCard
            label="Representante"
            value={kybCase.client.legalRepresentativeName}
          />
          <InfoCard
            label="Actualizado"
            value={formatDateTime(kybCase.updatedAt)}
          />
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <p className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
            Acciones del expediente
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleSatCheck}
              disabled={actionLoading !== null}
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-500"
            >
              <FileSearch size={18} />
              {actionLoading === "sat" ? "Consultando SAT..." : "Consultar SAT"}
            </button>

            <button
              onClick={handleRiskCheck}
              disabled={actionLoading !== null}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-700"
            >
              <ShieldAlert size={18} />
              {actionLoading === "risk"
                ? "Calculando score..."
                : "Ejecutar score KYB"}
            </button>

            <button
              onClick={handleApprove}
              disabled={
                actionLoading !== null ||
                (riskResult?.decision || kybCase.decision) !== "safe"
              }
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-500 disabled:bg-slate-300"
            >
              <CheckCircle2 size={18} />
              Aprobar expediente
            </button>
          </div>
        </div>

        {(riskResult?.explanation || activeRiskFactors?.length > 0) && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex gap-3">
              <AlertTriangle className="mt-1 text-amber-600" size={20} />
              <p className="text-sm leading-6 text-slate-700">
                {riskResult?.explanation ||
                  "El expediente ya tiene factores de riesgo calculados."}
              </p>
            </div>
          </div>
        )}
      </section>

      <ScoreCard
        score={riskResult?.score ?? kybCase.score}
        decision={riskResult?.decision || kybCase.decision}
      />

      <section className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black text-slate-900">Documentos</h2>

            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
              {kybCase.documents.length === 0 ? (
                <div className="p-5 text-sm text-slate-500">
                  No hay documentos registrados.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
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

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black text-slate-900">
              Revisión SAT
            </h2>

            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
              {kybCase.satListChecks.length === 0 ? (
                <div className="p-5 text-sm text-slate-500">
                  Todavía no se ha consultado SAT.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {kybCase.satListChecks.map((check) => (
                    <div key={check.id} className="p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="font-bold text-slate-900">
                          {check.source}
                        </p>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            check.result === "match"
                              ? "bg-red-100 text-red-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {check.result}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-slate-500">
                        RFC buscado: {check.rfcSearched}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Fecha: {formatDateTime(check.checkedAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <RiskFactorsList factors={activeRiskFactors} />
        </div>

        <DocumentMetadataForm onSubmit={handleAddDocument} />
      </section>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 font-bold text-slate-900">{value}</p>
    </div>
  );
}