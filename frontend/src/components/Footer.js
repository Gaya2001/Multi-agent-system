"use client";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border-color)] mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <span>🏥</span>
            <span>Medical Triage MAS — SE4010 CTSE Assignment 2</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-[var(--text-muted)] font-mono">
              LangGraph • Ollama • Next.js
            </span>
          </div>
        </div>
        <div className="mt-3 p-2.5 rounded-lg text-center" style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.1)" }}>
          <p className="text-[10px] text-[var(--text-muted)]">
            ⚠️ This system is for educational purposes only. It is NOT a medical device and must NOT be used for actual clinical decisions.
          </p>
        </div>
      </div>
    </footer>
  );
}
