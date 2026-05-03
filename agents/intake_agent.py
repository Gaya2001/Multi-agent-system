"""
Agent: IntakeAgent
Student: [Student 1]

Persona: A calm, empathetic medical receptionist who carefully listens to
the patient's complaint and structures it into computable fields.

Responsibilities:
  - Receive the raw patient input
  - Call parse_symptoms_tool to extract structured data
  - Optionally invoke the LLM to fill in any gaps the regex missed
  - Append a trace entry to state["trace"]
"""

import json
from datetime import datetime
from langchain_ollama import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate
from config import LLM_MODEL, OLLAMA_BASE_URL
from state import PatientState
from tools.parse_symptoms_tool import parse_symptoms


SYSTEM_PROMPT = """You are a meticulous medical intake coordinator.
Your ONLY job is to extract structured information from a patient's description.
Respond ONLY with a valid JSON object — no markdown fences, no prose.

Required keys (use null if unknown):
{
  "patient_name": string,
  "patient_age": integer or null,
  "symptoms": [list of symptom strings],
  "duration_days": integer or null,
  "intake_notes": string
}

Rules:
- Never invent symptoms the patient did not mention.
- Never diagnose; only extract.
- Keep intake_notes as the verbatim patient statement.
"""

HUMAN_TEMPLATE = "Patient statement:\n{raw_input}"


def run_intake_agent(state: PatientState) -> PatientState:
    """
    Run the IntakeAgent node.

    Parses the patient's raw_input using the deterministic tool first,
    then optionally refines via LLM for any fields the regex missed.

    Args:
        state: The current PatientState dict (must contain 'raw_input').

    Returns:
        Updated PatientState with intake fields and a new trace entry.
    """
    raw = state.get("raw_input", "")

    # ── Step 1: Deterministic tool extraction ──────────────────────────────
    parsed = parse_symptoms(raw)

    # ── Step 2: LLM refinement (if Ollama available) ───────────────────────
    llm_result: dict = {}
    try:
        llm = OllamaLLM(
            model=LLM_MODEL,
            base_url=OLLAMA_BASE_URL,
            temperature=0,
        )
        prompt = ChatPromptTemplate.from_messages([
            ("system", SYSTEM_PROMPT),
            ("human", HUMAN_TEMPLATE),
        ])
        chain = prompt | llm
        raw_llm = chain.invoke({"raw_input": raw})
        llm_result = json.loads(raw_llm)
    except Exception:
        # Ollama may not be running in CI / test environments — use tool output
        llm_result = parsed

    # Merge: tool-extracted fields take priority over LLM for safety
    merged_symptoms = list(
        {*parsed.get("symptoms", []), *llm_result.get("symptoms", [])}
    )

    trace_entry = {
        "agent": "IntakeAgent",
        "timestamp": datetime.utcnow().isoformat(),
        "input": raw,
        "tool_called": "parse_symptoms",
        "output": {
            "patient_name": parsed["patient_name"],
            "symptoms_found": len(merged_symptoms),
        },
    }

    return {
        **state,
        "patient_name":  parsed.get("patient_name") or llm_result.get("patient_name", "Unknown"),
        "patient_age":   parsed.get("patient_age")  or llm_result.get("patient_age"),
        "symptoms":      merged_symptoms,
        "duration_days": parsed.get("duration_days") or llm_result.get("duration_days"),
        "intake_notes":  raw,
        "trace":         [*state.get("trace", []), trace_entry],
    }
