"use client";

const CONFIG = {
  EMERGENCY: { emoji: "🚨", badge: "badge-emergency", glow: "glow-border-emergency", bg: "rgba(244,63,94,0.06)" },
  URGENT: { emoji: "⚠️", badge: "badge-urgent", glow: "glow-border-urgent", bg: "rgba(245,158,11,0.06)" },
  ROUTINE: { emoji: "✅", badge: "badge-routine", glow: "glow-border-routine", bg: "rgba(16,185,129,0.06)" },
};

export default function UrgencyCard({ level, reason }) {
  const config = CONFIG[level] || CONFIG.ROUTINE;

  return (
    <div className={`glass-card-static p-6 ${config.glow}`} style={{ background: config.bg }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏷️</span>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Urgency Level
          </h3>
        </div>
        <span className={config.badge}>
          {config.emoji} {level}
        </span>
      </div>
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
        {reason}
      </p>
    </div>
  );
}
