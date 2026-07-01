import type { KybDecision } from "../types/kyb";

type Props = {
  score: number;
  decision: KybDecision;
};

export function ScoreCard({ score, decision }: Props) {
  const percentage = Math.min(Math.max(score, 0), 100);

  const label =
    decision === "safe"
      ? "Operable"
      : decision === "review_required"
        ? "Revisión manual"
        : decision === "high_risk"
          ? "Bloqueado"
          : "Pendiente";

  const barClass =
    decision === "safe"
      ? "bg-emerald-500"
      : decision === "review_required"
        ? "bg-amber-500"
        : decision === "high_risk"
          ? "bg-red-500"
          : "bg-slate-400";

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
            Risk score
          </p>
          <p className="mt-2 text-5xl font-black text-slate-900">{score}</p>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-700">
          {label}
        </span>
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${barClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="mt-3 flex justify-between text-xs font-semibold text-slate-400">
        <span>0</span>
        <span>25</span>
        <span>60</span>
        <span>100</span>
      </div>

      <div className="mt-2 flex justify-between text-[11px] font-bold uppercase tracking-wide text-slate-400">
        <span>Safe</span>
        <span>Review</span>
        <span>High risk</span>
      </div>
    </div>
  );
}