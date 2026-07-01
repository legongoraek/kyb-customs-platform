import type { KybDecision } from "../types/kyb";

type Props = {
  decision: KybDecision;
};

export function RiskBadge({ decision }: Props) {
  const styles: Record<string, string> = {
    safe: "bg-emerald-100 text-emerald-800 border-emerald-200",
    review_required: "bg-amber-100 text-amber-800 border-amber-200",
    high_risk: "bg-red-100 text-red-800 border-red-200",
    pending: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const labels: Record<string, string> = {
    safe: "Safe",
    review_required: "Review required",
    high_risk: "High risk",
    pending: "Pending",
  };

  const key = decision || "pending";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${styles[key]}`}
    >
      {labels[key]}
    </span>
  );
}