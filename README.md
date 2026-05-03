# Medical Triage Multi-Agent System
**SE4010 CTSE Assignment 2 — Group Project**

A locally-hosted MAS that automates medical triage using LangGraph + Ollama.
No cloud APIs, no paid keys, runs entirely on your machine.

---

## Architecture

```
Patient Input
     │
     ▼
[IntakeAgent]          → parse_symptoms_tool        → structured symptom data
     │
     ▼
[TriageAgent]          → symptom_severity_tool       → urgency level (EMERGENCY / URGENT / ROUTINE)
     │
     ▼
[ResearchAgent]        → condition_lookup_tool       → ranked possible conditions
     │
     ▼
[ReportAgent]          → generate_report_tool        → Markdown report + JSONL trace log
```

---

## Setup

### 1. Install Ollama
```bash
curl -fsSL https://ollama.ai/install.sh | sh
ollama pull llama3:8b
```

### 2. Install Python dependencies
```bash
pip install -r requirements.txt
```

### 3. Initialise the symptom database
```bash
python data/setup_db.py
```

### 4. Run the system
```bash
# Default demo (chest pain emergency case)
python main.py

# Custom patient input
python main.py --input "I am Jane, 45 years old. I have fever and headache for 2 days."
```

### 5. Run tests (no Ollama required)
```bash
pytest tests/ -v
```

---

## Project Structure

```
medical_triage_mas/
├── main.py              # Entry point
├── graph.py             # LangGraph pipeline definition
├── state.py             # PatientState TypedDict
├── config.py            # Global settings (model, paths)
├── agents/
│   ├── intake_agent.py      # Student 1 — extracts symptoms from free text
│   ├── triage_agent.py      # Student 2 — assigns urgency level
│   ├── research_agent.py    # Student 3 — looks up possible conditions
│   └── report_agent.py      # Student 4 — writes structured report
├── tools/
│   ├── parse_symptoms_tool.py      # Student 1 — regex + keyword extraction
│   ├── symptom_severity_tool.py    # Student 2 — SQLite DB severity lookup
│   ├── condition_lookup_tool.py    # Student 3 — CSV condition matching
│   └── generate_report_tool.py    # Student 4 — Markdown report writer
├── tests/
│   ├── test_intake_agent.py    # Student 1's tests
│   ├── test_triage_agent.py    # Student 2's tests
│   ├── test_research_agent.py  # Student 3's tests
│   ├── test_report_agent.py    # Student 4's tests
│   └── test_harness.py         # Unified end-to-end integration tests
├── data/
│   ├── setup_db.py       # One-time DB initialisation script
│   ├── symptoms.db        # SQLite severity database (generated)
│   └── conditions.csv     # Local conditions dataset (generated)
├── logs/
│   └── agent_trace.jsonl  # AgentOps observability log
└── reports/               # Generated patient triage reports (.md)
```

---

## Individual Contributions

| Student | Agent | Tool |
|---|---|---|
| Hiran | IntakeAgent | `parse_symptoms_tool.py` |
| Gayashan | TriageAgent | `symptom_severity_tool.py` |
| Mihiraj | ResearchAgent | `condition_lookup_tool.py` |
| Sonal | ReportAgent | `generate_report_tool.py` |

---

## Disclaimer
This system is built for educational purposes only. It is not a medical device
and must not be used for actual clinical decisions.
