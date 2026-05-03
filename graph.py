"""
LangGraph graph definition for the Medical Triage MAS.

Nodes (agents) are connected in a sequential pipeline:
  IntakeAgent → TriageAgent → ResearchAgent → ReportAgent

State is a TypedDict (PatientState) that grows at each node.
"""

from langgraph.graph import StateGraph, END
from state import PatientState
from agents.intake_agent   import run_intake_agent
from agents.triage_agent   import run_triage_agent
from agents.research_agent import run_research_agent
from agents.report_agent   import run_report_agent


def build_graph() -> StateGraph:
    """
    Construct and compile the LangGraph StateGraph.

    Returns:
        A compiled runnable graph ready to invoke with an initial PatientState.
    """
    builder = StateGraph(PatientState)

    # ── Register nodes ─────────────────────────────────────────────────────
    builder.add_node("intake",   run_intake_agent)
    builder.add_node("triage",   run_triage_agent)
    builder.add_node("research", run_research_agent)
    builder.add_node("report",   run_report_agent)

    # ── Sequential edges ───────────────────────────────────────────────────
    builder.set_entry_point("intake")
    builder.add_edge("intake",   "triage")
    builder.add_edge("triage",   "research")
    builder.add_edge("research", "report")
    builder.add_edge("report",   END)

    return builder.compile()
