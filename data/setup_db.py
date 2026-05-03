"""
One-time setup: creates and populates the SQLite symptom severity database.
Run once before starting the system: python data/setup_db.py
"""

import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "symptoms.db"

SYMPTOM_DATA = [
    # (symptom_name, severity_score 1-10, urgency_flag, notes)
    ("chest pain",             10, "EMERGENCY", "May indicate MI or PE"),
    ("loss of consciousness",  10, "EMERGENCY", "Requires immediate intervention"),
    ("seizure",                10, "EMERGENCY", "Active seizure is life-threatening"),
    ("difficulty breathing",    9, "EMERGENCY", "Airway compromise"),
    ("shortness of breath",     8, "EMERGENCY", "May indicate cardiac or respiratory failure"),
    ("palpitations",            7, "URGENT",    "Possible arrhythmia"),
    ("blurred vision",          7, "URGENT",    "Neurological or ophthalmological concern"),
    ("numbness",                6, "URGENT",    "Possible stroke symptom"),
    ("confusion",               8, "EMERGENCY", "Possible encephalopathy"),
    ("weakness",                6, "URGENT",    "May indicate neurological event"),
    ("abdominal pain",          6, "URGENT",    "Wide differential — requires assessment"),
    ("fever",                   5, "URGENT",    "Infection marker"),
    ("vomiting",                4, "URGENT",    "Dehydration risk"),
    ("diarrhea",                3, "ROUTINE",   "Usually self-limiting"),
    ("headache",                5, "URGENT",    "Thunderclap headache = EMERGENCY"),
    ("rash",                    3, "ROUTINE",   "Unless spreading rapidly"),
    ("swelling",                4, "ROUTINE",   "Localised vs systemic matters"),
    ("cough",                   3, "ROUTINE",   "Unless productive with blood"),
    ("nausea",                  3, "ROUTINE",   "Monitor hydration"),
    ("dizziness",               5, "URGENT",    "Fall risk; possible cardiac"),
    ("fatigue",                 2, "ROUTINE",   "Non-specific; context-dependent"),
    ("back pain",               4, "ROUTINE",   "Red flags: bladder/bowel involvement"),
    ("sore throat",             2, "ROUTINE",   "Usually viral"),
    ("runny nose",              1, "ROUTINE",   "Upper respiratory infection"),
    ("chills",                  4, "ROUTINE",   "Infection marker"),
    ("sweating",                3, "ROUTINE",   "Night sweats warrant investigation"),
    ("joint pain",              3, "ROUTINE",   "Acute monoarthritis = URGENT"),
    ("muscle pain",             2, "ROUTINE",   "Usually self-limiting"),
]


def setup() -> None:
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute("DROP TABLE IF EXISTS symptom_severity")
    cur.execute("""
        CREATE TABLE symptom_severity (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            symptom_name  TEXT    NOT NULL UNIQUE,
            severity_score INTEGER NOT NULL CHECK(severity_score BETWEEN 1 AND 10),
            urgency_flag  TEXT    NOT NULL CHECK(urgency_flag IN ('ROUTINE','URGENT','EMERGENCY')),
            clinical_notes TEXT
        )
    """)
    cur.executemany(
        "INSERT INTO symptom_severity (symptom_name, severity_score, urgency_flag, clinical_notes) VALUES (?,?,?,?)",
        SYMPTOM_DATA,
    )
    conn.commit()
    conn.close()
    print(f"Database created at: {DB_PATH}  ({len(SYMPTOM_DATA)} symptoms loaded)")


if __name__ == "__main__":
    setup()
