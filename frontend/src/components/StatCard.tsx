type Props = {
  label: string;
  value: number;
  active?: boolean;
  onClick?: () => void;
};

export function StatCard({ label, value, active = false, onClick }: Props) {
  const isInteractive = typeof onClick === "function";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isInteractive}
      className={`rounded-3xl border p-5 text-left shadow-sm transition-colors ${
        active
          ? "border-slate-900 bg-slate-900"
          : "border-slate-200 bg-white"
      } ${isInteractive ? "cursor-pointer hover:border-slate-400" : "cursor-default"}`}
    >
      <p
        className={`text-sm font-semibold ${
          active ? "text-slate-300" : "text-slate-500"
        }`}
      >
        {label}
      </p>
      <p
        className={`mt-2 text-3xl font-black ${
          active ? "text-white" : "text-slate-900"
        }`}
      >
        {value}
      </p>
    </button>
  );
}