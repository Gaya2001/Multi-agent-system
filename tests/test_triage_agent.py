"""
Tests for TriageAgent (Student 2).

Covers: symptom_severity_tool correctness, urgency escalation logic,
and the safety invariant that EMERGENCY never gets downgraded.
"""

import pytest
import sys
sys.path.insert(0, str(__file__).replace("/tests/test_triage_agent.py", ""))

from tools.symptom_severity_tool import assess_severity, URGENCY_RANK


class TestAssessSeverity:

    def test_emergency_symptom_triggers_emergency(self):
        result = assess_severity(["chest pain"])
        assert result["urgency_level"] == "EMERGENCY"

    def test_routine_symptoms_stay_routine(self):
        result = assess_severity(["runny nose", "sore throat"])
        assert result["urgency_level"] == "ROUTINE"

    def test_mixed_escalates_to_highest(self):
        result = assess_severity(["fatigue", "chest pain", "runny nose"])
        assert result["urgency_level"] == "EMERGENCY"

    def test_severity_scores_returned(self):
        result = assess_severity(["fever", "headache"])
        assert "fever" in result["severity_scores"]
        assert "headache" in result["severity_scores"]

    def test_all_scores_in_valid_range(self):
        result = assess_severity(["fever", "chest pain", "dizziness", "cough"])
        for sym, score in result["severity_scores"].items():
            assert 1 <= score <= 10, f"{sym} score {score} out of range"

    def test_unknown_symptom_gets_default_score(self):
        result = assess_severity(["purple_fever_xyz"])
        assert result["severity_scores"]["purple_fever_xyz"] == 3
        assert "purple_fever_xyz" in result["unknown_symptoms"]

    def test_empty_list_raises(self):
        with pytest.raises(ValueError):
            assess_severity([])

    def test_non_list_raises(self):
        with pytest.raises((ValueError, AttributeError)):
            assess_severity("chest pain")

    def test_urgency_reason_non_empty(self):
        result = assess_severity(["headache"])
        assert len(result["urgency_reason"]) > 0

    def test_seizure_is_emergency(self):
        result = assess_severity(["seizure"])
        assert result["urgency_level"] == "EMERGENCY"

    def test_urgency_rank_ordering(self):
        assert URGENCY_RANK["ROUTINE"] < URGENCY_RANK["URGENT"] < URGENCY_RANK["EMERGENCY"]


class TestTriageSafetyInvariants:
    """Safety invariant: EMERGENCY must never be downgraded."""

    def test_adding_routine_symptoms_cannot_lower_emergency(self):
        emergency_result = assess_severity(["chest pain"])
        combined_result  = assess_severity(["chest pain", "runny nose", "sore throat"])
        assert combined_result["urgency_level"] == "EMERGENCY"

    def test_all_emergency_symptoms_trigger_emergency(self):
        """Every symptom flagged EMERGENCY in DB must produce EMERGENCY result."""
        emergency_symptoms = [
            "chest pain", "loss of consciousness", "seizure",
            "difficulty breathing", "confusion",
        ]
        for sym in emergency_symptoms:
            result = assess_severity([sym])
            assert result["urgency_level"] == "EMERGENCY", (
                f"Expected EMERGENCY for '{sym}', got {result['urgency_level']}"
            )
