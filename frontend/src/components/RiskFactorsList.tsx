import type { RiskFactor } from "../types/kyb";

type Props = {
  factors: RiskFactor[];
};

const severityClass: Record<string, string> = {
  low: "bg-slate-100 text-slate-700 border-slate-200",
  medium: "bg-amber-100 text-amber-800 border-amber-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  critical: "bg-red-100 text-red-800 border-red-200",
};

export function RiskFactorsList({ factors }: Props) {
  if (factors.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
        <p className="font-bold text-slate-700">
          Todavía no hay factores de riesgo.
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Ejecuta el score KYB para generar una explicación detallada.
        </p>
      </div>
    );
  }

  const totalPoints = factors.reduce((total, factor) => total + factor.points, 0);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900">
            Factores de riesgo
          </h2>
        </div>

        <span className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-black text-white">
          +{totalPoints} pts
        </span>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {factors.map((factor, index) => (
          <div
            key={`${factor.code}-${index}`}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1 overflow-hidden">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <h4 className="min-w-0 break-words font-black text-slate-900">
                    {factor.label}
                  </h4>

                  <span
                    className={`shrink-0 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                      severityClass[factor.severity]
                    }`}
                  >
                    {factor.severity}
                  </span>
                </div>

                <p className="mt-2 break-words text-sm leading-6 text-slate-600">
                  {factor.description}
                </p>

                <p className="mt-2 mb-1 max-w-full break-all rounded-xl bg-white px-3 py-2 font-mono text-xs text-slate-500 ring-1 ring-slate-200 sm:inline-block">
                  {factor.code}
                </p>
              </div>

              <div className="flex justify-end sm:block">
                <span className="inline-flex shrink-0 rounded-full bg-white px-3 py-1 text-sm font-black text-slate-900 shadow-sm">
                  +{factor.points}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}