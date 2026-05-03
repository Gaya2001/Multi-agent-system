"use client";

const AGENTS = [
  {
    id: "IntakeAgent",
    icon: "📋",
    name: "Intake Agent",
    tool: "parse_symptoms_tool",
    role: "Patient Data Extraction",
    description: "Parsing free-text patient narrative to extract structured clinical data including name, age, symptoms, and duration",
    color: "#3b82f6",
    gradient: "linear-gradient(135deg, #3b82f6, #2563eb)",
  },
  {
    id: "TriageAgent",
    icon: "🚨",
    name: "Triage Agent",
    tool: "symptom_severity_tool",
    role: "Severity & Urgency Classification",
    description: "Scoring each symptom on a 1–10 severity scale and determining overall urgency level (EMERGENCY / URGENT / ROUTINE)",
    color: "#f59e0b",
    gradient: "linear-gradient(135deg, #f59e0b, #fb923c)",
  },
  {
    id: "ResearchAgent",
    icon: "🔬",
    name: "Research Agent",
    tool: "condition_lookup_tool",
    role: "Differential Condition Matching",
    description: "Cross-referencing symptom profile against conditions database to identify and rank potential diagnoses",
    color: "#8b5cf6",
    gradient: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
  },
  {
    id: "ReportAgent",
    icon: "📝",
    name: "Report Agent",
    tool: "generate_report_tool",
    role: "Clinical Report Synthesis",
    description: "Synthesizing all pipeline outputs into a structured Markdown report for clinical handoff and record-keeping",
    color: "#10b981",
    gradient: "linear-gradient(135deg, #10b981, #06b6d4)",
  },
];

function StatusIcon({ status, color }) {
  if (status === "completed") return (
    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.25)" }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
    </div>
  );
  if (status === "active") return (
    <div className="w-12 h-12 rounded-xl flex items-center justify-center animate-pulseGlow" style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
      <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${color} ${color} ${color} transparent` }} />
    </div>
  );
  return (
    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(100,116,139,0.08)", border: "1px solid rgba(100,116,139,0.1)" }}>
      <div className="w-3 h-3 rounded-full bg-[var(--text-muted)] opacity-40" />
    </div>
  );
}

export default function AgentPipeline({ currentAgent, completedAgents, patientInput }) {
  const getStatus = (id) => {
    if (completedAgents.includes(id)) return "completed";
    if (currentAgent === id) return "active";
    return "pending";
  };

  const completedCount = completedAgents.length;
  const progressPercent = (completedCount / AGENTS.length) * 100;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Patient input display */}
      <div className="glass-card-static p-5 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span>🧑‍⚕️</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Patient Input Received</span>
        </div>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed italic">&ldquo;{patientInput}&rdquo;</p>
      </div>

      {/* Processing header */}
      <div className="glass-card-static p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="animate-spinSlow">⚙️</div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">Multi-Agent Pipeline Processing</h2>
              <p className="text-xs text-[var(--text-muted)]">Sequential execution of 4 specialized AI agents</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold text-[var(--accent-cyan)]">{completedCount}/{AGENTS.length}</span>
            <div className="loading-dots"><span /><span /><span /></div>
          </div>
        </div>
        {/* Overall progress bar */}
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(6,182,212,0.1)" }}>
          <div className="h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%`, background: "linear-gradient(90deg, #06b6d4, #3b82f6, #8b5cf6)" }} />
        </div>
      </div>

      {/* Pipeline nodes */}
      <div className="space-y-0">
        {AGENTS.map((agent, idx) => {
          const status = getStatus(agent.id);
          return (
            <div key={agent.id}>
              <div className={`pipeline-node ${status}`}>
                <div className="flex items-center gap-4">
                  <StatusIcon status={status} color={agent.color} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-base">{agent.icon}</span>
                      <span className="text-sm font-bold text-[var(--text-primary)]">{agent.name}</span>
                      {status === "active" && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: `${agent.color}22`, color: agent.color, border: `1px solid ${agent.color}44` }}>
                          Processing...
                        </span>
                      )}
                      {status === "completed" && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(16,185,129,0.12)", color: "#10b981" }}>
                          ✓ Complete
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mb-0.5">{agent.role}</p>
                    <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">{agent.description}</p>
                    <p className="text-[10px] text-[var(--text-muted)] font-mono mt-1 opacity-60">Tool: {agent.tool}</p>
                  </div>
                </div>
                {status === "active" && (
                  <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: `${agent.color}15` }}>
                    <div className="h-full rounded-full" style={{
                      background: agent.gradient,
                      animation: "progressFill 1.2s ease-in-out infinite alternate",
                    }} />
                  </div>
                )}
              </div>
              {idx < AGENTS.length - 1 && (
                <div className={`pipeline-connector ${completedAgents.includes(agent.id) ? "active" : ""}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
