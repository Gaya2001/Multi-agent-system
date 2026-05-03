"use client";

import { useState, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function PatientInputForm({ onSubmit, disabled }) {
  const [input, setInput] = useState("");
  const [demoInputs, setDemoInputs] = useState([]);
  const [isLoadingDemos, setIsLoadingDemos] = useState(false);

  useEffect(() => {
    const fetchDemos = async () => {
      setIsLoadingDemos(true);
      try {
        const res = await fetch(`${API_BASE}/api/demo-inputs`);
        if (res.ok) {
          const data = await res.json();
          setDemoInputs(data.inputs || []);
        }
      } catch {
        // Use fallback demos if API is down
        setDemoInputs([
          {
            label: "🚨 Emergency — Chest Pain",
            text: "My name is John. I am 52. I have severe chest pain and shortness of breath. Started 1 hour ago.",
          },
          {
            label: "⚠️ Urgent — Neurological",
            text: "Hi, I'm Maria, 34. I've been having headache, nausea and blurred vision since yesterday.",
          },
          {
            label: "✅ Routine — Common Cold",
            text: "I am Sarah, 28 years old. I have had a runny nose, sore throat and mild fatigue for 3 days.",
          },
        ]);
      } finally {
        setIsLoadingDemos(false);
      }
    };
    fetchDemos();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim().length >= 5) {
      onSubmit(input.trim());
    }
  };

  const handleDemoClick = (text) => {
    setInput(text);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <form onSubmit={handleSubmit}>
        {/* Input area */}
        <div className="glass-card-static p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🩺</span>
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              Describe Your Symptoms
            </h2>
          </div>

          <textarea
            id="patient-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Example: I am John, 52 years old. I have severe chest pain and shortness of breath. Started 1 hour ago..."
            className="input-area"
            rows={4}
            disabled={disabled}
          />

          <div className="flex items-center justify-between mt-4 gap-4">
            <p className="text-xs text-[var(--text-muted)]">
              {input.length > 0 ? `${input.length} characters` : "Min 5 characters"}
            </p>
            <button
              id="submit-triage"
              type="submit"
              className="btn-primary flex items-center gap-2"
              disabled={disabled || input.trim().length < 5}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
              Run Triage
            </button>
          </div>
        </div>

        {/* Demo inputs */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium">
              Quick Demo Cases
            </span>
            <div className="flex-1 h-px bg-[var(--border-color)]" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {demoInputs.slice(0, 3).map((demo, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleDemoClick(demo.text)}
                className="text-left p-4 rounded-xl border transition-all duration-300 cursor-pointer group"
                style={{
                  background: "rgba(26, 32, 53, 0.4)",
                  borderColor: "var(--border-color)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.3)";
                  e.currentTarget.style.background = "rgba(59, 130, 246, 0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-color)";
                  e.currentTarget.style.background = "rgba(26, 32, 53, 0.4)";
                }}
              >
                <div className="text-sm font-medium mb-1 text-[var(--text-primary)]">
                  {demo.label}
                </div>
                <div className="text-xs text-[var(--text-muted)] line-clamp-2">
                  {demo.text}
                </div>
              </button>
            ))}
          </div>

          {demoInputs.length > 3 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              {demoInputs.slice(3).map((demo, i) => (
                <button
                  key={i + 3}
                  type="button"
                  onClick={() => handleDemoClick(demo.text)}
                  className="text-left p-4 rounded-xl border transition-all duration-300 cursor-pointer"
                  style={{
                    background: "rgba(26, 32, 53, 0.4)",
                    borderColor: "var(--border-color)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.3)";
                    e.currentTarget.style.background = "rgba(59, 130, 246, 0.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-color)";
                    e.currentTarget.style.background = "rgba(26, 32, 53, 0.4)";
                  }}
                >
                  <div className="text-sm font-medium mb-1 text-[var(--text-primary)]">
                    {demo.label}
                  </div>
                  <div className="text-xs text-[var(--text-muted)] line-clamp-2">
                    {demo.text}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
