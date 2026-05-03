"""
Tests for ReportAgent (Student 4).

Covers: generate_report_tool output format, file creation,
path validity, and content correctness.
"""

import pytest
from pathlib import Path
import sys
sys.path.insert(0, str(__file__).replace("/tests/test_report_agent.py", ""))

from tools.generate_report_tool import generate_report

SAMPLE_ARGS = dict(
    patient_name        = "Test Patient",
    patient_age         = 40,
    symptoms            = ["headache", "fever"],
    duration_days       = 3,
    urgency_level       = "URGENT",
    urgency_reason      = "Fever with headache warrants urgent assessment.",
    severity_scores     = {"headache": 5, "fever": 5},
    possible_conditions = [
        {"name": "Influenza", "description": "Viral illness.", "match_score": 2, "matched_symptoms": ["fever", "headache"]},
    ],
    disclaimer          = "This is not a medical diagnosis.",
    intake_notes        = "Test patient with headache and fever for 3 days.",
)


class TestGenerateReport:

    def test_returns_dict_with_required_keys(self):
        result = generate_report(**SAMPLE_ARGS)
        assert "report_path" in result
        assert "report_summary" in result

    def test_file_is_created(self):
        result = generate_report(**SAMPLE_ARGS)
        assert Path(result["report_path"]).exists()

    def test_file_is_markdown(self):
        result = generate_report(**SAMPLE_ARGS)
        assert result["report_path"].endswith(".md")

    def test_report_contains_patient_name(self):
        result = generate_report(**SAMPLE_ARGS)
        content = Path(result["report_path"]).read_text()
        assert "Test Patient" in content

    def test_report_contains_urgency_level(self):
        result = generate_report(**SAMPLE_ARGS)
        content = Path(result["report_path"]).read_text()
        assert "URGENT" in content

    def test_report_contains_disclaimer(self):
        result = generate_report(**SAMPLE_ARGS)
        content = Path(result["report_path"]).read_text()
        assert "not a medical diagnosis" in content

    def test_report_contains_condition_name(self):
        result = generate_report(**SAMPLE_ARGS)
        content = Path(result["report_path"]).read_text()
        assert "Influenza" in content

    def test_report_summary_non_empty(self):
        result = generate_report(**SAMPLE_ARGS)
        assert len(result["report_summary"]) > 0

    def test_invalid_urgency_level_raises(self):
        bad_args = {**SAMPLE_ARGS, "urgency_level": "MODERATE"}
        with pytest.raises(ValueError):
            generate_report(**bad_args)

    def test_emergency_report_has_emergency_marker(self):
        emergency_args = {**SAMPLE_ARGS, "urgency_level": "EMERGENCY", "urgency_reason": "Test"}
        result = generate_report(**emergency_args)
        content = Path(result["report_path"]).read_text()
        assert "EMERGENCY" in content

    def test_age_none_does_not_crash(self):
        no_age_args = {**SAMPLE_ARGS, "patient_age": None}
        result = generate_report(**no_age_args)
        assert Path(result["report_path"]).exists()

    def test_empty_conditions_handled(self):
        no_cond_args = {**SAMPLE_ARGS, "possible_conditions": []}
        result = generate_report(**no_cond_args)
        content = Path(result["report_path"]).read_text()
        assert "No matching conditions" in content
