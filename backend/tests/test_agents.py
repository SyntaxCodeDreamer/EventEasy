import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.agents.budget_agent import budget_agent
from app.agents.venue_agent import venue_agent
from app.agents.catering_agent import catering_agent
from app.agents.timeline_agent import timeline_agent
from app.agents.risk_agent import risk_agent

client = TestClient(app)

def test_health_check():
    """Verify backend root health check and status."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "EventEase AI" in data["project"]

def test_deterministic_budget_agent():
    """Verify budget agent guarantees exact 100% distribution and 10% contingency."""
    total_budget = 1000000.0
    guests = 300
    calc = budget_agent.calculate_budget(total_budget, guests, "Wedding")
    
    assert calc["total_budget"] == total_budget
    assert calc["contingency_reserve"] == 100000.0  # Exactly 10%
    assert calc["cost_per_guest"] == round(1000000.0 / 300, 2)
    
    # Check sum of categories + contingency == total_budget (within rounding precision)
    allocated_sum = sum(c["allocated_amount"] for c in calc["categories"])
    assert round(allocated_sum + calc["contingency_reserve"]) == round(total_budget)

def test_venue_agent_calculations():
    """Verify venue agent calculates sq ft requirements accurately."""
    venue_info = venue_agent.evaluate_venue(300, "Outdoor", "Ahmedabad", "Wedding")
    assert venue_info["min_carpet_area_sqft"] == 300 * 15 + 1000
    assert venue_info["estimated_parking_slots"] > 50
    assert "Outdoor" in venue_info["arrangement_type"]

def test_catering_agent_metrics():
    """Verify catering agent provisions 10% buffer and Jain options."""
    catering = catering_agent.plan_catering(300, "Vegetarian with Jain options", 2)
    assert catering["buffered_capacity"] == 330
    assert catering["is_jain_friendly"] is True
    assert catering["total_estimated_cost"] > 0

def test_risk_agent_evaluation():
    """Verify risk agent identifies outdoor vulnerabilities."""
    risks = risk_agent.assess_risks("Outdoor", 300, 1000000.0, 2)
    assert len(risks) >= 5
    weather_risk = next((r for r in risks if "Rain" in r["risk_name"]), None)
    assert weather_risk is not None
    assert weather_risk["severity"] == "CRITICAL"

