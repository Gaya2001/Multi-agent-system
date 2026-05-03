"use client";

export default function ConditionsList({ conditions, disclaimer }) {
  return (
    <div className="glass-card-static p-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-lg">🔬</span>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Possible Conditions
        </h3>
      </div>

      {conditions.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)] italic">No matching conditions found.</p>
      ) : (
        <div className="space-y-3">
          {conditions.map((cond, idx) => (
            <div key={cond.name}
              className="p-4 rounded-xl border border-[var(--border-color)] transition-all duration-300 hover:border-[rgba(139,92,246,0.3)] hover:bg-[rgba(139,92,246,0.03)]"
              style={{ animationDelay: `${idx * 0.1}s` }}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[var(--accent-violet)]">#{idx + 1}</span>
                  <h4 className="text-sm font-semibold text-[var(--text-primary)]">{cond.name}</h4>
                </div>
                <div className="flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-bold"
                  style={{
                    background: `rgba(139,92,246,${0.1 + (cond.match_score / 10)})`,
                    color: "var(--accent-violet)",
                    border: "1px solid rgba(139,92,246,0.25)",
                  }}>
                  {cond.match_score} match{cond.match_score !== 1 ? "es" : ""}
                </div>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mb-2 leading-relaxed">{cond.description}</p>
              <div className="flex flex-wrap gap-1">
                {cond.matched_symptoms.map((s) => (
                  <span key={s} className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(139,92,246,0.1)", color: "var(--accent-violet)" }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-5 p-3 rounded-lg" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">{disclaimer}</p>
      </div>
    </div>
  );
}
