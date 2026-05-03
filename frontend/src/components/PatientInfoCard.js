"use client";

export default function PatientInfoCard({ intake }) {
  const { patient_name, patient_age, symptoms, duration_days, intake_notes } = intake;

  return (
    <div className="glass-card-static p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">👤</span>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Patient Information
        </h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--text-muted)]">Name</span>
          <span className="text-sm font-medium text-[var(--text-primary)]">{patient_name || "Unknown"}</span>
        </div>
        <div className="h-px bg-[var(--border-color)]" />
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--text-muted)]">Age</span>
          <span className="text-sm font-medium text-[var(--text-primary)]">{patient_age || "Unknown"}</span>
        </div>
        <div className="h-px bg-[var(--border-color)]" />
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--text-muted)]">Duration</span>
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {duration_days ? `${duration_days} day(s)` : "Not specified"}
          </span>
        </div>
        <div className="h-px bg-[var(--border-color)]" />
        <div>
          <span className="text-xs text-[var(--text-muted)] block mb-2">Extracted Symptoms</span>
          <div className="flex flex-wrap gap-1.5">
            {symptoms.map((s) => (
              <span key={s} className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ background: "rgba(59,130,246,0.1)", color: "var(--accent-blue)", border: "1px solid rgba(59,130,246,0.2)" }}>
                {s}
              </span>
            ))}
            {symptoms.length === 0 && (
              <span className="text-xs text-[var(--text-muted)] italic">No symptoms extracted</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
