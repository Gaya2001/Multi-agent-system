"use client";

import { useState } from "react";

const AGENT_DETAILS = {
  IntakeAgent: {
    icon: "📋",
    name: "Intake Agent",
    tool: "parse_symptoms_tool",
    role: "Patient Data Extraction & Parsing",
    description:
      "The Intake Agent serves as the first point of contact in the triage pipeline. It processes raw, unstructured patient narratives and extracts structured clinical data — including the patient's identity, age, symptom list, and symptom duration — using natural language parsing techniques.",
    color: "#3b82f6",
    gradient: "linear-gradient(135deg, #3b82f6, #2563eb)",
    bgTint: "rgba(59, 130, 246, 0.06)",
    borderTint: "rgba(59, 130, 246, 0.2)",
  },
  TriageAgent: {
    icon: "🚨",
    name: "Triage Agent",
    tool: "symptom_severity_tool",
    role: "Severity Scoring & Urgency Classification",
    description:
      "The Triage Agent evaluates each extracted symptom against a medical severity database, assigning scores from 1-10 based on clinical risk factors. It then determines the overall urgency level (EMERGENCY, URGENT, or ROUTINE) based on the highest severity symptom detected.",
    color: "#f59e0b",
    gradient: "linear-gradient(135deg, #f59e0b, #fb923c)",
    bgTint: "rgba(245, 158, 11, 0.06)",
    borderTint: "rgba(245, 158, 11, 0.2)",
  },
  ResearchAgent: {
    icon: "🔬",
    name: "Research Agent",
    tool: "condition_lookup_tool",
    role: "Condition Matching & Differential Analysis",
    description:
      "The Research Agent cross-references the patient's symptom profile against a curated conditions database to identify potential diagnoses. It ranks conditions by the number of matching symptoms and provides clinical descriptions to support the assessment.",
    color: "#8b5cf6",
    gradient: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
    bgTint: "rgba(139, 92, 246, 0.06)",
    borderTint: "rgba(139, 92, 246, 0.2)",
  },
  ReportAgent: {
    icon: "📝",
    name: "Report Agent",
    tool: "generate_report_tool",
    role: "Clinical Report Generation",
    description:
      "The Report Agent synthesizes all findings from the pipeline into a comprehensive, structured Markdown report suitable for clinical handoff. It includes patient demographics, urgency classification, severity scores, differential conditions, and the original patient statement.",
    color: "#10b981",
    gradient: "linear-gradient(135deg, #10b981, #06b6d4)",
    bgTint: "rgba(16, 185, 129, 0.06)",
    borderTint: "rgba(16, 185, 129, 0.2)",
  },
};

function IntakeAnalysis({ intake }) {
  const { patient_name, patient_age, symptoms, duration_days, intake_notes } = intake;
  return (
    <div className="space-y-4">
      {/* Extracted data grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl" style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)" }}>
          <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1">Patient Name</p>
          <p className="text-sm font-semibold text-[var(--text-primary)]">{patient_name || "Unknown"}</p>
        </div>
        <div className="p-3 rounded-xl" style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)" }}>
          <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1">Age</p>
          <p className="text-sm font-semibold text-[var(--text-primary)]">{patient_age || "N/A"}</p>
        </div>
        <div className="p-3 rounded-xl" style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)" }}>
          <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1">Symptom Count</p>
          <p className="text-sm font-semibold text-[var(--text-primary)]">{symptoms.length}</p>
        </div>
        <div className="p-3 rounded-xl" style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)" }}>
          <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1">Duration</p>
          <p className="text-sm font-semibold text-[var(--text-primary)]">{duration_days ? `${duration_days} day(s)` : "N/A"}</p>
        </div>
      </div>

      {/* Extracted symptoms */}
      <div>
        <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Extracted Symptoms</p>
        <div className="flex flex-wrap gap-2">
          {symptoms.map((s) => (
            <span key={s} className="text-xs px-3 py-1.5 rounded-full font-medium"
              style={{ background: "rgba(59,130,246,0.12)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.25)" }}>
              {s}
            </span>
          ))}
          {symptoms.length === 0 && (
            <span className="text-xs text-[var(--text-muted)] italic">No symptoms were extracted from the input</span>
          )}
        </div>
      </div>

      {/* Original statement */}
      <div>
        <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Original Patient Statement</p>
        <div className="p-3 rounded-xl italic text-sm text-[var(--text-secondary)] leading-relaxed"
          style={{ background: "rgba(59,130,246,0.04)", borderLeft: "3px solid rgba(59,130,246,0.3)" }}>
          &ldquo;{intake_notes}&rdquo;
        </div>
      </div>
    </div>
  );
}

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

