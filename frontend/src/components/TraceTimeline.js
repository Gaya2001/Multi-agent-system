"use client";

const AGENT_META = {
  IntakeAgent: {
    icon: "📋",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.1)",
    border: "rgba(59,130,246,0.2)",
    description: "Parsed patient narrative into structured data",
  },
  TriageAgent: {
    icon: "🚨",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.2)",
    description: "Assessed symptom severity and classified urgency",
  },
  ResearchAgent: {
    icon: "🔬",
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.1)",
    border: "rgba(139,92,246,0.2)",
    description: "Matched symptoms against conditions database",
  },
  ReportAgent: {
    icon: "📝",
    color: "#10b981",
    bg: "rgba(16,185,129,0.1)",
    border: "rgba(16,185,129,0.2)",
    description: "Generated structured clinical report",
  },
};

export default function TraceTimeline({ trace }) {
  if (!trace || trace.length === 0) return null;

  return (
    <div className="glass-card-static p-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(59,130,246,0.1)] text-[var(--accent-blue)] font-mono font-semibold">
          {trace.length} steps
        </span>
        <span className="text-xs text-[var(--text-muted)]">executed sequentially</span>
      </div>

      <div className="space-y-0">
        {trace.map((entry, idx) => {
          const meta = AGENT_META[entry.agent] || {
            icon: "🤖",
            color: "#94a3b8",
            bg: "rgba(100,116,139,0.1)",
            border: "rgba(100,116,139,0.2)",
            description: "Agent processing step",
          };

          return (
            <div key={idx} className="flex gap-4">
              {/* Timeline rail */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: meta.bg, border: `1px solid ${meta.border}` }}>
                  {meta.icon}
                </div>
                {idx < trace.length - 1 && (
                  <div className="w-0.5 flex-1 mt-1 mb-1 rounded-full"
                    style={{ background: `linear-gradient(to bottom, ${meta.border}, var(--border-color))` }} />
                )}
              </div>

              {/* Step content */}
              <div className="flex-1 pb-5">
                <div className="p-4 rounded-xl mb-1 transition-all duration-300"
                  style={{ background: "rgba(26,32,53,0.4)", border: "1px solid var(--border-color)" }}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm font-bold text-[var(--text-primary)]">{entry.agent}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(16,185,129,0.12)", color: "#10b981" }}>
                      {entry.status}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] mb-2">{meta.description}</p>

                  <div className="flex items-center gap-3 text-[10px] text-[var(--text-muted)] font-mono">
                    <span>Tool: {entry.tool}</span>
                    <span>•</span>
                    <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                  </div>

                  {/* Agent-specific output details */}
                  <div className="mt-3 pt-2 border-t border-[var(--border-color)]">
                    {entry.symptoms_found !== undefined && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs" style={{ color: meta.color }}>→</span>
                        <p className="text-xs text-[var(--text-secondary)]">
                          Extracted <strong className="text-[var(--text-primary)]">{entry.symptoms_found}</strong> symptom(s) from patient input
                        </p>
                      </div>
                    )}
                    {entry.urgency_level && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs" style={{ color: meta.color }}>→</span>
                        <p className="text-xs text-[var(--text-secondary)]">
                          Classified urgency as <strong className="text-[var(--text-primary)]">{entry.urgency_level}</strong>
                        </p>
                      </div>
                    )}
                    {entry.conditions_found !== undefined && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs" style={{ color: meta.color }}>→</span>
                        <p className="text-xs text-[var(--text-secondary)]">
                          Found <strong className="text-[var(--text-primary)]">{entry.conditions_found}</strong> matching condition(s) in database
                        </p>
                      </div>
                    )}
                    {entry.report_path && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs" style={{ color: meta.color }}>→</span>
                        <p className="text-xs text-[var(--text-secondary)]">
                          Report saved: <span className="font-mono text-[var(--accent-emerald)]">{entry.report_path.split(/[/\\]/).pop()}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
