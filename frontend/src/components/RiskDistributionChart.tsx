import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { KybCase } from "../types/kyb";

type Props = {
  cases: KybCase[];
};

export function RiskDistributionChart({ cases }: Props) {
  const data = [
    {
      name: "Pending",
      total: cases.filter((item) => !item.decision).length,
    },
    {
      name: "Safe",
      total: cases.filter((item) => item.decision === "safe").length,
    },
    {
      name: "Review",
      total: cases.filter((item) => item.decision === "review_required").length,
    },
    {
      name: "High risk",
      total: cases.filter((item) => item.decision === "high_risk").length,
    },
  ];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-black text-slate-900">
          Distribución de riesgo
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Expedientes agrupados por decisión KYB.
        </p>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
            <Tooltip />
            <Bar dataKey="total" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}