function getLevelConfig(level) {
  if (level === "EMERGENCY") return { emoji: "🚨", color: "#f43f5e", bg: "rgba(244,63,94,0.12)", border: "rgba(244,63,94,0.3)" };
  if (level === "URGENT") return { emoji: "⚠️", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)" };
  return { emoji: "✅", color: "#10b981", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.3)" };
}

function TriageAnalysis({ triage }) {
  const { urgency_level, urgency_reason, severity_scores } = triage;
  const levelConfig = getLevelConfig(urgency_level);
  const sorted = Object.entries(severity_scores || {}).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-4">
      {/* Urgency banner */}
      <div className="p-4 rounded-xl flex items-center gap-4"
        style={{ background: levelConfig.bg, border: `1px solid ${levelConfig.border}` }}>
        <span className="text-3xl">{levelConfig.emoji}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base font-bold" style={{ color: levelConfig.color }}>{urgency_level}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
              style={{ background: levelConfig.bg, color: levelConfig.color, border: `1px solid ${levelConfig.border}` }}>
              Classification
            </span>
          </div>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{urgency_reason}</p>
        </div>
      </div>

      {/* Severity scores */}
      {sorted.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Symptom Severity Scores</p>
          <div className="space-y-3">
            {sorted.map(([symptom, score], idx) => (
              <div key={symptom} className="animate-slideInRight" style={{ animationDelay: `${idx * 0.08}s`, opacity: 0 }}>
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
                  }} />
                </div>
              </div>
            ))}
          </div>
          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[var(--border-color)]">
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
      )}
    </div>
  );
}

function ResearchAnalysis({ research }) {
  const { possible_conditions, disclaimer } = research;

  return (
    <div className="space-y-4">
      {possible_conditions.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)] italic">No matching conditions were identified in the database.</p>
      ) : (
        <>
          <p className="text-xs text-[var(--text-secondary)] mb-2">
            Identified <strong className="text-[var(--text-primary)]">{possible_conditions.length}</strong> possible condition(s) based on symptom matching:
          </p>
          <div className="space-y-3">
            {possible_conditions.map((cond, idx) => (
              <div key={cond.name}
                className="p-4 rounded-xl border transition-all duration-300 hover:border-[rgba(139,92,246,0.4)]"
                style={{ background: "rgba(139,92,246,0.04)", borderColor: "rgba(139,92,246,0.15)" }}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa" }}>
                      {idx + 1}
                    </span>
                    <h4 className="text-sm font-semibold text-[var(--text-primary)]">{cond.name}</h4>
                  </div>
                  <div className="flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-bold"
                    style={{
                      background: `rgba(139,92,246,${0.1 + (cond.match_score / 12)})`,
                      color: "#a78bfa",
                      border: "1px solid rgba(139,92,246,0.25)",
                    }}>
                    {cond.match_score} match{cond.match_score !== 1 ? "es" : ""}
                  </div>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mb-3 leading-relaxed">{cond.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {cond.matched_symptoms.map((s) => (
                    <span key={s} className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{ background: "rgba(139,92,246,0.12)", color: "#a78bfa" }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Disclaimer */}
      <div className="p-3 rounded-xl flex items-start gap-2"
        style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}>
        <span className="text-sm mt-0.5">⚠️</span>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">{disclaimer}</p>
      </div>
    </div>
  );
}

