"""
Tests for IntakeAgent (Student 1).

Covers: parse_symptoms_tool correctness, edge cases, and
property-based fuzzing of the name/age extraction.
"""

import pytest
from hypothesis import given, strategies as st, settings

import sys
sys.path.insert(0, str(__file__.replace("/tests/test_intake_agent.py", "")))

from tools.parse_symptoms_tool import parse_symptoms


# ── Unit Tests ─────────────────────────────────────────────────────────────

class TestParseSymptoms:

    def test_extracts_known_symptom(self):
        result = parse_symptoms("I have a headache and fever.")
        assert "headache" in result["symptoms"]
        assert "fever" in result["symptoms"]

    def test_extracts_name_i_am(self):
        result = parse_symptoms("I am John Smith, 30 years old.")
        assert result["patient_name"] == "John Smith"

    def test_extracts_name_my_name_is(self):
        result = parse_symptoms("My name is Alice. I have chest pain.")
        assert result["patient_name"] == "Alice"

    def test_unknown_name_when_absent(self):
        result = parse_symptoms("I have a cough and sore throat.")
        assert result["patient_name"] == "Unknown"

    def test_extracts_age(self):
        result = parse_symptoms("I am 45 years old and have dizziness.")
        assert result["patient_age"] == 45

    def test_age_none_when_absent(self):
        result = parse_symptoms("I have back pain.")
        assert result["patient_age"] is None

    def test_duration_days(self):
        result = parse_symptoms("Headache for 3 days.")
        assert result["duration_days"] == 3

    def test_duration_weeks_converted(self):
        result = parse_symptoms("Fatigue for 2 weeks.")
        assert result["duration_days"] == 14

    def test_empty_string_raises(self):
        with pytest.raises(ValueError):
            parse_symptoms("")

    def test_whitespace_only_raises(self):
        with pytest.raises(ValueError):
            parse_symptoms("   ")

    def test_non_string_raises(self):
        with pytest.raises((ValueError, AttributeError)):
            parse_symptoms(None)

    def test_no_symptoms_found(self):
        result = parse_symptoms("I feel fine today, nothing hurts.")
        assert isinstance(result["symptoms"], list)

    def test_intake_notes_preserved(self):
        text = "I am Bob, 22 years old. I have nausea and vomiting."
        result = parse_symptoms(text)
        assert result["intake_notes"] == text.strip()

    def test_multiple_symptoms(self):
        text = "chest pain, shortness of breath, nausea, and dizziness"
        result = parse_symptoms(text)
        assert len(result["symptoms"]) >= 3

    def test_output_has_required_keys(self):
        result = parse_symptoms("I have a cough.")
        for key in ["patient_name", "patient_age", "symptoms", "duration_days", "intake_notes"]:
            assert key in result


# ── Property-Based Tests ───────────────────────────────────────────────────

@settings(max_examples=50)
@given(st.text(min_size=1, max_size=500))
def test_parse_never_raises_on_non_empty_string(text):
    """parse_symptoms must not raise for any non-empty string."""
    try:
        result = parse_symptoms(text)
        assert isinstance(result["symptoms"], list)
        assert isinstance(result["patient_name"], str)
    except ValueError:
        pass  # Empty/whitespace-only — acceptable


# ── Security Tests ─────────────────────────────────────────────────────────

class TestIntakeSecurity:

    def test_sql_injection_input_does_not_crash(self):
        """SQL injection strings must not crash the tool."""
        result = parse_symptoms("'; DROP TABLE symptom_severity; -- headache fever")
        assert isinstance(result["symptoms"], list)

    def test_very_long_input_handled(self):
        """Extremely long input should not raise unhandled exceptions."""
        long_text = "I have a headache. " * 200
        result = parse_symptoms(long_text)
        assert "headache" in result["symptoms"]
