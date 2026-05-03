"""
Tests for ResearchAgent (Student 3).

Covers: condition_lookup_tool matching logic, ranking, edge cases,
and disclaimer presence.
"""

import pytest
import sys
sys.path.insert(0, str(__file__).replace("/tests/test_research_agent.py", ""))

from tools.condition_lookup_tool import lookup_conditions, DISCLAIMER


class TestLookupConditions:

    def test_returns_dict_with_required_keys(self):
        result = lookup_conditions(["fever", "cough"])
        assert "possible_conditions" in result
        assert "disclaimer" in result
        assert "source" in result

    def test_conditions_list_is_list(self):
        result = lookup_conditions(["fever"])
        assert isinstance(result["possible_conditions"], list)

    def test_disclaimer_always_present(self):
        result = lookup_conditions(["runny nose"])
        assert len(result["disclaimer"]) > 0
        assert "not a medical diagnosis" in result["disclaimer"].lower() or \
               "not a diagnosis" in result["disclaimer"].lower()

    def test_high_overlap_ranks_first(self):
        """Conditions matching more symptoms should rank higher."""
        result = lookup_conditions(["chest pain", "shortness of breath", "nausea", "sweating"])
        conditions = result["possible_conditions"]
        assert len(conditions) >= 1
        # Myocardial Infarction matches all 4 — should be top
        assert conditions[0]["name"] == "Myocardial Infarction"

    def test_match_score_matches_count(self):
        result = lookup_conditions(["fever", "cough", "fatigue"])
        for cond in result["possible_conditions"]:
            assert cond["match_score"] == len(cond["matched_symptoms"])

    def test_max_results_respected(self):
        result = lookup_conditions(
            ["fever", "cough", "headache", "fatigue", "nausea"], max_results=2
        )
        assert len(result["possible_conditions"]) <= 2

    def test_empty_symptoms_raises(self):
        with pytest.raises(ValueError):
            lookup_conditions([])

    def test_max_results_zero_raises(self):
        with pytest.raises(ValueError):
            lookup_conditions(["fever"], max_results=0)

    def test_no_match_returns_empty_list(self):
        result = lookup_conditions(["xyz_unknown_symptom_abc"])
        assert result["possible_conditions"] == []

    def test_matched_symptoms_is_subset_of_input(self):
        symptoms = ["fever", "cough", "purple_xyz"]
        result = lookup_conditions(symptoms)
        input_set = {s.lower() for s in symptoms}
        for cond in result["possible_conditions"]:
            for ms in cond["matched_symptoms"]:
                assert ms in input_set

    def test_disclaimer_text_equals_constant(self):
        result = lookup_conditions(["fever"])
        assert result["disclaimer"] == DISCLAIMER

    def test_influenza_detected_from_classic_symptoms(self):
        result = lookup_conditions(["fever", "headache", "muscle pain", "fatigue", "cough"])
        names = [c["name"] for c in result["possible_conditions"]]
        assert "Influenza" in names

    def test_stroke_detected_from_neuro_symptoms(self):
        result = lookup_conditions(["numbness", "confusion", "weakness", "blurred vision"])
        names = [c["name"] for c in result["possible_conditions"]]
        assert "Stroke" in names
