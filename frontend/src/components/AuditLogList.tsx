import type { AuditLog } from "../types/kyb";
import { formatDateTime } from "../utils/format";

type Props = {
  logs: AuditLog[];
};

export function AuditLogList({ logs }: Props) {
  return (
    <section className="min-w-0 max-w-full overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 min-w-0">
        <h2 className="break-words text-xl font-black text-slate-900">
          Auditoría
        </h2>
        <p className="mt-1 break-words text-sm text-slate-500">
          Historial auditable de acciones realizadas sobre el expediente.
        </p>
      </div>

      {logs.length === 0 ? (
        <div className="min-w-0 rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">
          No hay eventos registrados.
        </div>
      ) : (
        <div className="max-h-[400px] min-w-0 max-w-full space-y-3 overflow-y-auto overflow-x-hidden pr-1">
          {logs.map((log) => (
            <div
              key={log.id}
              className="min-w-0 max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1 overflow-hidden">
                  <p className="max-w-full break-all rounded-xl bg-white px-3 py-2 text-xs font-black uppercase tracking-wide text-slate-700 ring-1 ring-slate-200">
                    {log.action}
                  </p>

                  <p className="mt-1 break-words text-sm leading-6 text-slate-600">
                    {log.message}
                  </p>

                  <p className="mt-1 break-words text-xs text-slate-400">
                    Entidad: {log.entityType}
                  </p>
                </div>

                <span className="shrink-0 whitespace-normal break-words text-left text-xs font-semibold text-slate-500 sm:max-w-[140px] sm:text-right">
                  {formatDateTime(log.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}