"""
Unified Testing Harness — End-to-End Integration Tests.

Tests the full LangGraph pipeline (without Ollama — tools only).
Each student's individual test files cover their own agent in isolation;
this file validates the entire system working together.
"""

import pytest
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

# We test the tool layer directly (no Ollama needed)
from tools.parse_symptoms_tool    import parse_symptoms
from tools.symptom_severity_tool  import assess_severity
from tools.condition_lookup_tool  import lookup_conditions
from tools.generate_report_tool   import generate_report


class TestFullPipeline:
    """Simulate the agent pipeline using only tools (CI-safe, no Ollama)."""

    def _run_pipeline(self, raw_input: str) -> dict:
        """Run the four tools in sequence, mimicking the agent graph."""
        # IntakeAgent tool
        intake = parse_symptoms(raw_input)

        # TriageAgent tool
        triage = assess_severity(intake["symptoms"]) if intake["symptoms"] else {
            "urgency_level": "ROUTINE", "urgency_reason": "No symptoms", "severity_scores": {}
        }

        # ResearchAgent tool
        research = lookup_conditions(intake["symptoms"]) if intake["symptoms"] else {
            "possible_conditions": [], "disclaimer": "N/A"
        }

        # ReportAgent tool
        report = generate_report(
            patient_name        = intake["patient_name"],
            patient_age         = intake["patient_age"],
            symptoms            = intake["symptoms"],
            duration_days       = intake["duration_days"],
            urgency_level       = triage["urgency_level"],
            urgency_reason      = triage["urgency_reason"],
            severity_scores     = triage["severity_scores"],
            possible_conditions = research["possible_conditions"],
            disclaimer          = research["disclaimer"],
            intake_notes        = intake["intake_notes"],
        )

        return {**intake, **triage, **research, **report}

    def test_routine_case_end_to_end(self):
        result = self._run_pipeline(
            "I am Alice, 25. I have a runny nose and sore throat for 2 days."
        )
        assert result["urgency_level"] == "ROUTINE"
        assert Path(result["report_path"]).exists()

    def test_emergency_case_end_to_end(self):
        result = self._run_pipeline(
            "I am Bob, 55. Severe chest pain and shortness of breath for 30 minutes."
        )
        assert result["urgency_level"] == "EMERGENCY"
        assert Path(result["report_path"]).exists()

    def test_urgent_case_end_to_end(self):
        result = self._run_pipeline(
            "My name is Maria, 40 years old. I have fever, headache, and dizziness for 3 days."
        )
        assert result["urgency_level"] in {"URGENT", "EMERGENCY"}
        assert Path(result["report_path"]).exists()

    def test_state_accumulated_correctly(self):
        """All expected fields present after full pipeline."""
        result = self._run_pipeline(
            "I am John, 30. Headache, nausea, and vomiting since yesterday."
        )
        for field in ["patient_name", "symptoms", "urgency_level",
                      "possible_conditions", "report_path", "report_summary"]:
            assert field in result, f"Missing field: {field}"

    def test_report_file_content_is_coherent(self):
        result = self._run_pipeline(
            "I am Sam, 60. I have chest pain and confusion."
        )
        content = Path(result["report_path"]).read_text()
        assert "Sam" in content
        assert result["urgency_level"] in content
        assert len(content) > 200

    def test_disclaimer_always_in_report(self):
        result = self._run_pipeline("I have a cough and fatigue.")
        content = Path(result["report_path"]).read_text()
        assert "not a" in content.lower() or "disclaimer" in content.lower()

    def test_no_symptom_input_graceful(self):
        """System should not crash on vague input with no matched symptoms."""
        intake = parse_symptoms("I feel a bit off today.")
        # Should not raise even with empty symptoms list
        assert isinstance(intake["symptoms"], list)
