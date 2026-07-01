import type { AuditLog } from "../types/kyb";
import { formatDateTime } from "../utils/format";

type Props = {
  logs: AuditLog[];
};

export function AuditLogList({ logs }: Props) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-xl font-black text-slate-900">Auditoría</h2>
        <p className="mt-1 text-sm text-slate-500">
          Historial auditable de acciones realizadas sobre el expediente.
        </p>
      </div>

      {logs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">
          No hay eventos registrados.
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {logs.map((log) => (
            <div
              key={log.id}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-black text-slate-900">{log.action}</p>
                  <p className="mt-1 text-sm text-slate-600">{log.message}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Entidad: {log.entityType}
                  </p>
                </div>

                <span className="text-xs font-semibold text-slate-500">
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