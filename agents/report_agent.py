"""
Agent: ReportAgent
Student: Sonal

Persona: A senior clinical documentation specialist who synthesises all
gathered information into a clear, structured handoff document for the
attending physician.

Responsibilities:
  - Collect all state fields from previous agents
  - Call generate_report_tool to write the Markdown report to disk
  - Flush the full trace to the JSONL log file for observability
  - Return final state with report_path and report_summary
"""

import json
from datetime import datetime
from pathlib import Path
from config import LOG_FILE
from state import PatientState
from tools.generate_report_tool import generate_report


def run_report_agent(state: PatientState) -> PatientState:
    """
    Run the ReportAgent node (final step in the graph).

    Generates the structured Markdown report and persists the full
    agent trace to the JSONL observability log.

    Args:
        state: PatientState with all fields populated by previous agents.

    Returns:
        Updated PatientState with report_path and report_summary.
    """
    # ── Step 1: Generate the report ────────────────────────────────────────
    result = generate_report(
        patient_name       = state.get("patient_name", "Unknown"),
        patient_age        = state.get("patient_age"),
        symptoms           = state.get("symptoms", []),
        duration_days      = state.get("duration_days"),
        urgency_level      = state.get("urgency_level", "ROUTINE"),
        urgency_reason     = state.get("urgency_reason", ""),
        severity_scores    = state.get("severity_scores", {}),
        possible_conditions= state.get("possible_conditions", []),
        disclaimer         = state.get("disclaimer", ""),
        intake_notes       = state.get("intake_notes", ""),
    )

    trace_entry = {
        "agent": "ReportAgent",
        "timestamp": datetime.utcnow().isoformat(),
        "tool_called": "generate_report",
        "output": {
            "report_path": result["report_path"],
        },
    }

    final_trace = [*state.get("trace", []), trace_entry]

    # ── Step 2: Flush trace to JSONL log ───────────────────────────────────
    log_path = Path(LOG_FILE)
    log_path.parent.mkdir(exist_ok=True)
    with open(log_path, "a", encoding="utf-8") as f:
        session = {
            "session_id": datetime.utcnow().strftime("%Y%m%d_%H%M%S"),
            "patient_name": state.get("patient_name", "Unknown"),
            "urgency_level": state.get("urgency_level", "ROUTINE"),
            "trace": final_trace,
        }
        f.write(json.dumps(session) + "\n")

    return {
        **state,
        "report_path":    result["report_path"],
        "report_summary": result["report_summary"],
        "trace":          final_trace,
    }
