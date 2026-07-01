import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FilePlus2 } from "lucide-react";
import { kybApi } from "../api/kybApi";
import type { KybCase } from "../types/kyb";
import { RiskBadge } from "../components/RiskBadge";
import { formatDateTime } from "../utils/format";
import { RiskDistributionChart } from "../components/RiskDistributionChart";

export function DashboardPage() {
  const [cases, setCases] = useState<KybCase[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCases = async () => {
    try {
      const data = await kybApi.getCases();
      setCases(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, []);

  const stats = useMemo(() => {
    return {
      total: cases.length,
      safe: cases.filter((item) => item.decision === "safe").length,
      review: cases.filter((item) => item.decision === "review_required")
        .length,
      highRisk: cases.filter((item) => item.decision === "high_risk").length,
      canApprove: cases.filter((item) => item.canApprove).length,
      blocked: cases.filter((item) => !item.canApprove).length,
    };
  }, [cases]);

  return (
    <div className="space-y-7">
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">
            Expedientes KYB
          </h1>
          <p className="mt-1 text-slate-500">
            Evaluación de riesgo para personas morales mexicanas.
          </p>
        </div>

        <Link
          to="/cases/new"
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-700"
        >
          <FilePlus2 size={18} />
          Nuevo expediente
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Safe" value={stats.safe} />
        <StatCard label="Review required" value={stats.review} />
        <StatCard label="High risk" value={stats.highRisk} />
        <StatCard label="Can approve" value={stats.canApprove} />
        <StatCard label="Blocked" value={stats.blocked} />
      </section>
      
      <RiskDistributionChart cases={cases} />

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-black text-slate-900">Casos recientes</h2>
        </div>

        {loading ? (
          <div className="p-5 text-slate-500">Cargando expedientes...</div>
        ) : cases.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-semibold text-slate-700">
              Todavía no hay expedientes.
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Crea el primer expediente KYB para comenzar.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
            {cases.map((item) => (
              <Link
                key={item.id}
                to={`/cases/${item.id}`}
                className="grid gap-4 px-5 py-4 hover:bg-slate-50 md:grid-cols-[1fr_auto_auto]"
              >
                <div>
                  <p className="font-bold text-slate-900">
                    {item.client.legalName}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    RFC: {item.client.rfc}
                  </p>
                </div>

                <div className="flex items-center">
                  <RiskBadge decision={item.decision} />
                </div>

                <div className="text-sm text-slate-500">
                  {formatDateTime(item.updatedAt)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-slate-900">{value}</p>
    </div>
  );
}