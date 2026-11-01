from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from app.schemas.all_schemas import EventCreate, EventUpdate, EventResponse
from app.database import db_manager
from app.utils.security import get_current_user_id
from app.agents.orchestrator import orchestrator_agent
import uuid

router = APIRouter(prefix="/events", tags=["Events"])

@router.post("", response_model=EventResponse)
async def create_event(event_in: EventCreate, user_id: str = Depends(get_current_user_id)):
    event_dict = event_in.dict()
    event_id = str(uuid.uuid4())
    event_dict["_id"] = event_id
    event_dict["user_id"] = user_id
    event_dict["status"] = "planning"

    await db_manager.insert_one("events", event_dict)

    # Immediately generate initial multi-agent plan and budget
    master_plan = await orchestrator_agent.generate_master_plan(event_dict)
    
    # Store AI Plan
    await db_manager.insert_one("ai_plans", {
        "event_id": event_id,
        "user_id": user_id,
        "version": 1,
        "plan_data": master_plan,
        "status": "ACTIVE"
    })

    # Store initial budget
    budget_breakdown = master_plan["budget_breakdown"]
    await db_manager.insert_one("budgets", {
        "event_id": event_id,
        "user_id": user_id,
        "total_budget": budget_breakdown["total_budget"],
        "contingency_reserve": budget_breakdown["contingency_reserve"],
        "contingency_percentage": budget_breakdown["contingency_percentage"],
        "categories": budget_breakdown["categories"],
        "total_planned": budget_breakdown["total_planned"],
        "total_actual": 0.0,
        "remaining_budget": budget_breakdown["total_budget"]
    })

    # Seed initial timeline tasks
    for task in master_plan["timeline_schedule"]:
        task_data = task.copy()
        task_data["event_id"] = event_id
        task_data["user_id"] = user_id
        await db_manager.insert_one("tasks", task_data)

    return {
        "id": event_id,
        **event_dict
    }

@router.get("", response_model=List[EventResponse])
async def list_events(user_id: str = Depends(get_current_user_id)):
    events = await db_manager.find("events", {"user_id": user_id}, sort_field="created_at", sort_order=-1)
    res = []
    for ev in events:
        res.append({
            "id": ev["_id"],
            "user_id": ev["user_id"],
            "name": ev["name"],
            "type": ev["type"],
            "location": ev["location"],
            "date": ev["date"],
            "duration_days": ev.get("duration_days", 1),
            "guest_count": ev["guest_count"],
            "budget": ev["budget"],
            "currency": ev.get("currency", "INR"),
            "preferred_theme": ev.get("preferred_theme"),
            "food_preferences": ev.get("food_preferences"),
            "cultural_preferences": ev.get("cultural_preferences"),
            "arrangement_type": ev.get("arrangement_type"),
            "additional_requirements": ev.get("additional_requirements"),
            "status": ev.get("status", "planning"),
            "created_at": ev.get("created_at"),
            "updated_at": ev.get("updated_at")
        })
    return res

@router.get("/{event_id}", response_model=EventResponse)
async def get_event(event_id: str, user_id: str = Depends(get_current_user_id)):
    event = await db_manager.find_one("events", {"_id": event_id, "user_id": user_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")
    return {
        "id": event["_id"],
        "user_id": event["user_id"],
        "name": event["name"],
        "type": event["type"],
        "location": event["location"],
        "date": event["date"],
        "duration_days": event.get("duration_days", 1),
        "guest_count": event["guest_count"],
        "budget": event["budget"],
        "currency": event.get("currency", "INR"),
        "preferred_theme": event.get("preferred_theme"),
        "food_preferences": event.get("food_preferences"),
        "cultural_preferences": event.get("cultural_preferences"),
        "arrangement_type": event.get("arrangement_type"),
        "additional_requirements": event.get("additional_requirements"),
        "status": event.get("status", "planning"),
        "created_at": event.get("created_at"),
        "updated_at": event.get("updated_at")
    }

@router.put("/{event_id}", response_model=EventResponse)
async def update_event(event_id: str, updates: EventUpdate, user_id: str = Depends(get_current_user_id)):
    event = await db_manager.find_one("events", {"_id": event_id, "user_id": user_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")

    clean_updates = {k: v for k, v in updates.dict().items() if v is not None}
    if clean_updates:
        await db_manager.update_one("events", {"_id": event_id}, clean_updates)
        event.update(clean_updates)

    return {
        "id": event["_id"],
        "user_id": event["user_id"],
        "name": event["name"],
        "type": event["type"],
        "location": event["location"],
        "date": event["date"],
        "duration_days": event.get("duration_days", 1),
        "guest_count": event["guest_count"],
        "budget": event["budget"],
        "currency": event.get("currency", "INR"),
        "preferred_theme": event.get("preferred_theme"),
        "food_preferences": event.get("food_preferences"),
        "cultural_preferences": event.get("cultural_preferences"),
        "arrangement_type": event.get("arrangement_type"),
        "additional_requirements": event.get("additional_requirements"),
        "status": event.get("status", "planning"),
        "created_at": event.get("created_at"),
        "updated_at": event.get("updated_at")
    }

@router.delete("/{event_id}")
async def delete_event(event_id: str, user_id: str = Depends(get_current_user_id)):
    deleted = await db_manager.delete_one("events", {"_id": event_id, "user_id": user_id})
    if not deleted:
        raise HTTPException(status_code=404, detail="Event not found.")
    return {"message": "Event deleted successfully."}

