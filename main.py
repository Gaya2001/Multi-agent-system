"""
Entry point for the Medical Triage MAS.

Usage:
    python main.py
    python main.py --input "I am John, 45, chest pain and shortness of breath for 2 hours"
"""

import argparse
import json
from graph import build_graph
from state import PatientState


DEMO_INPUTS = [
    "I am Sarah, 28 years old. I have had a runny nose, sore throat and mild fatigue for 3 days.",
    "My name is John. I am 52. I have severe chest pain and shortness of breath. Started 1 hour ago.",
    "Hi, I'm Maria, 34. I've been having headache, nausea and blurred vision since yesterday.",
]


def run(patient_input: str) -> PatientState:
    """Run the full triage pipeline for one patient input."""
    graph = build_graph()
    initial_state: PatientState = {
        "raw_input": patient_input,
        "trace": [],
    }
    result = graph.invoke(initial_state)
    return result


def main() -> None:
    parser = argparse.ArgumentParser(description="Medical Triage MAS")
    parser.add_argument(
        "--input", "-i",
        type=str,
        default=None,
        help="Patient symptom description (uses demo input if omitted)",
    )
    args = parser.parse_args()

    patient_input = args.input or DEMO_INPUTS[1]  # Default: emergency case

    print("\n" + "="*60)
    print("  MEDICAL TRIAGE MULTI-AGENT SYSTEM")
    print("="*60)
    print(f"\nPatient input:\n  {patient_input}\n")

    result = run(patient_input)

    print(f"Urgency:  {result.get('urgency_level')}")
    print(f"Reason:   {result.get('urgency_reason')}")
    print(f"Symptoms: {', '.join(result.get('symptoms', []))}")
    print(f"\nTop conditions:")
    for c in result.get("possible_conditions", [])[:3]:
        print(f"  • {c['name']} (score: {c['match_score']})")
    print(f"\nReport:   {result.get('report_path')}")
    print(f"\n{result.get('disclaimer', '')}")
    print("="*60 + "\n")


if __name__ == "__main__":
    main()
