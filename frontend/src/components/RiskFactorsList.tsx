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
          <p className="mt-1 text-sm text-slate-500">
            Explicación auditable de los puntos asignados.
          </p>
        </div>

        <span className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-black text-white">
          +{totalPoints} pts
        </span>
      </div>

      <div className="space-y-3">
        {factors.map((factor, index) => (
          <div
            key={`${factor.code}-${index}`}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-black text-slate-900">{factor.label}</h4>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                      severityClass[factor.severity]
                    }`}
                  >
                    {factor.severity}
                  </span>
                </div>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {factor.description}
                </p>

                <p className="mt-2 text-xs font-mono text-slate-400">
                  {factor.code}
                </p>
              </div>

              <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-slate-900 shadow-sm">
                +{factor.points}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}