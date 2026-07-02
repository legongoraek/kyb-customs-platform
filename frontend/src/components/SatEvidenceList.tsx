import type { SatListCheck } from "../types/kyb";
import { formatDateTime } from "../utils/format";

type Props = {
  checks: SatListCheck[];
};

export function SatEvidenceList({ checks }: Props) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-xl font-black text-slate-900">Evidencia SAT</h2>
        <p className="mt-1 text-sm text-slate-500">
          Fuente, resultado, RFC buscado y referencia utilizada.
        </p>
      </div>

      {checks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">
          Todavía no se ha ejecutado una revisión SAT.
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto overflow-x-hidden pr-1">
          {checks.map((check) => (
            <div
              key={check.id}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-black text-slate-900">{check.source}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    RFC buscado: {check.rfcSearched}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Resultado:{" "}
                    <span
                      className={
                        check.result === "match"
                          ? "font-bold text-red-700"
                          : "font-bold text-emerald-700"
                      }
                    >
                      {check.result}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Fecha: {formatDateTime(check.checkedAt)}
                  </p>
                </div>

                <a
                  href={check.referenceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100"
                >
                  Ver fuente SAT
                </a>
              </div>

              {check.rawMatch && Object.keys(check.rawMatch).length > 0 && (
                <details className="mt-3 rounded-xl bg-white p-3">
                  <summary className="cursor-pointer text-xs font-bold text-slate-500">
                    Ver evidencia raw_match
                  </summary>
                  <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap text-xs text-slate-600">
                    {JSON.stringify(check.rawMatch, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}