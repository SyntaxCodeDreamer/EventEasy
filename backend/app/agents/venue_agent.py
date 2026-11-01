from typing import Dict, Any

class VenueAgent:
    """
    Venue Agent:
    Evaluates venue capacity requirements, indoor/outdoor feasibility,
    square-footage estimation, parking slots, and backup weather provisions.
    """
    def evaluate_venue(self, guest_count: int, arrangement_type: str, location: str, event_type: str) -> Dict[str, Any]:
        # Industry metrics: 12-15 sq ft per guest for banquet/dining, plus stage & dancefloor
        min_area_sqft = guest_count * 15 + 1000 # 1000 sqft for stage/mandap
        parking_slots_needed = round(guest_count / 3.5) # approx 1 car per 3-4 guests
        
        arrangements_notes = ""
        if arrangement_type.lower() == "outdoor":
            arrangements_notes = "Outdoor arrangement requires waterproof canopy shelter, backup generator (silent DG set), and weather-contingency tenting."
        elif arrangement_type.lower() == "indoor":
            arrangements_notes = "Indoor hall requires HVAC capacity check for peak guest hours, clear emergency exits, and designated dining corridors."
        else:
            arrangements_notes = "Hybrid arrangement: Lawn for main ceremonies and rituals, air-conditioned banquet hall for dining and catering stalls."

        suggested_categories = [
            {"type": "Heritage Haveli / Open Lawn", "suitability": "Ideal for traditional Gujarati weddings and large evening receptions.", "capacity_band": f"{guest_count} to {guest_count + 150} pax"},
            {"type": "Air-Conditioned Banquet & Party Plot", "suitability": "Best for weather resilience and seamless buffet service.", "capacity_band": f"{guest_count} to {guest_count + 100} pax"},
            {"type": "Community Samaj Hall / Vadi", "suitability": "Budget-friendly option with spacious dedicated kitchen and dining facilities.", "capacity_band": f"{guest_count} to {guest_count + 200} pax"}
        ]

        return {
            "min_carpet_area_sqft": min_area_sqft,
            "estimated_parking_slots": parking_slots_needed,
            "arrangement_type": arrangement_type,
            "location_context": location,
            "suggested_venue_types": suggested_categories,
            "indoor_outdoor_considerations": arrangements_notes,
            "essential_amenities": [
                "Dedicated bridal green room with attached washroom",
                "High-power 63kVA to 125kVA generator backup",
                "Wide staging area (at least 24ft x 16ft) for Mandap / Stage",
                "Separate service access for catering logistics"
            ]
        }

venue_agent = VenueAgent()

