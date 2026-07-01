import type { RiskFactor } from "../types/kyb";

type Props = {
  factors: RiskFactor[];
};

const severityClass: Record<string, string> = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

export function RiskFactorsList({ factors }: Props) {
  if (factors.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">
        Todavía no hay factores de riesgo registrados.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {factors.map((factor, index) => (
        <div
          key={`${factor.code}-${index}`}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h4 className="font-bold text-slate-900">{factor.label}</h4>
              <p className="mt-1 text-sm text-slate-600">
                {factor.description}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  severityClass[factor.severity]
                }`}
              >
                {factor.severity}
              </span>
              <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white">
                +{factor.points}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}