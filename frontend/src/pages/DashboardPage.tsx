import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FilePlus2, Search, X } from "lucide-react";
import { kybApi } from "../api/kybApi";
import type { KybCase } from "../types/kyb";
import { RiskBadge } from "../components/RiskBadge";
import { formatDateTime } from "../utils/format";
import {
  RiskDistributionChart,
  type RiskDistributionFilter,
} from "../components/RiskDistributionChart";
import { StatCard } from "../components/StatCard";
import { useNavigate } from "react-router-dom";

type StatusFilter =
  | "all"
  | "pending"
  | "safe"
  | "review_required"
  | "high_risk"
  | "can_approve"
  | "blocked";

export function DashboardPage() {
  const [cases, setCases] = useState<KybCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

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
      pending: cases.filter((item) => !item.decision).length,
      safe: cases.filter((item) => item.decision === "safe").length,
      review: cases.filter((item) => item.decision === "review_required")
        .length,
      highRisk: cases.filter((item) => item.decision === "high_risk").length,
      canApprove: cases.filter((item) => item.canApprove).length,
      blocked: cases.filter((item) => !item.canApprove).length,
    };
  }, [cases]);

  const filteredCases = useMemo(() => {
    const query = search.trim().toLowerCase();

    return cases.filter((item) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "pending" && !item.decision) ||
        (statusFilter === "can_approve" && item.canApprove) ||
        (statusFilter === "blocked" && !item.canApprove) ||
        item.decision === statusFilter;

      const matchesSearch =
        query.length === 0 ||
        item.client.legalName.toLowerCase().includes(query) ||
        item.client.rfc.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [cases, statusFilter, search]);

  const toggleStatusFilter = (value: StatusFilter) => {
    setStatusFilter((current) => (current === value ? "all" : value));
  };

  const hasActiveFilters = statusFilter !== "all" || search.trim().length > 0;

  // El chart solo entiende un subconjunto de StatusFilter (no can_approve/blocked)
  const chartFilter: RiskDistributionFilter =
    statusFilter === "pending" ||
    statusFilter === "safe" ||
    statusFilter === "review_required" ||
    statusFilter === "high_risk"
      ? statusFilter
      : "all";

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

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        <StatCard
          label="Total"
          value={stats.total}
          active={statusFilter === "all"}
          onClick={() => setStatusFilter("all")}
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          active={statusFilter === "pending"}
          onClick={() => toggleStatusFilter("pending")}
        />
        <StatCard
          label="Safe"
          value={stats.safe}
          active={statusFilter === "safe"}
          onClick={() => toggleStatusFilter("safe")}
        />
        <StatCard
          label="Review required"
          value={stats.review}
          active={statusFilter === "review_required"}
          onClick={() => toggleStatusFilter("review_required")}
        />
        <StatCard
          label="High risk"
          value={stats.highRisk}
          active={statusFilter === "high_risk"}
          onClick={() => toggleStatusFilter("high_risk")}
        />
        <StatCard
          label="Can approve"
          value={stats.canApprove}
          active={statusFilter === "can_approve"}
          onClick={() => toggleStatusFilter("can_approve")}
        />
        <StatCard
          label="Blocked"
          value={stats.blocked}
          active={statusFilter === "blocked"}
          onClick={() => toggleStatusFilter("blocked")}
        />
      </section>

      <RiskDistributionChart
        cases={cases}
        activeFilter={chartFilter}
        onSelectFilter={setStatusFilter}
      />

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <h2 className="font-black text-slate-900">Casos recientes</h2>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por razón social o RFC..."
                className="w-64 rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-slate-500 focus:outline-none"
              />
            </div>

            {hasActiveFilters && (
              <button
                onClick={() => {
                  setStatusFilter("all");
                  setSearch("");
                }}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                <X size={14} />
                Limpiar filtros
              </button>
            )}
          </div>
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
            <button
              onClick={() => navigate("/cases/new")}
              className="mt-4 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-700"
            >
              Crear expediente
            </button>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-semibold text-slate-700">
              Ningún expediente coincide con los filtros.
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Ajusta la búsqueda o limpia los filtros para ver más resultados.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
            {filteredCases.map((item) => (
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