function ReportAnalysis({ report }) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{report.report_summary}</p>
      <div className="p-3 rounded-xl" style={{ background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.15)" }}>
        <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1">Report Path</p>
        <p className="text-xs font-mono text-[var(--accent-emerald)] break-all">{report.report_path}</p>
      </div>
      <p className="text-[11px] text-[var(--text-muted)]">
        View the full rendered report in the <strong>Full Report</strong> tab below.
      </p>
    </div>
  );
}

const ANALYSIS_RENDERERS = {
  IntakeAgent: (data) => <IntakeAnalysis intake={data.intake} />,
  TriageAgent: (data) => <TriageAnalysis triage={data.triage} />,
  ResearchAgent: (data) => <ResearchAnalysis research={data.research} />,
  ReportAgent: (data) => <ReportAnalysis report={data.report} />,
};

export default function AgentAnalysisCards({ data }) {
  const [expandedAgent, setExpandedAgent] = useState("IntakeAgent");
  const agents = ["IntakeAgent", "TriageAgent", "ResearchAgent", "ReportAgent"];

  return (
    <div className="space-y-4">
      {/* Section title */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
          style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))" }}>
          🤖
        </div>
        <div>
          <h2 className="text-base font-bold text-[var(--text-primary)]">Agent Analysis Breakdown</h2>
          <p className="text-xs text-[var(--text-muted)]">Detailed output from each specialized AI agent in the pipeline</p>
        </div>
      </div>

      {agents.map((agentId, idx) => {
        const detail = AGENT_DETAILS[agentId];
        const isExpanded = expandedAgent === agentId;

        return (
          <div key={agentId}
            className="rounded-2xl overflow-hidden transition-all duration-400 animate-fadeInUp"
            style={{
              animationDelay: `${idx * 0.1}s`,
              opacity: 0,
              background: isExpanded ? detail.bgTint : "rgba(26, 32, 53, 0.4)",
              border: `1px solid ${isExpanded ? detail.borderTint : "var(--border-color)"}`,
              boxShadow: isExpanded ? `0 0 30px ${detail.borderTint}` : "none",
            }}>
            {/* Agent header — always visible */}
            <button
              onClick={() => setExpandedAgent(isExpanded ? null : agentId)}
              className="w-full p-5 flex items-center gap-4 cursor-pointer transition-all duration-300"
              id={`agent-card-${agentId}`}
            >
              {/* Agent icon */}
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: detail.gradient, boxShadow: `0 4px 15px ${detail.borderTint}` }}>
                {detail.icon}
              </div>

              {/* Agent info */}
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-bold text-[var(--text-primary)]">{detail.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: "rgba(16,185,129,0.12)", color: "#10b981" }}>
                    ✓ Complete
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">{detail.role}</p>
                <p className="text-[10px] text-[var(--text-muted)] font-mono mt-0.5">Tool: {detail.tool}</p>
              </div>

              {/* Expand icon */}
              <svg
                width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke={isExpanded ? detail.color : "var(--text-muted)"}
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className="flex-shrink-0 transition-transform duration-300"
                style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0)" }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {/* Agent detail panel */}
            {isExpanded && (
              <div className="px-5 pb-5 animate-fadeIn">
                {/* Agent description */}
                <div className="mb-4 p-3 rounded-xl"
                  style={{ background: "rgba(100,116,139,0.06)", borderLeft: `3px solid ${detail.color}` }}>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {detail.description}
                  </p>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: detail.color }}>
                    Analysis Output
                  </span>
                  <div className="flex-1 h-px" style={{ background: detail.borderTint }} />
                </div>

                {/* Agent-specific analysis */}
                {ANALYSIS_RENDERERS[agentId](data)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
