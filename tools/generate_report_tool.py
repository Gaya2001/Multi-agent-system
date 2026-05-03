"""
Tool: generate_report_tool
Agent: ReportAgent
Student: Sonal

Synthesises all state collected by the previous agents and writes a
structured Markdown patient triage report to disk.
"""

import json
from datetime import datetime
from pathlib import Path
from typing import Optional

REPORTS_DIR = Path(__file__).parent.parent / "reports"
REPORTS_DIR.mkdir(exist_ok=True)

_URGENCY_EMOJI = {
    "EMERGENCY": "🚨",
    "URGENT":    "⚠️",
    "ROUTINE":   "✅",
}


def generate_report(
    patient_name: str,
    patient_age: Optional[int],
    symptoms: list[str],
    duration_days: Optional[int],
    urgency_level: str,
    urgency_reason: str,
    severity_scores: dict[str, int],
    possible_conditions: list[dict],
    disclaimer: str,
    intake_notes: str,
) -> dict:
    """
    Write a structured Markdown triage report and return its path + summary.

    Args:
        patient_name:        Patient's name (or "Unknown").
        patient_age:         Patient's age in years, or None.
        symptoms:            List of extracted symptom strings.
        duration_days:       How long symptoms have persisted, or None.
        urgency_level:       One of "EMERGENCY", "URGENT", "ROUTINE".
        urgency_reason:      Plain-English explanation of the urgency decision.
        severity_scores:     Mapping of symptom → severity score (1-10).
        possible_conditions: Ranked list of condition dicts from ResearchAgent.
        disclaimer:          Mandatory AI disclaimer string.
        intake_notes:        Original raw patient text (preserved verbatim).

    Returns:
        A dict with keys:
            report_path    (str) – absolute path to the written .md file
            report_summary (str) – one-paragraph plain-text summary

    Raises:
        ValueError: If urgency_level is not one of the valid values.
    """
    valid_urgency = {"EMERGENCY", "URGENT", "ROUTINE"}
    if urgency_level not in valid_urgency:
        raise ValueError(f"urgency_level must be one of {valid_urgency}.")

    now = datetime.utcnow()
    timestamp = now.strftime("%Y%m%d_%H%M%S")
    safe_name = patient_name.replace(" ", "_").lower()
    filename = f"triage_{safe_name}_{timestamp}.md"
    report_path = REPORTS_DIR / filename

    emoji = _URGENCY_EMOJI.get(urgency_level, "")
    age_str = str(patient_age) if patient_age else "Unknown"
    duration_str = f"{duration_days} day(s)" if duration_days else "Not specified"

    # ── Severity table rows ────────────────────────────────────────────────
    severity_rows = "\n".join(
        f"| {sym.title()} | {score}/10 |"
        for sym, score in sorted(severity_scores.items(), key=lambda x: -x[1])
    )

    # ── Conditions section ─────────────────────────────────────────────────
    if possible_conditions:
        condition_blocks = []
        for i, cond in enumerate(possible_conditions, 1):
            matched = ", ".join(cond.get("matched_symptoms", []))
            condition_blocks.append(
                f"**{i}. {cond['name']}** (matched {cond['match_score']} symptom(s): {matched})\n"
                f"> {cond['description']}"
            )
        conditions_md = "\n\n".join(condition_blocks)
    else:
        conditions_md = "_No matching conditions found in database._"

    # ── Assemble Markdown ──────────────────────────────────────────────────
    report_md = f"""# {emoji} Medical Triage Report

**Generated:** {now.strftime("%Y-%m-%d %H:%M UTC")}
**System:** Medical Triage MAS (local Ollama / LangGraph)

---

## Patient Information

| Field | Value |
|---|---|
| Name | {patient_name} |
| Age | {age_str} |
| Duration | {duration_str} |

---

## Urgency Assessment

### {emoji} {urgency_level}

{urgency_reason}

### Symptom Severity Scores

| Symptom | Score |
|---|---|
{severity_rows}

---

## Possible Conditions

{conditions_md}

---

## Original Patient Statement

> {intake_notes}

---

## Disclaimer

{disclaimer}
"""

    report_path.write_text(report_md, encoding="utf-8")

    # ── Build summary ──────────────────────────────────────────────────────
    top_condition = possible_conditions[0]["name"] if possible_conditions else "unknown"
    report_summary = (
        f"Report for {patient_name} (age {age_str}) written to {filename}. "
        f"Urgency: {urgency_level}. Top possible condition: {top_condition}. "
        f"{len(symptoms)} symptoms assessed."
    )

    return {
        "report_path": str(report_path.resolve()),
        "report_summary": report_summary,
    }
