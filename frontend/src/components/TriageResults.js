"use client";

import { useState } from "react";
import AgentAnalysisCards from "./AgentAnalysisCards";
import ReportViewer from "./ReportViewer";
import TraceTimeline from "./TraceTimeline";

const TABS = [
  { id: "agents", label: "Agent Analysis", icon: "🤖", description: "Individual agent outputs" },
  { id: "report", label: "Full Report", icon: "📋", description: "Generated clinical report" },
  { id: "trace", label: "Pipeline Trace", icon: "🔍", description: "Execution trace log" },
];

function getLevelConfig(level) {
  if (level === "EMERGENCY") return { emoji: "🚨", label: "EMERGENCY", badge: "badge-emergency", glow: "glow-border-emergency", color: "#f43f5e", bg: "rgba(244,63,94,0.06)" };
  if (level === "URGENT") return { emoji: "⚠️", label: "URGENT", badge: "badge-urgent", glow: "glow-border-urgent", color: "#f59e0b", bg: "rgba(245,158,11,0.06)" };
  return { emoji: "✅", label: "ROUTINE", badge: "badge-routine", glow: "glow-border-routine", color: "#10b981", bg: "rgba(16,185,129,0.06)" };
}

export default function TriageResults({ data, onReset }) {
  const [activeTab, setActiveTab] = useState("agents");
  const { intake, triage, research, report, trace, timestamp } = data;
  const levelConfig = getLevelConfig(triage.urgency_level);

  return (
    <div className="animate-fadeInUp">
      {/* ── Results Header ─────────────────────────────────────────── */}
      <div className="glass-card-static p-6 mb-6" style={{ background: levelConfig.bg, borderColor: `${levelConfig.color}33` }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
              style={{
                background: `linear-gradient(135deg, ${levelConfig.color}22, ${levelConfig.color}11)`,
                border: `2px solid ${levelConfig.color}44`,
                boxShadow: `0 0 25px ${levelConfig.color}22`,
              }}>
              {levelConfig.emoji}
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">
                Triage Assessment Complete
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Patient <strong className="text-[var(--text-primary)]">{intake.patient_name || "Unknown"}</strong>
                {intake.patient_age ? `, age ${intake.patient_age}` : ""} &middot;
                {" "}{intake.symptoms.length} symptom(s) identified &middot;
                {" "}{research.possible_conditions.length} condition(s) matched
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={levelConfig.badge}>
              {levelConfig.emoji} {levelConfig.label}
            </span>
            <button onClick={onReset} className="btn-secondary" id="reset-btn">
              ← New Assessment
            </button>
          </div>
        </div>

        {/* Quick stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl" style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.12)" }}>
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1">Symptoms</p>
            <p className="text-lg font-bold text-[var(--accent-blue)]">{intake.symptoms.length}</p>
          </div>
          <div className="p-3 rounded-xl" style={{ background: `${levelConfig.color}0D`, border: `1px solid ${levelConfig.color}1F` }}>
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1">Urgency</p>
            <p className="text-lg font-bold" style={{ color: levelConfig.color }}>{triage.urgency_level}</p>
          </div>
          <div className="p-3 rounded-xl" style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.12)" }}>
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1">Conditions</p>
            <p className="text-lg font-bold text-[var(--accent-violet)]">{research.possible_conditions.length}</p>
          </div>
          <div className="p-3 rounded-xl" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.12)" }}>
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1">Agents</p>
            <p className="text-lg font-bold text-[var(--accent-emerald)]">4 / 4</p>
          </div>
        </div>
      </div>

      {/* ── Tab Navigation ─────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap cursor-pointer"
              style={{
                background: isActive ? "rgba(59,130,246,0.1)" : "rgba(26,32,53,0.4)",
                border: `1px solid ${isActive ? "rgba(59,130,246,0.3)" : "var(--border-color)"}`,
                color: isActive ? "var(--accent-blue)" : "var(--text-muted)",
                boxShadow: isActive ? "0 0 20px rgba(59,130,246,0.1)" : "none",
              }}
              id={`tab-${tab.id}`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ────────────────────────────────────────────── */}
      <div className="animate-fadeIn" key={activeTab}>
        {activeTab === "agents" && (
          <AgentAnalysisCards data={data} />
        )}

        {activeTab === "report" && (
          <ReportViewer report={report} />
        )}

        {activeTab === "trace" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                style={{ background: "rgba(59,130,246,0.15)" }}>
                🔍
              </div>
              <div>
                <h2 className="text-base font-bold text-[var(--text-primary)]">Pipeline Execution Trace</h2>
                <p className="text-xs text-[var(--text-muted)]">Chronological log of all agent tool invocations and their results</p>
              </div>
            </div>
            <TraceTimeline trace={trace} />
          </div>
        )}
      </div>

      {/* ── Timestamp footer ───────────────────────────────────────── */}
      <div className="mt-8 pt-4 border-t border-[var(--border-color)] flex items-center justify-between">
        <p className="text-[10px] text-[var(--text-muted)] font-mono">
          Assessment completed at: {timestamp ? new Date(timestamp).toLocaleString() : "N/A"}
        </p>
        <p className="text-[10px] text-[var(--text-muted)]">
          Medical Triage MAS v1.0 — For educational purposes only
        </p>
      </div>
    </div>
  );
}
