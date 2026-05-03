"""
Agent: TriageAgent
Student: Gayashan

Persona: A seasoned emergency department nurse with 15 years of experience.
No-nonsense, clinically precise, focused on patient safety above all else.

Responsibilities:
  - Receive the structured symptoms list from IntakeAgent state
  - Call symptom_severity_tool to score each symptom against the local DB
  - Determine the final urgency level: EMERGENCY / URGENT / ROUTINE
  - Append a trace entry to state["trace"]
"""

import json
from datetime import datetime
from langchain_ollama import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate
from config import LLM_MODEL, OLLAMA_BASE_URL
from state import PatientState
from tools.symptom_severity_tool import assess_severity


SYSTEM_PROMPT = """You are an experienced emergency department triage nurse.
Given a list of symptoms and their severity scores, confirm or upgrade the
urgency classification. Output ONLY a JSON object — no markdown, no prose.

{
  "urgency_level": "EMERGENCY" | "URGENT" | "ROUTINE",
  "urgency_reason": "1-2 sentence clinical justification"
}

Rules:
- Never downgrade EMERGENCY to a lower level.
- Err on the side of caution. When in doubt, escalate.
- Do not diagnose. Only classify urgency.
"""

HUMAN_TEMPLATE = (
    "Symptoms and scores: {severity_scores}\n"
    "Initial classification: {initial_urgency}\n"
    "Reason: {initial_reason}"
)


def run_triage_agent(state: PatientState) -> PatientState:
    """
    Run the TriageAgent node.

    Scores symptoms via the local SQLite tool, then optionally validates
    the classification with the LLM.

    Args:
        state: PatientState containing 'symptoms' from IntakeAgent.

    Returns:
        Updated PatientState with urgency fields and a new trace entry.
    """
    symptoms = state.get("symptoms", [])

    if not symptoms:
        return {
            **state,
            "urgency_level": "ROUTINE",
            "urgency_reason": "No symptoms extracted; defaulting to ROUTINE.",
            "severity_scores": {},
            "trace": [
                *state.get("trace", []),
                {
                    "agent": "TriageAgent",
                    "timestamp": datetime.utcnow().isoformat(),
                    "note": "No symptoms to assess.",
                },
            ],
        }

    # ── Step 1: DB tool ────────────────────────────────────────────────────
    assessment = assess_severity(symptoms)
    initial_urgency = assessment["urgency_level"]
    initial_reason  = assessment["urgency_reason"]

    # ── Step 2: LLM confirmation ───────────────────────────────────────────
    final_urgency = initial_urgency
    final_reason  = initial_reason

    try:
        llm = OllamaLLM(model=LLM_MODEL, base_url=OLLAMA_BASE_URL, temperature=0)
        prompt = ChatPromptTemplate.from_messages([
            ("system", SYSTEM_PROMPT),
            ("human", HUMAN_TEMPLATE),
        ])
        chain = prompt | llm
        raw = chain.invoke({
            "severity_scores": json.dumps(assessment["severity_scores"]),
            "initial_urgency": initial_urgency,
            "initial_reason":  initial_reason,
        })
        llm_result = json.loads(raw)

        # Safety rule: LLM can only escalate, never de-escalate
        from tools.symptom_severity_tool import URGENCY_RANK
        if URGENCY_RANK.get(llm_result.get("urgency_level", ""), 0) >= URGENCY_RANK[initial_urgency]:
            final_urgency = llm_result.get("urgency_level", initial_urgency)
            final_reason  = llm_result.get("urgency_reason", initial_reason)

    except Exception:
        pass  # Fall back to DB-only result

    trace_entry = {
        "agent": "TriageAgent",
        "timestamp": datetime.utcnow().isoformat(),
        "tool_called": "assess_severity",
        "symptoms_assessed": symptoms,
        "output": {"urgency_level": final_urgency},
    }

    return {
        **state,
        "urgency_level":  final_urgency,
        "urgency_reason": final_reason,
        "severity_scores": assessment["severity_scores"],
        "trace": [*state.get("trace", []), trace_entry],
    }
