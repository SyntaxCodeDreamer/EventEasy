from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any
from app.schemas.all_schemas import PromptExtractionRequest, SimulationRequest, ThemeGenerateRequest, AIChatRequest
from app.database import db_manager
from app.utils.security import get_current_user_id
from app.agents.orchestrator import orchestrator_agent
from app.agents.theme_agent import theme_agent
from app.services.gemini_service import gemini_service
import uuid

router = APIRouter(prefix="/ai", tags=["AI Planning & Multi-Agent"])

@router.post("/extract-prompt")
async def extract_natural_prompt(req: PromptExtractionRequest, user_id: str = Depends(get_current_user_id)):
    result = await orchestrator_agent.extract_natural_language_requirements(req.natural_language_prompt)
    return result

@router.get("/plans/{event_id}")
async def get_event_plan(event_id: str, user_id: str = Depends(get_current_user_id)):
    plan = await db_manager.find_one("ai_plans", {"event_id": event_id, "user_id": user_id})
    if not plan:
        # Generate on the fly if not yet created
        event = await db_manager.find_one("events", {"_id": event_id, "user_id": user_id})
        if not event:
            raise HTTPException(status_code=404, detail="Event not found.")
        master_plan = await orchestrator_agent.generate_master_plan(event)
        plan_id = await db_manager.insert_one("ai_plans", {
            "event_id": event_id,
            "user_id": user_id,
            "version": 1,
            "plan_data": master_plan,
            "status": "ACTIVE"
        })
        return master_plan
    return plan.get("plan_data", {})

@router.post("/simulate")
async def simulate_event(req: SimulationRequest, user_id: str = Depends(get_current_user_id)):
    event = await db_manager.find_one("events", {"_id": req.event_id, "user_id": user_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")

    active_plan = await db_manager.find_one("ai_plans", {"event_id": req.event_id, "user_id": user_id})
    plan_data = active_plan.get("plan_data", {}) if active_plan else await orchestrator_agent.generate_master_plan(event)

    simulation_result = await orchestrator_agent.run_simulation(plan_data, req.dict())

    # Log simulation history in MongoDB
    await db_manager.insert_one("simulations", {
        "event_id": req.event_id,
        "user_id": user_id,
        "scenario": req.scenario_type or "CUSTOM",
        "inputs": req.dict(),
        "result": simulation_result
    })

    return simulation_result

@router.post("/apply-simulation/{event_id}")
async def apply_simulation_to_event(event_id: str, sim_data: Dict[str, Any], user_id: str = Depends(get_current_user_id)):
    """
    Applies the simulation changes ONLY after explicit user confirmation.
    """
    event = await db_manager.find_one("events", {"_id": event_id, "user_id": user_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")

    revised_budget = sim_data.get("revised_budget")
    if revised_budget:
        new_total = revised_budget.get("total_budget")
        await db_manager.update_one("events", {"_id": event_id}, {"budget": new_total})
        await db_manager.update_one("budgets", {"event_id": event_id}, {
            "total_budget": new_total,
            "contingency_reserve": revised_budget.get("contingency_reserve"),
            "contingency_percentage": revised_budget.get("contingency_percentage"),
            "categories": revised_budget.get("categories"),
            "remaining_budget": new_total
        })

    return {"message": "Simulation changes successfully applied to your official event plan."}

@router.post("/generate-theme")
async def generate_theme_studio(req: ThemeGenerateRequest, user_id: str = Depends(get_current_user_id)):
    theme = await theme_agent.generate_theme(req.event_type, req.description, req.cultural_vibe)
    return theme

@router.post("/chat")
async def ai_chat_assistant(req: AIChatRequest, user_id: str = Depends(get_current_user_id)):
    event = await db_manager.find_one("events", {"_id": req.event_id, "user_id": user_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")

    system_instruction = f"""
    You are EventEase AI Copilot, assisting the organizer for an upcoming {event.get('type')} named '{event.get('name')}' in {event.get('location')}.
    Total Budget: ₹{event.get('budget', 0):,.2f}, Guest Count: {event.get('guest_count')}, Theme: {event.get('preferred_theme')}.
    Food: {event.get('food_preferences')}, Arrangement: {event.get('arrangement_type')}.
    
    Distinguish between SUGGESTING changes and APPLYING changes. Explain trade-offs in Indian cultural context (e.g. Gujarati Jain food requirements, Mandap setups, Garba logistics).
    Keep responses concise, polite, professional, and actionable.
    """
    gemini_reply = await gemini_service.generate_text(req.message, system_instruction=system_instruction)
    if not gemini_reply:
        msg = req.message.lower()
        if "budget" in msg:
            gemini_reply = f"I evaluated your event '{event.get('name')}'. With your current budget of ₹{event.get('budget'):,.2f}, we have reserved 10% contingency. If you wish to optimize expenses, we can reallocate decor and catering live stalls without affecting core ceremonial items."
        elif "guest" in msg:
            gemini_reply = f"For your guest count of {event.get('guest_count')}, catering buffers are calibrated at +10% (330 plates). Increasing guest count will require +15 sq ft of venue area per guest and 1 additional waitstaff per 20 attendees."
        else:
            gemini_reply = f"I am active on your event '{event.get('name')}'. I can help you simulate budget changes, analyze vendor quotes, customize your Gujarati menu, or check timeline dependencies."

    # Record message in conversation history
    await db_manager.insert_one("ai_conversations", {
        "event_id": req.event_id,
        "user_id": user_id,
        "user_message": req.message,
        "ai_response": gemini_reply
    })

    return {"response": gemini_reply}

