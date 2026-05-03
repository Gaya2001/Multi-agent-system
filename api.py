"""
FastAPI backend that exposes the Medical Triage MAS pipeline over HTTP.
Provides REST endpoints for the Next.js frontend.
"""

import json
import traceback
from datetime import datetime
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# ── Local imports (same package) ───────────────────────────────────────────
from tools.parse_symptoms_tool import parse_symptoms
from tools.symptom_severity_tool import assess_severity
from tools.condition_lookup_tool import lookup_conditions, DISCLAIMER
from tools.generate_report_tool import generate_report
from config import REPORTS_DIR, LOG_FILE

app = FastAPI(
    title="Medical Triage MAS API",
    version="1.0.0",
    description="REST API for the Medical Triage Multi-Agent System",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request / Response Models ──────────────────────────────────────────────

class TriageRequest(BaseModel):
    patient_input: str = Field(..., min_length=5, description="Free-text patient symptom description")


class IntakeResult(BaseModel):
    patient_name: str
    patient_age: Optional[int] = None
    symptoms: list[str]
    duration_days: Optional[int] = None
    intake_notes: str


class TriageResult(BaseModel):
    urgency_level: str
    urgency_reason: str
    severity_scores: dict[str, int]


class ConditionItem(BaseModel):
    name: str
    description: str
    match_score: int
    matched_symptoms: list[str]


class ResearchResult(BaseModel):
    possible_conditions: list[ConditionItem]
    disclaimer: str


class ReportResult(BaseModel):
    report_path: str
    report_summary: str
    report_content: str = ""


class FullTriageResponse(BaseModel):
    intake: IntakeResult
    triage: TriageResult
    research: ResearchResult
    report: ReportResult
    trace: list[dict]
    timestamp: str


class AgentStepResponse(BaseModel):
    agent: str
    status: str
    data: dict
    timestamp: str


# ── Endpoints ──────────────────────────────────────────────────────────────

@app.get("/api/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}


@app.post("/api/triage", response_model=FullTriageResponse)
async def run_triage(request: TriageRequest):
    """
    Run the full triage pipeline (all 4 agents) and return combined results.
    This runs agents sequentially using the deterministic tools (no LLM required).
    """
    trace = []
    raw_input = request.patient_input

    try:
        # ── Agent 1: IntakeAgent ───────────────────────────────────────────
        parsed = parse_symptoms(raw_input)
        intake = IntakeResult(
            patient_name=parsed["patient_name"],
            patient_age=parsed["patient_age"],
            symptoms=parsed["symptoms"],
            duration_days=parsed["duration_days"],
            intake_notes=parsed["intake_notes"],
        )
        trace.append({
            "agent": "IntakeAgent",
            "timestamp": datetime.utcnow().isoformat(),
            "tool": "parse_symptoms",
            "status": "success",
            "symptoms_found": len(parsed["symptoms"]),
        })

        # ── Agent 2: TriageAgent ───────────────────────────────────────────
        if not intake.symptoms:
            severity_result = {
                "severity_scores": {},
                "urgency_level": "ROUTINE",
                "urgency_reason": "No symptoms extracted; defaulting to ROUTINE.",
            }
        else:
            severity_result = assess_severity(intake.symptoms)

        triage = TriageResult(
            urgency_level=severity_result["urgency_level"],
            urgency_reason=severity_result["urgency_reason"],
            severity_scores=severity_result["severity_scores"],
        )
        trace.append({
            "agent": "TriageAgent",
            "timestamp": datetime.utcnow().isoformat(),
            "tool": "assess_severity",
            "status": "success",
            "urgency_level": severity_result["urgency_level"],
        })

        # ── Agent 3: ResearchAgent ─────────────────────────────────────────
        if intake.symptoms:
            top_n = 3 if triage.urgency_level == "EMERGENCY" else 5
            conditions_result = lookup_conditions(intake.symptoms, max_results=top_n)
            conditions = [
                ConditionItem(**c) for c in conditions_result["possible_conditions"]
            ]
        else:
            conditions = []

        research = ResearchResult(
            possible_conditions=conditions,
            disclaimer=DISCLAIMER,
        )
        trace.append({
            "agent": "ResearchAgent",
            "timestamp": datetime.utcnow().isoformat(),
            "tool": "lookup_conditions",
            "status": "success",
            "conditions_found": len(conditions),
        })

        # ── Agent 4: ReportAgent ───────────────────────────────────────────
        report_result = generate_report(
            patient_name=intake.patient_name,
            patient_age=intake.patient_age,
            symptoms=intake.symptoms,
            duration_days=intake.duration_days,
            urgency_level=triage.urgency_level,
            urgency_reason=triage.urgency_reason,
            severity_scores=triage.severity_scores,
            possible_conditions=[c.model_dump() for c in conditions],
            disclaimer=DISCLAIMER,
            intake_notes=intake.intake_notes,
        )
        # Read the generated report content for inline rendering
        report_file = Path(report_result["report_path"])
        report_content = ""
        if report_file.exists():
            report_content = report_file.read_text(encoding="utf-8")

        report = ReportResult(
            report_path=report_result["report_path"],
            report_summary=report_result["report_summary"],
            report_content=report_content,
        )
        trace.append({
            "agent": "ReportAgent",
            "timestamp": datetime.utcnow().isoformat(),
            "tool": "generate_report",
            "status": "success",
            "report_path": report_result["report_path"],
        })

        # ── Flush trace to JSONL log ───────────────────────────────────────
        log_path = Path(LOG_FILE)
        log_path.parent.mkdir(exist_ok=True)
        with open(log_path, "a", encoding="utf-8") as f:
            session = {
                "session_id": datetime.utcnow().strftime("%Y%m%d_%H%M%S"),
                "patient_name": intake.patient_name,
                "urgency_level": triage.urgency_level,
                "trace": trace,
            }
            f.write(json.dumps(session) + "\n")

        return FullTriageResponse(
            intake=intake,
            triage=triage,
            research=research,
            report=report,
            trace=trace,
            timestamp=datetime.utcnow().isoformat(),
        )

    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline error: {str(e)}")


@app.post("/api/triage/step/intake", response_model=AgentStepResponse)
async def run_intake_step(request: TriageRequest):
    """Run only the IntakeAgent step (for step-by-step mode)."""
    try:
        parsed = parse_symptoms(request.patient_input)
        return AgentStepResponse(
            agent="IntakeAgent",
            status="success",
            data=parsed,
            timestamp=datetime.utcnow().isoformat(),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/triage/step/triage")
async def run_triage_step(symptoms: list[str]):
    """Run only the TriageAgent step."""
    try:
        result = assess_severity(symptoms)
        return AgentStepResponse(
            agent="TriageAgent",
            status="success",
            data=result,
            timestamp=datetime.utcnow().isoformat(),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/triage/step/research")
async def run_research_step(symptoms: list[str]):
    """Run only the ResearchAgent step."""
    try:
        result = lookup_conditions(symptoms)
        return AgentStepResponse(
            agent="ResearchAgent",
            status="success",
            data=result,
            timestamp=datetime.utcnow().isoformat(),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/history")
async def get_history():
    """Return all past triage sessions from the JSONL log."""
    log_path = Path(LOG_FILE)
    if not log_path.exists():
        return {"sessions": []}
    sessions = []
    with open(log_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                try:
                    sessions.append(json.loads(line))
                except json.JSONDecodeError:
                    continue
    # Return most recent first
    sessions.reverse()
    return {"sessions": sessions}


@app.get("/api/demo-inputs")
async def get_demo_inputs():
    """Return demo patient input strings for quick testing."""
    return {
        "inputs": [
            {
                "label": "🚨 Emergency — Chest Pain",
                "text": "My name is John. I am 52. I have severe chest pain and shortness of breath. Started 1 hour ago.",
            },
            {
                "label": "⚠️ Urgent — Neurological",
                "text": "Hi, I'm Maria, 34. I've been having headache, nausea and blurred vision since yesterday.",
            },
            {
                "label": "✅ Routine — Common Cold",
                "text": "I am Sarah, 28 years old. I have had a runny nose, sore throat and mild fatigue for 3 days.",
            },
            {
                "label": "🚨 Emergency — Seizure",
                "text": "My friend Alex, age 22, just had a seizure and lost consciousness. He was confused when he woke up.",
            },
            {
                "label": "⚠️ Urgent — Abdominal",
                "text": "I'm David, 41. I've had severe abdominal pain, vomiting and fever for 2 days now.",
            },
        ]
    }
