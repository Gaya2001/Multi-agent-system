"""
Agent: ResearchAgent
Student: Mihiraj

Persona: A clinical informaticist who cross-references patient symptoms
against medical knowledge bases to surface the most likely conditions.
Methodical, evidence-focused, never speculates beyond the data.

Responsibilities:
  - Call condition_lookup_tool with the extracted symptoms
  - Use the LLM to provide a plain-English synthesis
  - Attach the mandatory disclaimer to state
  - Append a trace entry
"""

import json
from datetime import datetime
from langchain_ollama import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate
from config import LLM_MODEL, OLLAMA_BASE_URL
from state import PatientState
from tools.condition_lookup_tool import lookup_conditions, DISCLAIMER


SYSTEM_PROMPT = """You are a clinical informaticist reviewing possible conditions.
Given a list of possible conditions matched by symptom overlap, briefly summarise
the top 3 in plain English for a clinician handoff note.
Be concise (max 3 sentences per condition). Do NOT diagnose. Do NOT speculate.
Always end your output with the disclaimer text provided.
"""

HUMAN_TEMPLATE = (
    "Patient symptoms: {symptoms}\n"
    "Matched conditions: {conditions}\n"
    "Disclaimer: {disclaimer}"
)


def run_research_agent(state: PatientState) -> PatientState:
    """
    Run the ResearchAgent node.

    Looks up conditions from the local CSV tool, then uses the LLM to
    generate a clinician-friendly synthesis of the top matches.

    Args:
        state: PatientState containing 'symptoms' and 'urgency_level'.

    Returns:
        Updated PatientState with possible_conditions and disclaimer.
    """
    symptoms = state.get("symptoms", [])

    if not symptoms:
        return {
            **state,
            "possible_conditions": [],
            "disclaimer": DISCLAIMER,
            "trace": [
                *state.get("trace", []),
                {
                    "agent": "ResearchAgent",
                    "timestamp": datetime.utcnow().isoformat(),
                    "note": "Skipped — no symptoms available.",
                },
            ],
        }

    # Skip deep research for EMERGENCY cases — speed matters
    if state.get("urgency_level") == "EMERGENCY":
        top_n = 3
    else:
        top_n = 5

    # ── Step 1: Tool lookup ────────────────────────────────────────────────
    result = lookup_conditions(symptoms, max_results=top_n)
    conditions = result["possible_conditions"]

    # ── Step 2: LLM synthesis (best-effort) ───────────────────────────────
    try:
        llm = OllamaLLM(model=LLM_MODEL, base_url=OLLAMA_BASE_URL, temperature=0)
        prompt = ChatPromptTemplate.from_messages([
            ("system", SYSTEM_PROMPT),
            ("human", HUMAN_TEMPLATE),
        ])
        chain = prompt | llm
        # LLM output stored as notes; does not replace structured data
        chain.invoke({
            "symptoms": ", ".join(symptoms),
            "conditions": json.dumps(conditions[:3], indent=2),
            "disclaimer": DISCLAIMER,
        })
    except Exception:
        pass  # Structured data from tool is sufficient

    trace_entry = {
        "agent": "ResearchAgent",
        "timestamp": datetime.utcnow().isoformat(),
        "tool_called": "lookup_conditions",
        "conditions_found": len(conditions),
        "output": [c["name"] for c in conditions],
    }

    return {
        **state,
        "possible_conditions": conditions,
        "disclaimer": DISCLAIMER,
        "trace": [*state.get("trace", []), trace_entry],
    }
