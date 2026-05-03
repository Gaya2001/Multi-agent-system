"use client";

function getBarColor(score) {
  if (score >= 8) return "linear-gradient(90deg, #dc2626, #f43f5e)";
  if (score >= 5) return "linear-gradient(90deg, #f59e0b, #fb923c)";
  return "linear-gradient(90deg, #10b981, #06b6d4)";
}

function getTextColor(score) {
  if (score >= 8) return "#f43f5e";
  if (score >= 5) return "#f59e0b";
  return "#10b981";
}

export default function SeverityChart({ scores }) {
  if (!scores || Object.keys(scores).length === 0) return null;

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  return (
    <div className="glass-card-static p-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-lg">📊</span>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Symptom Severity Scores
        </h3>
      </div>

      <div className="space-y-4">
        {sorted.map(([symptom, score], idx) => (
          <div key={symptom} className="animate-slideInRight" style={{ animationDelay: `${idx * 0.1}s`, opacity: 0 }}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm text-[var(--text-primary)] capitalize font-medium">{symptom}</span>
              <span className="text-sm font-bold font-mono" style={{ color: getTextColor(score) }}>
                {score}/10
              </span>
            </div>
            <div className="severity-bar">
              <div className="severity-bar-fill" style={{
                width: `${score * 10}%`,
                background: getBarColor(score),
                animationDelay: `${idx * 0.1}s`,
              }} />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 mt-5 pt-4 border-t border-[var(--border-color)]">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-1.5 rounded-full" style={{ background: "linear-gradient(90deg, #dc2626, #f43f5e)" }} />
          <span className="text-[10px] text-[var(--text-muted)]">High (8-10)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-1.5 rounded-full" style={{ background: "linear-gradient(90deg, #f59e0b, #fb923c)" }} />
          <span className="text-[10px] text-[var(--text-muted)]">Medium (5-7)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-1.5 rounded-full" style={{ background: "linear-gradient(90deg, #10b981, #06b6d4)" }} />
          <span className="text-[10px] text-[var(--text-muted)]">Low (1-4)</span>
        </div>
      </div>
    </div>
  );
}
