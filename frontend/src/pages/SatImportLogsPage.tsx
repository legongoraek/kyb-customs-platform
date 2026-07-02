import { useEffect, useState } from "react";
import { kybApi } from "../api/kybApi";
import type { SatImportLog } from "../types/kyb";
import { formatDateTime } from "../utils/format";

export function SatImportLogsPage() {
  const [logs, setLogs] = useState<SatImportLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);

  const loadLogs = async () => {
    try {
      const data = await kybApi.getSatImportLogs();
      setLogs(data);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    setImporting(true);

    try {
      await kybApi.runSatImport();
      await loadLogs();
    } finally {
      setImporting(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="space-y-7">
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">
            Importaciones SAT
          </h1>
          <p className="mt-1 text-slate-500">
            Historial de importaciones automáticas desde fuentes públicas SAT.
          </p>
        </div>

        <button
          onClick={handleImport}
          disabled={importing}
          className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold text-white transition ${
            importing
              ? "cursor-not-allowed bg-slate-500"
              : "bg-slate-900 hover:bg-slate-700"
          }`}
        >
          {importing && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          )}
          {importing ? "Importando fuentes SAT..." : "Ejecutar importación SAT"}
        </button>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center px-4 py-8">
            <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />
              </div>

              <h2 className="text-xl font-black text-slate-900">
                Cargando importaciones SAT
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Estamos obteniendo el historial de importaciones, fuentes públicas
                consultadas y registros normalizados.
              </p>

              <div className="mt-7 space-y-4 text-left">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="h-3 w-3/4 animate-pulse rounded-full bg-slate-200" />
                      <div className="h-3 w-1/2 animate-pulse rounded-full bg-slate-200" />
                      <div className="h-3 w-2/5 animate-pulse rounded-full bg-slate-200" />
                    </div>

                    <div className="h-7 w-20 animate-pulse rounded-full bg-slate-200" />
                  </div>

                  <div className="space-y-2">
                    <div className="h-3 w-2/3 animate-pulse rounded-full bg-slate-200" />
                    <div className="h-3 w-1/2 animate-pulse rounded-full bg-slate-200" />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="h-3 w-2/3 animate-pulse rounded-full bg-slate-200" />
                      <div className="h-3 w-1/3 animate-pulse rounded-full bg-slate-200" />
                      <div className="h-3 w-2/5 animate-pulse rounded-full bg-slate-200" />
                    </div>

                    <div className="h-7 w-20 animate-pulse rounded-full bg-slate-200" />
                  </div>

                  <div className="space-y-2">
                    <div className="h-3 w-3/4 animate-pulse rounded-full bg-slate-200" />
                    <div className="h-3 w-1/2 animate-pulse rounded-full bg-slate-200" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : logs.length === 0 ? (
          <p className="text-sm text-slate-500">
            Todavía no hay importaciones registradas.
          </p>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-slate-900">
                      {log.source_name}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Fuente: {log.source}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Registros importados: {log.imported_count}
                    </p>
                    {log.error_message && (
                      <p className="mt-1 text-sm font-semibold text-red-600">
                        {log.error_message}
                      </p>
                    )}
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                      log.status === "success"
                        ? "bg-emerald-100 text-emerald-700"
                        : log.status === "failed"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {log.status}
                  </span>
                </div>

                <div className="mt-3 text-xs text-slate-500">
                  <p>Inicio: {formatDateTime(log.started_at)}</p>
                  <p>Fin: {formatDateTime(log.finished_at)}</p>
                </div>

                <a
                  href={log.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-sm font-bold text-blue-700 hover:underline"
                >
                  Ver fuente SAT
                </a>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}