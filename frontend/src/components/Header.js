"use client";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border-color)]"
      style={{ background: "rgba(10, 14, 26, 0.85)", backdropFilter: "blur(16px)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
            style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}>
            🏥
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-[var(--text-primary)]">
              Medical Triage <span className="gradient-text">MAS</span>
            </h1>
            <p className="text-[10px] text-[var(--text-muted)] tracking-wider uppercase">
              Multi-Agent System • SE4010
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Architecture badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
            style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.15)" }}>
            <span className="text-[var(--accent-violet)] font-medium">4 Agents</span>
            <span className="text-[var(--text-muted)]">•</span>
            <span className="text-[var(--text-muted)] font-mono">Sequential Pipeline</span>
          </div>

          {/* Status indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
            style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
            <span className="w-2 h-2 rounded-full bg-[var(--accent-emerald)] animate-pulse"></span>
            <span className="text-[var(--accent-emerald)] font-medium">System Online</span>
          </div>

          {/* Tech stack */}
          <div className="text-xs text-[var(--text-muted)] font-mono hidden lg:block">
            LangGraph + Ollama
          </div>
        </div>
      </div>
    </header>
  );
}
