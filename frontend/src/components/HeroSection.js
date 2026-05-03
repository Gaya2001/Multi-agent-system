"use client";

const AGENTS = [
  {
    icon: "📋",
    name: "Intake Agent",
    desc: "Extracts patient data, symptoms, and demographics from free-text narratives",
    tool: "parse_symptoms_tool",
    delay: "0.15s",
    color: "#3b82f6",
  },
  {
    icon: "🚨",
    name: "Triage Agent",
    desc: "Scores symptom severity (1-10) and classifies urgency level",
    tool: "symptom_severity_tool",
    delay: "0.2s",
    color: "#f59e0b",
  },
  {
    icon: "🔬",
    name: "Research Agent",
    desc: "Matches symptoms against a conditions database for differential analysis",
    tool: "condition_lookup_tool",
    delay: "0.25s",
    color: "#8b5cf6",
  },
  {
    icon: "📝",
    name: "Report Agent",
    desc: "Generates a structured clinical Markdown report for handoff",
    tool: "generate_report_tool",
    delay: "0.3s",
    color: "#10b981",
  },
];

export default function HeroSection() {
  return (
    <section className="relative py-16 sm:py-20 overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-1/4 w-72 h-72 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #3b82f6, transparent)" }} />
        <div className="absolute bottom-10 right-1/4 w-60 h-60 rounded-full opacity-15 blur-3xl"
          style={{ background: "radial-gradient(circle, #8b5cf6, transparent)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: "radial-gradient(circle, #06b6d4, transparent)" }} />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 animate-fadeInUp"
          style={{
            background: "rgba(59, 130, 246, 0.08)",
            border: "1px solid rgba(59, 130, 246, 0.2)",
            animationDelay: "0s",
          }}>
          <span className="text-sm">🤖</span>
          <span className="text-xs font-medium text-[var(--accent-blue)]">
            Multi-Agent System • 4 Specialized AI Agents • Sequential Pipeline Architecture
          </span>
        </div>

        {/* Main heading */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-5 animate-fadeInUp"
          style={{ animationDelay: "0.1s", opacity: 0 }}>
          <span className="text-[var(--text-primary)]">Intelligent </span>
          <span className="gradient-text">Medical Triage</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-3xl mx-auto mb-4 leading-relaxed animate-fadeInUp"
          style={{ animationDelay: "0.15s", opacity: 0 }}>
          Describe your symptoms in plain language. Our multi-agent system will
          assess urgency, evaluate severity, and match potential conditions — all
          running <strong className="text-[var(--text-primary)]">locally and privately</strong>.
        </p>


      </div>
    </section>
  );
}
