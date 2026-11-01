from typing import Dict, Any, List
from datetime import datetime, timedelta

class TimelineAgent:
    """
    Timeline Agent:
    Computes backwards milestones from event target date (T-120, T-90, T-60, etc.)
    with priority levels and task dependencies.
    """
    def generate_schedule(self, event_date_str: str, event_type: str = "Wedding") -> List[Dict[str, Any]]:
        try:
            target_date = datetime.strptime(event_date_str, "%Y-%m-%d")
        except Exception:
            target_date = datetime.utcnow() + timedelta(days=90)

        tasks_blueprint = [
            {"days_before": 120, "title": "Finalize & Book Event Venue", "category": "Venue", "priority": "CRITICAL", "desc": "Sign contract, inspect parking, verify generator support, and pay initial security deposit."},
            {"days_before": 90, "title": "Select & Lock Master Caterer", "category": "Catering", "priority": "CRITICAL", "desc": "Finalize menu tasting, confirm separate Jain counter prep, and establish per-plate pricing."},
            {"days_before": 60, "title": "Finalize Theme & Mandap Decorator", "category": "Decoration", "priority": "HIGH", "desc": "Approve stage backdrop, entrance toran, floral choices, and light rigging plans."},
            {"days_before": 45, "title": "Send Digital & Printed Invitations", "category": "Invitations", "priority": "HIGH", "desc": "Dispatch multilingual invitations with dynamic RSVP links across WhatsApp and post."},
            {"days_before": 30, "title": "Confirm Photographer & DJ/Sound Team", "category": "Media", "priority": "HIGH", "desc": "Draft shot list for rituals and align sound permissions with local municipal guidelines."},
            {"days_before": 14, "title": "RSVP Reconciliation & Seating Layout", "category": "Logistics", "priority": "MEDIUM", "desc": "Lock final guest counts with catering supervisor to avoid food shortfall or waste."},
            {"days_before": 7, "title": "Vendor Coordination & Timeline Briefing", "category": "Operations", "priority": "CRITICAL", "desc": "Conduct joint run-through with decorator, sound engineer, and banquet manager."},
            {"days_before": 1, "title": "Final Venue Dry Run & Soundcheck", "category": "Operations", "priority": "CRITICAL", "desc": "Verify stage lighting, test generator switchover, and inspect green rooms."},
            {"days_before": 0, "title": "Event Execution & Live Coordination", "category": "Operations", "priority": "CRITICAL", "desc": "Ensure on-time ceremony schedules, guest welcome hospitality, and smooth buffet lines."}
        ]

        generated_tasks = []
        for i, item in enumerate(tasks_blueprint):
            due_date = target_date - timedelta(days=item["days_before"])
            # If calculated date is in the past, adjust to upcoming days
            if due_date < datetime.utcnow():
                due_date = datetime.utcnow() + timedelta(days=max(2 * i, 1))

            generated_tasks.append({
                "title": item["title"],
                "description": item["desc"],
                "category": item["category"],
                "due_date": due_date.strftime("%Y-%m-%d"),
                "priority": item["priority"],
                "status": "PENDING",
                "dependencies": [tasks_blueprint[i - 1]["title"]] if i > 0 else []
            })
        return generated_tasks

timeline_agent = TimelineAgent()

