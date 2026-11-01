from typing import Dict, Any, List

class RiskAgent:
    """
    Risk Management Agent:
    Evaluates risk severity, probability, impact on operations,
    and constructs actionable contingency plans.
    """
    def assess_risks(self, arrangement_type: str, guest_count: int, budget: float, duration_days: int) -> List[Dict[str, Any]]:
        risks = [
            {
                "risk_id": "RSK-01",
                "risk_name": "Inclement Weather / Sudden Rain",
                "probability": "HIGH" if arrangement_type.lower() == "outdoor" else "LOW",
                "severity": "CRITICAL" if arrangement_type.lower() == "outdoor" else "LOW",
                "impact_description": "Outdoor mandap, open lawn seating, and live food counters disrupted if unseasonal showers occur.",
                "mitigation_strategy": "Secure pre-negotiated waterproof German pagoda hangar canopy on standby with the venue; designate adjacent covered hall.",
                "trigger_condition": "Rain forecast >30% 48 hours prior to event."
            },
            {
                "risk_id": "RSK-02",
                "risk_name": "Unexpected Guest Surge (>15%)",
                "probability": "MEDIUM",
                "severity": "HIGH",
                "impact_description": f"Guest turnout exceeds {guest_count} by 50-75 attendees, stressing buffet lines and seating capacity.",
                "mitigation_strategy": "Maintain 10% catering buffer with pre-prepped base gravies; arrange 30 extra banquet chairs in reserve.",
                "trigger_condition": "RSVP confirmations exceed initial headcount 3 days before event."
            },
            {
                "risk_id": "RSK-03",
                "risk_name": "Primary Vendor / Sound Equipment Failure",
                "probability": "LOW",
                "severity": "HIGH",
                "impact_description": "Microphone distortion, sound power tripping, or DJ cancellation halts key sangeet/ritual moments.",
                "mitigation_strategy": "Require redundant audio mixer and dual wireless mic receivers; keep backup curated Spotify/Pendrive playlist.",
                "trigger_condition": "Equipment failure or vendor late arrival past T-3 hours."
            },
            {
                "risk_id": "RSK-04",
                "risk_name": "Power Outage / Grid Fluctuation",
                "probability": "MEDIUM",
                "severity": "CRITICAL",
                "impact_description": "Loss of air cooling, mandap spotlighting, and catering heating during ceremonies.",
                "mitigation_strategy": "Auto-switchover 82.5kVA Diesel Generator (DG Set) with certified technician on active standby.",
                "trigger_condition": "Grid voltage drop below 190V."
            },
            {
                "risk_id": "RSK-05",
                "risk_name": "Budget Overrun in Variable Add-ons",
                "probability": "HIGH",
                "severity": "MEDIUM",
                "impact_description": "Last-minute floral additions and extra live counters push costs past ₹10 lakh ceiling.",
                "mitigation_strategy": "Enforce strict approval for any expense exceeding budgeted category without dipping into 10% contingency.",
                "trigger_condition": "Actual committed expenses cross 85% of total budget."
            }
        ]
        return risks

risk_agent = RiskAgent()

