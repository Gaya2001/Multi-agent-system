"""
Global configuration for the Medical Triage MAS.
All Ollama and path settings live here — change once, works everywhere.
"""

import os
from pathlib import Path

# ── Paths ──────────────────────────────────────────────────────────────────
BASE_DIR   = Path(__file__).parent
DATA_DIR   = BASE_DIR / "data"
LOGS_DIR   = BASE_DIR / "logs"
REPORTS_DIR = BASE_DIR / "reports"
DB_PATH    = DATA_DIR / "symptoms.db"

# Create dirs if they don't exist
for d in [DATA_DIR, LOGS_DIR, REPORTS_DIR]:
    d.mkdir(exist_ok=True)

# ── Ollama / LLM ───────────────────────────────────────────────────────────
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
LLM_MODEL       = os.getenv("LLM_MODEL", "llama3:8b")   # swap for phi3 / qwen etc.
LLM_TEMPERATURE = 0.0    # deterministic for medical use
LLM_MAX_TOKENS  = 1024

# ── Free public API ────────────────────────────────────────────────────────
# Open Disease Data API — no key required
DISEASE_API_URL = "https://disease.sh/v3/covid-19"  # used as example health endpoint

# ── Logging ────────────────────────────────────────────────────────────────
LOG_FILE = LOGS_DIR / "agent_trace.jsonl"   # one JSON object per line
