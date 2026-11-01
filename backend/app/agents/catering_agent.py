from typing import Dict, Any, List

class CateringAgent:
    """
    Catering Agent:
    Calculates food volume metrics based on guest count, dietary ratios
    (Vegetarian, Jain, Vegan), catering staff ratios, menu balance,
    and waste-reduction contingency.
    """
    def plan_catering(self, guest_count: int, food_preferences: str, duration_days: int = 1) -> Dict[str, Any]:
        # Estimation metrics
        buffer_guests = round(guest_count * 1.10) # 10% contingency buffer
        waitstaff_needed = max(round(guest_count / 20), 4) # 1 waiter per 20 guests
        water_bottles_estimate = guest_count * 3 * duration_days # 3 bottles per guest per day

        is_jain_featured = "jain" in food_preferences.lower()

        sample_menu = {
            "welcome_drinks": [
                "Fresh Nimbu Paani & Mint Mojito",
                "Royal Kesar Pista Thandai",
                "Kokum Sharbat with chia seeds"
            ],
            "appetizers_live_counters": [
                "Crispy Methi Na Gota with Raw Papaya Sambharo (Separate Jain Counter)",
                "Live Dhokla & Khandvi Platter with mustard temper",
                "Wood-fired Mini Paneer Tikka Skewers",
                "Spiced Corn & Cheese Croquettes"
            ],
            "main_course_delicacies": [
                "Authentic Gujarati Dal (Sweet & Tangy) + Kadhi",
                "Gujarati Undhiyu / Surti Papdi Subzi",
                "Paneer Lababdar (Jain Variant: Paneer Makhani without onion/garlic)",
                "Puri, Rotli (Phulka with Pure Ghee) & Laccha Paratha",
                "Jeera Rice & Vegetable Dum Biryani with Cucumber Raita"
            ],
            "sweets_desserts": [
                "Warm Mohanthal with pistachio slivers",
                "Fresh Kesar Basundi / Angoor Rabdi",
                "Artisanal Kulfi Counter"
            ]
        }

        cost_per_plate_est = 850.0 if not is_jain_featured else 950.0
        total_estimated_catering = round(cost_per_plate_est * guest_count * duration_days, 2)

        return {
            "guest_count": guest_count,
            "buffered_capacity": buffer_guests,
            "recommended_waitstaff": waitstaff_needed,
            "water_bottles_liters": water_bottles_estimate,
            "food_preferences": food_preferences,
            "is_jain_friendly": is_jain_featured,
            "estimated_cost_per_plate": cost_per_plate_est,
            "total_estimated_cost": total_estimated_catering,
            "curated_menu": sample_menu,
            "catering_best_practices": [
                "Ensure dedicated separate prep vessels, ladles, and serving counters for Jain dishes.",
                "Have an on-site supervisor coordinate with the food vendor to replenish hot items dynamically.",
                "Partner with a local food recovery NGO (e.g., Robin Hood Army) to distribute surplus unserved food."
            ]
        }

catering_agent = CateringAgent()

