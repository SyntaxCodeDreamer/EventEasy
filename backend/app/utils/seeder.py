import asyncio
import logging
import uuid
from app.database import db_manager
from app.utils.security import get_password_hash

logger = logging.getLogger(__name__)

async def seed_demo_user():
    """
    Creates the default demo account on first startup if it does not exist.
    Credentials: organizer@eventease.ai / password123
    """
    try:
        existing = await db_manager.find_one("users", {"email": "organizer@eventease.ai"})
        if existing:
            logger.info("[Seeder] Demo user already exists.")
            return

        demo_user = {
            "_id": str(uuid.uuid4()),
            "email": "organizer@eventease.ai",
            "password_hash": get_password_hash("password123"),
            "full_name": "Keval Nagaria",
            "role": "organizer"
        }
        await db_manager.insert_one("users", demo_user)
        logger.info("[Seeder] ✅ Demo user created: organizer@eventease.ai / password123")

    except Exception as e:
        logger.error(f"[Seeder] Failed to seed demo user: {e}")

async def seed_demo_event(user_id: str):
    """
    Seeds a sample Gujarati wedding event for the demo user if none exists.
    """
    try:
        existing_events = await db_manager.find("events", {"user_id": user_id})
        if existing_events:
            return

        from app.agents.orchestrator import orchestrator_agent

        demo_event = {
            "_id": str(uuid.uuid4()),
            "user_id": user_id,
            "name": "Patel Family Traditional Wedding",
            "type": "Wedding",
            "location": "Ahmedabad, Gujarat",
            "date": "2026-12-20",
            "duration_days": 2,
            "guest_count": 300,
            "budget": 1000000.0,
            "currency": "INR",
            "preferred_theme": "Traditional Gujarati Bandhani & Marigold Heritage",
            "food_preferences": "Vegetarian with Jain food options",
            "cultural_preferences": "Gujarati Traditions (Garba, Lagna Mandap, Sangeet)",
            "arrangement_type": "Outdoor",
            "additional_requirements": "Stage for Garba/Sangeet, separate Jain counter, 100kVA generator backup.",
            "status": "planning"
        }

        event_id = await db_manager.insert_one("events", demo_event)

        # Generate AI master plan
        master_plan = await orchestrator_agent.generate_master_plan(demo_event)

        # Store plan
        await db_manager.insert_one("ai_plans", {
            "event_id": event_id,
            "user_id": user_id,
            "version": 1,
            "plan_data": master_plan,
            "status": "ACTIVE"
        })

        # Store budget
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

        # Seed tasks from timeline
        for task in master_plan["timeline_schedule"]:
            task_data = task.copy()
            task_data["event_id"] = event_id
            task_data["user_id"] = user_id
            await db_manager.insert_one("tasks", task_data)

        logger.info(f"[Seeder] ✅ Demo Gujarati Wedding event seeded for user.")

    except Exception as e:
        logger.error(f"[Seeder] Failed to seed demo event: {e}")


async def run_all_seeds():
    await seed_demo_user()
    user = await db_manager.find_one("users", {"email": "organizer@eventease.ai"})
    if user:
        await seed_demo_event(user["_id"])

