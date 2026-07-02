import { AlertTriangle, Info } from "lucide-react";

type ParsedFactor = {
  points: number;
  title: string;
  description: string;
};

type ParsedExplanation = {
  score: number | null;
  decision: string | null;
  factors: ParsedFactor[];
  suggestedAction: string | null;
};

const DECISION_STYLES: Record<string, { label: string; badge: string }> = {
  safe: { label: "Safe", badge: "bg-emerald-100 text-emerald-700" },
  review_required: {
    label: "Revisión requerida",
    badge: "bg-amber-100 text-amber-700",
  },
  high_risk: { label: "Alto riesgo", badge: "bg-red-100 text-red-700" },
};

function parseExplanation(text: string): ParsedExplanation {
  const headerMatch = text.match(/Score\s+(\d+)\.\s*Decisión:\s*([a-z_]+)\./i);
  const score = headerMatch ? Number(headerMatch[1]) : null;
  const decision = headerMatch ? headerMatch[2] : null;

  const actionIndex = text.indexOf("Acción sugerida:");
  const suggestedAction =
    actionIndex >= 0
      ? text.slice(actionIndex + "Acción sugerida:".length).trim()
      : null;

  const bodyStart = headerMatch ? headerMatch.index! + headerMatch[0].length : 0;
  const bodyEnd = actionIndex >= 0 ? actionIndex : text.length;
  const body = text.slice(bodyStart, bodyEnd);

  const factorRegex = /\+(\d+)\s+([^:]+):\s*(.*?)(?=(?:\+\d+\s)|$)/gs;
  const factors: ParsedFactor[] = [];
  let match: RegExpExecArray | null;

  while ((match = factorRegex.exec(body)) !== null) {
    const description = match[3].trim().replace(/\.$/, "");
    if (!description) continue;

    factors.push({
      points: Number(match[1]),
      title: match[2].trim(),
      description,
    });
  }

  return { score, decision, factors, suggestedAction };
}

type Props = {
  explanation: string;
};

export function RiskExplanationDetail({ explanation }: Props) {
  const parsed = parseExplanation(explanation);

  // Fallback: si el texto no coincide con el formato esperado, mostrarlo tal cual.
  if (parsed.score === null || parsed.factors.length === 0) {
    return (
      <div className="mt-3 flex gap-3">
        <AlertTriangle className="mt-1 shrink-0 text-amber-600" size={20} />
        <p className="text-sm leading-6 text-slate-700">{explanation}</p>
      </div>
    );
  }

  const decisionStyle = parsed.decision
    ? DECISION_STYLES[parsed.decision]
    : undefined;

  return (
    <div className="mt-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-slate-900">
            {parsed.score}
          </span>
          <span className="text-sm text-slate-500">/ 100</span>
        </div>

        {decisionStyle && (
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${decisionStyle.badge}`}
          >
            {decisionStyle.label}
          </span>
        )}

        <span className="text-xs text-slate-400">
          {parsed.factors.length}{" "}
          {parsed.factors.length === 1
            ? "factor detectado"
            : "factores detectados"}
        </span>
      </div>

      <div className="mt-4 max-h-72 space-y-2 overflow-y-auto pr-1">
        {parsed.factors.map((factor, index) => (
          <div
            key={`${factor.title}-${index}`}
            className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3"
          >
            <span className="mt-0.5 inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full bg-red-100 px-2 text-xs font-black text-red-700">
              +{factor.points}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900">
                {factor.title}
              </p>
              <p className="mt-0.5 text-sm text-slate-500">
                {factor.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {parsed.suggestedAction && (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
          <Info size={16} className="mt-0.5 shrink-0" />
          <p>
            <span className="font-semibold">Acción sugerida:</span>{" "}
            {parsed.suggestedAction}
          </p>
        </div>
      )}
    </div>
  );
}