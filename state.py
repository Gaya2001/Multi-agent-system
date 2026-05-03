"""
Shared state (TypedDict) that flows through every node in the LangGraph.

The graph passes this dict by reference — each agent reads what it needs
and adds its output keys. Nothing is ever overwritten; the state only grows.
"""

from __future__ import annotations
from typing import TypedDict, Optional


class PatientState(TypedDict, total=False):
    # ── Set by the caller (main.py) ────────────────────────────────────────
    raw_input: str                   # Free-text symptom description from patient

    # ── Set by IntakeAgent ─────────────────────────────────────────────────
    patient_name: str
    patient_age: Optional[int]
    symptoms: list[str]              # Extracted symptom strings
    duration_days: Optional[int]     # How long symptoms have been present
    intake_notes: str                # Any extra context the agent captured

    # ── Set by TriageAgent ─────────────────────────────────────────────────
    urgency_level: str               # "EMERGENCY" | "URGENT" | "ROUTINE"
    urgency_reason: str              # 1-2 sentence justification
    severity_scores: dict[str, int]  # {symptom: severity_score}

    # ── Set by ResearchAgent ───────────────────────────────────────────────
    possible_conditions: list[dict]  # [{name, description, match_score}]
    disclaimer: str                  # Mandatory "not a diagnosis" note

    # ── Set by ReportAgent ─────────────────────────────────────────────────
    report_path: str                 # Absolute path to written .md report
    report_summary: str              # One-paragraph summary for display

    # ── AgentOps / Observability ───────────────────────────────────────────
    trace: list[dict]                # Append-only log of every agent step
