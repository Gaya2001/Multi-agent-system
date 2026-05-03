"""
Tool: symptom_severity_tool
Agent: TriageAgent
Student: Gayashan

Queries the local SQLite symptom severity database to score each extracted
symptom and determine the overall urgency level for the patient.
"""

import sqlite3
from pathlib import Path
from typing import Optional

DB_PATH = Path(__file__).parent.parent / "data" / "symptoms.db"

# Urgency priority order (higher index = more urgent)
URGENCY_RANK = {"ROUTINE": 0, "URGENT": 1, "EMERGENCY": 2}


def assess_severity(symptoms: list[str]) -> dict:
    """
    Look up each symptom in the local SQLite database and return severity
    scores plus an overall urgency classification.

    Args:
        symptoms: A list of symptom keyword strings extracted by IntakeAgent,
                  e.g. ["chest pain", "fever", "dizziness"].

    Returns:
        A dict with keys:
            severity_scores  (dict[str, int])  – {symptom: score 1-10}
            urgency_level    (str)              – "EMERGENCY" | "URGENT" | "ROUTINE"
            urgency_reason   (str)              – Human-readable explanation
            unknown_symptoms (list[str])        – Symptoms not found in DB

    Raises:
        FileNotFoundError: If the symptoms database does not exist.
        ValueError: If symptoms is not a non-empty list.
    """
    if not isinstance(symptoms, list) or len(symptoms) == 0:
        raise ValueError("symptoms must be a non-empty list of strings.")

    if not DB_PATH.exists():
        raise FileNotFoundError(
            f"Symptom database not found at {DB_PATH}. "
            "Run: python data/setup_db.py"
        )

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    severity_scores: dict[str, int] = {}
    unknown_symptoms: list[str] = []
    overall_urgency = "ROUTINE"
    worst_symptom: Optional[str] = None

    for symptom in symptoms:
        cur.execute(
            "SELECT severity_score, urgency_flag, clinical_notes "
            "FROM symptom_severity WHERE symptom_name = ?",
            (symptom.lower().strip(),),
        )
        row = cur.fetchone()
        if row:
            severity_scores[symptom] = row["severity_score"]
            # Escalate urgency if this symptom is worse than current
            if URGENCY_RANK[row["urgency_flag"]] > URGENCY_RANK[overall_urgency]:
                overall_urgency = row["urgency_flag"]
                worst_symptom = symptom
        else:
            unknown_symptoms.append(symptom)
            severity_scores[symptom] = 3  # default moderate score

    conn.close()

    # Build a human-readable reason
    if worst_symptom:
        urgency_reason = (
            f"Highest severity symptom: '{worst_symptom}' "
            f"(score {severity_scores[worst_symptom]}/10) → {overall_urgency}."
        )
    else:
        urgency_reason = "No recognised symptoms matched database; defaulting to ROUTINE."

    if unknown_symptoms:
        urgency_reason += f" Unrecognised symptoms: {', '.join(unknown_symptoms)}."

    return {
        "severity_scores": severity_scores,
        "urgency_level": overall_urgency,
        "urgency_reason": urgency_reason,
        "unknown_symptoms": unknown_symptoms,
    }
