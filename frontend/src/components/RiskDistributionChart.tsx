import {
  Bar,
  BarChart,
  CartesianGrid,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { KybCase } from "../types/kyb";

export type RiskDistributionFilter =
  | "all"
  | "pending"
  | "safe"
  | "review_required"
  | "high_risk";

type Props = {
  cases: KybCase[];
  activeFilter?: RiskDistributionFilter;
  onSelectFilter?: (filter: RiskDistributionFilter) => void;
};

const ACTIVE_COLOR = "#0f172a";
const INACTIVE_COLOR = "#94a3b8";

export function RiskDistributionChart({
  cases,
  activeFilter = "all",
  onSelectFilter,
}: Props) {
  const data: { name: string; total: number; filter: RiskDistributionFilter }[] = [
    {
      name: "Pending",
      total: cases.filter((item) => !item.decision).length,
      filter: "pending",
    },
    {
      name: "Safe",
      total: cases.filter((item) => item.decision === "safe").length,
      filter: "safe",
    },
    {
      name: "Review",
      total: cases.filter((item) => item.decision === "review_required")
        .length,
      filter: "review_required",
    },
    {
      name: "High risk",
      total: cases.filter((item) => item.decision === "high_risk").length,
      filter: "high_risk",
    },
  ];

  const isInteractive = typeof onSelectFilter === "function";

  const handleBarClick = (barData: { payload?: { filter?: RiskDistributionFilter } }) => {
    if (!onSelectFilter || !barData?.payload?.filter) return;

    onSelectFilter(activeFilter === barData.payload.filter ? "all" : barData.payload.filter);
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-900">
            Distribución de riesgo
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {isInteractive
              ? "Haz clic en una barra para filtrar los expedientes."
              : "Expedientes agrupados por decisión KYB."}
          </p>
        </div>

        {isInteractive && activeFilter !== "all" && (
          <button
            onClick={() => onSelectFilter("all")}
            className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
          >
            Quitar filtro
          </button>
        )}
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
            <Tooltip cursor={isInteractive ? { fill: "#f1f5f9" } : undefined} />
            <Bar
              dataKey="total"
              radius={[10, 10, 0, 0]}
              onClick={isInteractive ? handleBarClick : undefined}
              cursor={isInteractive ? "pointer" : "default"}
              shape={(props: React.ComponentProps<typeof Rectangle> & { payload?: { filter?: RiskDistributionFilter } }) => {
                const entryFilter = props.payload?.filter as
                  | RiskDistributionFilter
                  | undefined;
                const fill =
                  activeFilter === "all" || activeFilter === entryFilter
                    ? ACTIVE_COLOR
                    : INACTIVE_COLOR;
 
                return <Rectangle {...props} fill={fill} />;
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}