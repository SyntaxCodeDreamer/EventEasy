from fastapi import APIRouter, Depends
from app.database import db_manager
from app.utils.security import get_current_user_id

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/metrics")
async def get_dashboard_metrics(user_id: str = Depends(get_current_user_id)):
    events = await db_manager.find("events", {"user_id": user_id})
    total_events = len(events)
    upcoming_events = [e for e in events if e.get("status") != "completed"]
    completed_events = [e for e in events if e.get("status") == "completed"]

    total_planned_budget = sum(float(e.get("budget", 0)) for e in events)

    # Calculate actual expenses across all user events
    all_expenses = await db_manager.find("expenses", {"user_id": user_id})
    total_actual_expenses = sum(float(ex.get("actual_cost", 0) or ex.get("paid_amount", 0)) for ex in all_expenses)
    remaining_budget = max(total_planned_budget - total_actual_expenses, 0.0)

    # Pending tasks
    all_tasks = await db_manager.find("tasks", {"user_id": user_id})
    pending_tasks = [t for t in all_tasks if t.get("status") != "COMPLETED"]
    urgent_tasks = [t for t in pending_tasks if t.get("priority") in ["CRITICAL", "HIGH"]]

    # Recent AI recommendations
    recent_recommendations = [
        "10% contingency reserve locked for outdoor weather & unexpected guest arrivals.",
        "Traditional Gujarati catering: Jain food counters pre-calibrated with 10% safety buffer.",
        "Mandap decoration: Swapping imported exotics with yellow marigold & brass diyas saves up to 25%."
    ]

    return {
        "total_events": total_events,
        "upcoming_count": len(upcoming_events),
        "completed_count": len(completed_events),
        "total_planned_budget": total_planned_budget,
        "total_actual_expenses": total_actual_expenses,
        "remaining_budget": remaining_budget,
        "pending_tasks_count": len(pending_tasks),
        "urgent_tasks_count": len(urgent_tasks),
        "recent_recommendations": recent_recommendations,
        "events": events[:5], # recent 5 events
        "urgent_tasks": urgent_tasks[:5]
    }

