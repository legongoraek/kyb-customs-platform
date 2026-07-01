type Props = {
  canApprove?: boolean | null;
};

export function ApprovalBadge({ canApprove }: Props) {
  const isPending = canApprove === null || canApprove === undefined;

  const className = isPending
    ? "bg-slate-100 text-slate-700 border-slate-200"
    : canApprove
      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
      : "bg-red-100 text-red-800 border-red-200";

  const label = isPending
    ? "Approval pending"
    : canApprove
      ? "Can approve"
      : "Approval blocked";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${className} ml-2`}
    >
      {label}
    </span>
  );
}