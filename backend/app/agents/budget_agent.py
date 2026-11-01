from typing import Dict, Any, List
from app.services.gemini_service import gemini_service

class BudgetAgent:
    """
    Budget Agent:
    Performs deterministic mathematical calculations for category allocations,
    enforces an 8-12% contingency reserve, identifies high-risk cost areas,
    and calculates per-guest metrics.
    """
    CATEGORY_RATIOS = {
        "Venue": 0.28,
        "Catering": 0.32,
        "Decoration": 0.16,
        "Photography & Video": 0.08,
        "Entertainment & Sound": 0.05,
        "Transportation & Logistics": 0.04,
        "Invitations & Gifts": 0.02,
        "Miscellaneous & Legal": 0.05
    }

    def calculate_budget(self, total_budget: float, guest_count: int, event_type: str = "Wedding") -> Dict[str, Any]:
        contingency_percentage = 0.10 # 10% safety buffer
        contingency_reserve = round(total_budget * contingency_percentage, 2)
        allocatable_amount = round(total_budget - contingency_reserve, 2)

        categories = []
        for cat, ratio in self.CATEGORY_RATIOS.items():
            amount = round(allocatable_amount * ratio, 2)
            categories.append({
                "category": cat,
                "percentage": round(ratio * 100 * (1 - contingency_percentage), 1),
                "allocated_amount": amount,
                "description": f"Target spend for {cat.lower()} based on standard industry benchmarks for {event_type}."
            })

        cost_per_guest = round(total_budget / max(guest_count, 1), 2)
        catering_per_guest = round((allocatable_amount * self.CATEGORY_RATIOS["Catering"]) / max(guest_count, 1), 2)

        return {
            "total_budget": total_budget,
            "contingency_reserve": contingency_reserve,
            "contingency_percentage": 10.0,
            "categories": categories,
            "total_planned": total_budget,
            "cost_per_guest": cost_per_guest,
            "catering_per_guest": catering_per_guest,
            "cost_saving_suggestions": [
                "Select seasonal local flowers for mandap/stage decor to save up to 25% on decoration costs.",
                "Opt for digital wedding invitations with dynamic RSVPs rather than luxury boxed printed cards.",
                "Package photography and cinematography with a single vendor to negotiate bundle pricing.",
                "Consolidate live food counters to 3 high-impact specialty stalls to minimize catering wastage."
            ],
            "expensive_categories": ["Catering", "Venue", "Decoration"]
        }

    async def optimize_for_reduction(self, current_budget: float, target_budget: float, guest_count: int) -> Dict[str, Any]:
        reduction_amount = current_budget - target_budget
        recalculated = self.calculate_budget(target_budget, guest_count)
        
        recalculated["optimization_notes"] = f"Budget revised downwards by ₹{reduction_amount:,.2f}. Contingency adjusted to ₹{recalculated['contingency_reserve']:,.2f}."
        recalculated["suggested_cuts"] = [
            {"category": "Decoration", "cut_amount": round(reduction_amount * 0.35, 2), "action": "Shift from imported exotic florals to marigolds, tuberoses, and fabric drapes."},
            {"category": "Catering", "cut_amount": round(reduction_amount * 0.30, 2), "action": "Streamline dessert options to 2 signature traditional Gujarati sweets."},
            {"category": "Venue", "cut_amount": round(reduction_amount * 0.20, 2), "action": "Negotiate weekday or afternoon timings or community hall/patel vadi options."},
            {"category": "Entertainment", "cut_amount": round(reduction_amount * 0.15, 2), "action": "Engage a local folk sangeet troupe or curated DJ set instead of celebrity artist."}
        ]
        return recalculated

budget_agent = BudgetAgent()

