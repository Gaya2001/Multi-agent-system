"""
Tool: parse_symptoms_tool
Agent: IntakeAgent
Student: [Student 1]

Parses a free-text patient complaint into structured fields using
a deterministic regex + keyword approach (no LLM needed for extraction).
Falls back gracefully when fields are missing.
"""

import re
import json
from pathlib import Path
from typing import Optional
from datetime import datetime


def parse_symptoms(raw_text: str) -> dict:
    """
    Extract structured symptom data from a patient's free-text description.

    Looks for:
    - Patient name (pattern: "I am <Name>" / "My name is <Name>")
    - Age (pattern: "I am <N> years old" / "age <N>")
    - Symptom keywords from a curated list
    - Duration (pattern: "<N> days/weeks/hours")

    Args:
        raw_text: The unstructured text provided by the patient describing
                  their symptoms, e.g. "I'm John, 34 years old. I have had a
                  severe headache and fever for 3 days."

    Returns:
        A dict with keys:
            patient_name  (str)         – extracted or "Unknown"
            patient_age   (int | None)  – extracted or None
            symptoms      (list[str])   – matched symptom keywords
            duration_days (int | None)  – converted to days or None
            intake_notes  (str)         – original text preserved

    Raises:
        ValueError: If raw_text is empty or not a string.
    """
    if not isinstance(raw_text, str) or not raw_text.strip():
        raise ValueError("raw_text must be a non-empty string.")

    text = raw_text.lower()

    # ── Name extraction ────────────────────────────────────────────────────
    name_match = re.search(
        r"(?:i(?:'m| am)|my name is)\s+([A-Z][a-z]+(?: [A-Z][a-z]+)?)",
        raw_text,
        re.IGNORECASE,
    )
    patient_name: str = name_match.group(1).strip() if name_match else "Unknown"

    # ── Age extraction ─────────────────────────────────────────────────────
    age_match = re.search(
        r"(?:i(?:'m| am)\s+)?(\d{1,3})\s*(?:years?\s*old|yo\b)",
        text,
    )
    patient_age: Optional[int] = int(age_match.group(1)) if age_match else None

    # ── Symptom keyword matching ───────────────────────────────────────────
    SYMPTOM_KEYWORDS = [
        "headache", "fever", "cough", "chest pain", "shortness of breath",
        "nausea", "vomiting", "diarrhea", "dizziness", "fatigue",
        "abdominal pain", "back pain", "rash", "swelling", "confusion",
        "loss of consciousness", "palpitations", "blurred vision", "numbness",
        "weakness", "sore throat", "runny nose", "chills", "sweating",
        "joint pain", "muscle pain", "difficulty breathing", "seizure",
    ]
    symptoms: list[str] = [kw for kw in SYMPTOM_KEYWORDS if kw in text]

    # ── Duration extraction ────────────────────────────────────────────────
    duration_match = re.search(
        r"(\d+)\s*(day|days|week|weeks|hour|hours)",
        text,
    )
    duration_days: Optional[int] = None
    if duration_match:
        n = int(duration_match.group(1))
        unit = duration_match.group(2)
        if "week" in unit:
            duration_days = n * 7
        elif "hour" in unit:
            duration_days = max(1, n // 24)
        else:
            duration_days = n

    result = {
        "patient_name": patient_name,
        "patient_age": patient_age,
        "symptoms": symptoms,
        "duration_days": duration_days,
        "intake_notes": raw_text.strip(),
    }

    # ── Persist to JSON for audit trail ───────────────────────────────────
    out_path = Path(__file__).parent.parent / "data" / "latest_intake.json"
    out_path.parent.mkdir(exist_ok=True)
    with open(out_path, "w") as f:
        json.dump({**result, "timestamp": datetime.utcnow().isoformat()}, f, indent=2)

    return result
