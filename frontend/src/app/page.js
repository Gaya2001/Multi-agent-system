"use client";

import { useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import PatientInputForm from "@/components/PatientInputForm";
import AgentPipeline from "@/components/AgentPipeline";
import TriageResults from "@/components/TriageResults";
import Footer from "@/components/Footer";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Home() {
  const [patientInput, setPatientInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAgent, setCurrentAgent] = useState(null);
  const [completedAgents, setCompletedAgents] = useState([]);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const simulateAgentProgress = async () => {
    const agents = ["IntakeAgent", "TriageAgent", "ResearchAgent", "ReportAgent"];
    for (let i = 0; i < agents.length; i++) {
      setCurrentAgent(agents[i]);
      await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
      setCompletedAgents((prev) => [...prev, agents[i]]);
    }
    setCurrentAgent(null);
  };

  const handleSubmit = async (input) => {
    setPatientInput(input);
    setIsProcessing(true);
    setError(null);
    setResults(null);
    setCurrentAgent(null);
    setCompletedAgents([]);

    // Run agent animation & API call concurrently
    const animationPromise = simulateAgentProgress();

    try {
      const res = await fetch(`${API_BASE}/api/triage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patient_input: input }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Server error (${res.status})`);
      }

      const data = await res.json();
      await animationPromise; // Ensure animation finishes
      setResults(data);
    } catch (err) {
      await animationPromise;
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setPatientInput("");
    setResults(null);
    setError(null);
    setCurrentAgent(null);
    setCompletedAgents([]);
    setIsProcessing(false);
  };

  return (
    <main className="flex flex-col min-h-screen">
      <Header />

      {!results && !isProcessing && <HeroSection />}

      <section className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* ── Input Form ──────────────────────────────────────────── */}
        {!results && !isProcessing && (
          <div className="animate-fadeInUp" style={{ animationDelay: "0.3s", opacity: 0 }}>
            <PatientInputForm onSubmit={handleSubmit} disabled={isProcessing} />
          </div>
        )}

        {/* ── Agent Pipeline Visualization ────────────────────────── */}
        {isProcessing && (
          <div className="mt-8 animate-fadeIn">
            <AgentPipeline
              currentAgent={currentAgent}
              completedAgents={completedAgents}
              patientInput={patientInput}
            />
          </div>
        )}

        {/* ── Error State ─────────────────────────────────────────── */}
        {error && !isProcessing && (
          <div className="mt-8 animate-fadeInUp">
            <div className="glass-card-static p-6 glow-border-emergency">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">⚠️</span>
                <h3 className="text-lg font-semibold text-[var(--accent-rose)]">
                  Pipeline Error
                </h3>
              </div>
              <p className="text-[var(--text-secondary)] mb-4">{error}</p>
              <button onClick={handleReset} className="btn-secondary">
                ← Try Again
              </button>
            </div>
          </div>
        )}

        {/* ── Results Dashboard ────────────────────────────────────── */}
        {results && !isProcessing && (
          <div className="mt-6">
            <TriageResults data={results} onReset={handleReset} />
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
