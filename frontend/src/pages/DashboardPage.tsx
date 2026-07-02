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
      <section className="flex flex-wrap items-center gap-4">
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
          className="ml-auto inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-700"
        >
          <FilePlus2 size={18} />
          Nuevo expediente
        </Link>
      </section>

      <section className="-mx-4 overflow-hidden px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
        <div className="flex gap-4 overflow-x-auto pb-3 lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0 xl:grid-cols-7">
          <StatCard
            label="Total"
            value={loading ? "..." : stats.total}
            active={statusFilter === "all"}
            onClick={() => setStatusFilter("all")}
            className="w-[150px] shrink-0 lg:w-auto lg:shrink"
          />

          <StatCard
            label="Pending"
            value={loading ? "..." : stats.pending}
            active={statusFilter === "pending"}
            onClick={() => toggleStatusFilter("pending")}
            className="w-[150px] shrink-0 lg:w-auto lg:shrink"
          />

          <StatCard
            label="Safe"
            value={loading ? "..." : stats.safe}
            active={statusFilter === "safe"}
            onClick={() => toggleStatusFilter("safe")}
            className="w-[150px] shrink-0 lg:w-auto lg:shrink"
          />

          <StatCard
            label="Review required"
            value={loading ? "..." : stats.review}
            active={statusFilter === "review_required"}
            onClick={() => toggleStatusFilter("review_required")}
            className="w-[190px] shrink-0 lg:w-auto lg:shrink"
          />

          <StatCard
            label="High risk"
            value={loading ? "..." : stats.highRisk}
            active={statusFilter === "high_risk"}
            onClick={() => toggleStatusFilter("high_risk")}
            className="w-[150px] shrink-0 lg:w-auto lg:shrink"
          />

          <StatCard
            label="Can approve"
            value={loading ? "..." : stats.canApprove}
            active={statusFilter === "can_approve"}
            onClick={() => toggleStatusFilter("can_approve")}
            className="w-[170px] shrink-0 lg:w-auto lg:shrink"
          />

          <StatCard
            label="Blocked"
            value={loading ? "..." : stats.blocked}
            active={statusFilter === "blocked"}
            onClick={() => toggleStatusFilter("blocked")}
            className="w-[150px] shrink-0 lg:w-auto lg:shrink"
          />
        </div>
      </section>

      <RiskDistributionChart
        cases={cases}
        activeFilter={chartFilter}
        onSelectFilter={setStatusFilter}
      />

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <h2 className="font-black text-slate-900">Casos recientes</h2>
 
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <div className="relative min-w-0 flex-1 sm:flex-none">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por razón social o RFC..."
                className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-slate-500 focus:outline-none sm:w-64"
              />
            </div>
 
            {hasActiveFilters && (
              <button
                onClick={() => {
                  setStatusFilter("all");
                  setSearch("");
                }}
                aria-label="Limpiar filtros"
                className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-slate-300 p-2 text-xs font-bold text-slate-600 hover:bg-slate-50 sm:px-3 sm:py-2"
              >
                <X size={14} />
                <span className="hidden sm:inline">Limpiar filtros</span>
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="p-6">
            <div className="flex min-h-[280px] items-center justify-center">
              <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />
                </div>

                <h2 className="text-xl font-black text-slate-900">
                  Cargando expedientes
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Estamos obteniendo los casos KYB, sus estados de riesgo y la
                  información más reciente.
                </p>

                <div className="mt-7 space-y-4 text-left">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
                    <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
                    <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="mb-4 h-3 w-36 animate-pulse rounded-full bg-slate-200" />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="h-3 w-2/3 animate-pulse rounded-full bg-slate-200" />
                          <div className="h-3 w-1/3 animate-pulse rounded-full bg-slate-200" />
                        </div>
                        <div className="h-7 w-24 animate-pulse rounded-full bg-slate-200" />
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="h-3 w-3/4 animate-pulse rounded-full bg-slate-200" />
                          <div className="h-3 w-2/5 animate-pulse rounded-full bg-slate-200" />
                        </div>
                        <div className="h-7 w-24 animate-pulse rounded-full bg-slate-200" />
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="h-3 w-1/2 animate-pulse rounded-full bg-slate-200" />
                          <div className="h-3 w-1/4 animate-pulse rounded-full bg-slate-200" />
                        </div>
                        <div className="h-7 w-24 animate-pulse rounded-full bg-slate-200" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
              className="flex flex-col gap-3 px-5 py-4 hover:bg-slate-50 md:grid md:grid-cols-[1fr_auto_auto] md:items-center md:gap-4"
            >
              <div>
                <p className="font-bold text-slate-900">
                  {item.client.legalName}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  RFC: {item.client.rfc}
                </p>
              </div>

              <div className="flex items-center justify-between gap-3 md:contents">
                <div className="flex items-center">
                  <RiskBadge decision={item.decision} />
                </div>

                <div className="text-sm text-slate-500">
                  {formatDateTime(item.updatedAt)}
                </div>
              </div>
            </Link>
          ))}
        </div>
        )}
      </section>
    </div>
  );
}