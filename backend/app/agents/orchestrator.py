from typing import Dict, Any, List
import json
from app.agents.budget_agent import budget_agent
from app.agents.venue_agent import venue_agent
from app.agents.theme_agent import theme_agent
from app.agents.catering_agent import catering_agent
from app.agents.timeline_agent import timeline_agent
from app.agents.risk_agent import risk_agent
from app.services.gemini_service import gemini_service

class OrchestratorAgent:
    """
    Central AI Orchestrator:
    Coordinates all specialized agents, aggregates plans,
    resolves inconsistencies, extracts natural language requirements,
    and powers what-if simulations.
    """
    async def extract_natural_language_requirements(self, text: str) -> Dict[str, Any]:
        prompt = f"""
        Extract structured event details from this natural language prompt:
        "{text}"

        Return a valid JSON object matching these exact keys:
        - name (string)
        - type (string e.g. Wedding, Birthday, Anniversary, Navratri, Festival, Corporate)
        - location (string)
        - duration_days (integer)
        - guest_count (integer)
        - budget (float in INR)
        - preferred_theme (string)
        - food_preferences (string)
        - cultural_preferences (string)
        - arrangement_type (string: 'Outdoor', 'Indoor', or 'Both')
        - additional_requirements (string)
        """
        gemini_res = await gemini_service.generate_json(prompt, system_instruction="You are an expert event data parser. Output valid JSON only.")
        if gemini_res and "type" in gemini_res:
            return gemini_res

        # Heuristic fallback parser
        lower = text.lower()
        event_type = "Wedding" if "wedding" in lower or "shaadi" in lower or "vivah" in lower else "Community Event" if "navratri" in lower or "festival" in lower else "Birthday"
        location = "Ahmedabad, Gujarat" if "ahmedabad" in lower else "Mumbai" if "mumbai" in lower else "India"
        budget = 1000000.0 if ("10 lakh" in lower or "10lakh" in lower or "10,00,000" in lower) else 800000.0 if "8 lakh" in lower else 500000.0
        guest_count = 300 if "300" in lower else 200 if "200" in lower else 150
        duration_days = 2 if ("two days" in lower or "2 days" in lower or "2 day" in lower) else 1

        return {
            "name": f"Traditional {event_type} Celebration",
            "type": event_type,
            "location": location,
            "duration_days": duration_days,
            "guest_count": guest_count,
            "budget": budget,
            "preferred_theme": "Traditional Gujarati Heritage",
            "food_preferences": "Authentic Vegetarian with Jain food options",
            "cultural_preferences": "Gujarati Cultural Customs (Garba, Mandap, Lagna Geet)",
            "arrangement_type": "Outdoor" if "outdoor" in lower else "Indoor",
            "additional_requirements": text
        }

    async def generate_master_plan(self, event_data: Dict[str, Any]) -> Dict[str, Any]:
        budget = float(event_data.get("budget", 1000000.0))
        guest_count = int(event_data.get("guest_count", 300))
        event_type = event_data.get("type", "Wedding")
        arrangement_type = event_data.get("arrangement_type", "Outdoor")
        location = event_data.get("location", "Ahmedabad, Gujarat")
        food_preferences = event_data.get("food_preferences", "Vegetarian with Jain options")
        preferred_theme = event_data.get("preferred_theme", "Traditional Gujarati")
        cultural_pref = event_data.get("cultural_preferences", "Gujarati Traditional")
        duration_days = int(event_data.get("duration_days", 2))
        event_date = event_data.get("date", "2026-12-20")

        # 1. Budget Agent (Deterministic)
        budget_plan = budget_agent.calculate_budget(budget, guest_count, event_type)

        # 2. Venue Agent
        venue_plan = venue_agent.evaluate_venue(guest_count, arrangement_type, location, event_type)

        # 3. Theme Agent (Gemini + Cultural Presets)
        theme_plan = await theme_agent.generate_theme(event_type, preferred_theme, cultural_pref)

        # 4. Catering Agent
        catering_plan = catering_agent.plan_catering(guest_count, food_preferences, duration_days)

        # 5. Timeline Agent
        timeline_plan = timeline_agent.generate_schedule(event_date, event_type)

        # 6. Risk Management Agent
        risk_plan = risk_agent.assess_risks(arrangement_type, guest_count, budget, duration_days)

        # Executive Orchestrator Summary
        orchestrator_summary = (
            f"Master AI Plan formulated for {event_data.get('name', 'Event')} in {location}. "
            f"Balanced across {guest_count} guests with an optimal per-guest spend of ₹{budget_plan['cost_per_guest']:,.2f}. "
            f"Dedicated {budget_plan['contingency_percentage']}% contingency (₹{budget_plan['contingency_reserve']:,.2f}) maintained "
            f"for weather mitigation and logistical buffers."
        )

        return {
            "summary": orchestrator_summary,
            "budget_breakdown": budget_plan,
            "venue_requirements": venue_plan,
            "theme_concepts": theme_plan,
            "catering_specifications": catering_plan,
            "timeline_schedule": timeline_plan,
            "risk_assessment": risk_plan,
            "status": "GENERATED"
        }

    async def run_simulation(self, current_plan: Dict[str, Any], sim_request: Dict[str, Any]) -> Dict[str, Any]:
        """
        What-If Simulator Workflow:
        1. Receive modified parameters
        2. Compare with existing plan
        3. Identify affected agents
        4. Recalculate using deterministic backend logic
        5. Formulate recommendations without overwriting saved state
        """
        current_budget = current_plan.get("budget_breakdown", {}).get("total_budget", 1000000.0)
        current_guests = current_plan.get("catering_specifications", {}).get("guest_count", 300)

        target_budget = float(sim_request.get("new_budget")) if sim_request.get("new_budget") is not None else current_budget
        target_guests = int(sim_request.get("new_guest_count")) if sim_request.get("new_guest_count") is not None else current_guests
        scenario_type = sim_request.get("scenario_type", "CUSTOM")

        budget_delta = target_budget - current_budget
        guest_delta = target_guests - current_guests

        # Trigger Budget Optimization
        revised_budget = budget_agent.calculate_budget(target_budget, target_guests)
        revised_catering = catering_agent.plan_catering(target_guests, "Vegetarian with Jain options")

        impact_points = []
        new_risks = []
        recommended_actions = []

        if budget_delta < 0:
            reduction = abs(budget_delta)
            impact_points.append(f"Budget reduced by ₹{reduction:,.2f} ({round(reduction / current_budget * 100, 1)}% reduction).")
            impact_points.append(f"Contingency buffer scaled from ₹{current_plan.get('budget_breakdown', {}).get('contingency_reserve', 100000):,.2f} to ₹{revised_budget['contingency_reserve']:,.2f}.")
            recommended_actions.append("Reallocate ₹35,000 from exotic stage orchids to seasonal marigolds & fabric drape canopies.")
            recommended_actions.append("Trim dessert varieties from 4 items to 2 signature traditional Gujarati items (Mohanthal & Rabdi).")
            recommended_actions.append("Switch from hard-copy embossed boxed cards to interactive digital gold-foil WhatsApp invites.")

        if guest_delta > 0:
            impact_points.append(f"Guest count increased by +{guest_delta} attendees (Total: {target_guests} guests).")
            impact_points.append(f"Additional catering buffer required: +{round(guest_delta * 1.1)} buffet plates.")
            new_risks.append({
                "risk_name": "Seating & Buffet Congestion",
                "severity": "HIGH",
                "mitigation": "Add 2 twin-sided live buffet stations to prevent dining queue bottlenecks."
            })
            recommended_actions.append(f"Increase venue carpet area allocation by +{guest_delta * 15} sq ft.")

        if scenario_type == "RAIN_RISK" or sim_request.get("indoor_outdoor_change") == "Rain Contingency":
            impact_points.append("Outdoor weather alert triggered: Rain probability elevated to 65%.")
            new_risks.append({
                "risk_name": "Open Lawn Flooding & Slippery Ground",
                "severity": "CRITICAL",
                "mitigation": "Erect waterproof German Pagoda Canopy over mandap; install wooden carpeted sub-flooring."
            })
            recommended_actions.append("Activate adjacent covered dining hall at the Ahmedabad venue immediately.")
            recommended_actions.append("Deploy 2 standby heavy-duty silent generators with waterproof encasings.")

        return {
            "simulation_id": f"SIM-{int(target_budget)}-{target_guests}",
            "scenario": scenario_type,
            "budget_delta": budget_delta,
            "guest_delta": guest_delta,
            "impact_points": impact_points,
            "revised_budget": revised_budget,
            "revised_catering_per_guest": revised_catering["estimated_cost_per_plate"],
            "new_risks": new_risks,
            "recommended_actions": recommended_actions,
            "requires_user_approval": True,
            "message": "Simulation computed successfully. Review the trade-offs before choosing to apply this plan to your event."
        }

orchestrator_agent = OrchestratorAgent()

