from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.schemas.all_schemas import BudgetResponse, ExpenseCreate, ExpenseResponse
from app.database import db_manager
from app.utils.security import get_current_user_id
import uuid

router = APIRouter(tags=["Budget & Expenses"])

@router.get("/budgets/{event_id}")
async def get_budget(event_id: str, user_id: str = Depends(get_current_user_id)):
    budget = await db_manager.find_one("budgets", {"event_id": event_id, "user_id": user_id})
    if not budget:
        # Calculate from event
        event = await db_manager.find_one("events", {"_id": event_id, "user_id": user_id})
        if not event:
            raise HTTPException(status_code=404, detail="Event not found.")
        from app.agents.budget_agent import budget_agent
        calc = budget_agent.calculate_budget(event["budget"], event["guest_count"], event.get("type", "Wedding"))
        b_id = await db_manager.insert_one("budgets", {
            "event_id": event_id,
            "user_id": user_id,
            **calc
        })
        calc["id"] = b_id
        calc["event_id"] = event_id
        return calc

    # Compute actual expenses
    expenses = await db_manager.find("expenses", {"event_id": event_id})
    actual_total = sum(float(e.get("actual_cost", 0) or e.get("paid_amount", 0)) for e in expenses)
    remaining = float(budget["total_budget"]) - actual_total

    return {
        "id": budget["_id"],
        "event_id": event_id,
        "total_budget": budget["total_budget"],
        "contingency_reserve": budget["contingency_reserve"],
        "contingency_percentage": budget.get("contingency_percentage", 10.0),
        "categories": budget.get("categories", []),
        "total_planned": budget.get("total_planned", budget["total_budget"]),
        "total_actual": actual_total,
        "remaining_budget": remaining
    }

@router.post("/expenses", response_model=ExpenseResponse)
async def create_expense(expense: ExpenseCreate, user_id: str = Depends(get_current_user_id)):
    event = await db_manager.find_one("events", {"_id": expense.event_id, "user_id": user_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")

    exp_dict = expense.dict()
    exp_id = str(uuid.uuid4())
    exp_dict["_id"] = exp_id
    exp_dict["user_id"] = user_id
    exp_dict["status"] = "paid" if exp_dict["paid_amount"] >= exp_dict["actual_cost"] and exp_dict["actual_cost"] > 0 else "partially_paid" if exp_dict["paid_amount"] > 0 else "pending"

    await db_manager.insert_one("expenses", exp_dict)
    return {
        "id": exp_id,
        **exp_dict
    }

@router.get("/expenses/{event_id}", response_model=List[ExpenseResponse])
async def list_expenses(event_id: str, user_id: str = Depends(get_current_user_id)):
    expenses = await db_manager.find("expenses", {"event_id": event_id, "user_id": user_id}, sort_field="created_at", sort_order=-1)
    res = []
    for exp in expenses:
        res.append({
            "id": exp["_id"],
            "event_id": exp["event_id"],
            "category": exp["category"],
            "title": exp["title"],
            "estimated_cost": exp.get("estimated_cost", 0.0),
            "actual_cost": exp.get("actual_cost", 0.0),
            "paid_amount": exp.get("paid_amount", 0.0),
            "vendor_id": exp.get("vendor_id"),
            "status": exp.get("status", "pending"),
            "notes": exp.get("notes"),
            "created_at": exp.get("created_at")
        })
    return res

@router.delete("/expenses/{expense_id}")
async def delete_expense(expense_id: str, user_id: str = Depends(get_current_user_id)):
    deleted = await db_manager.delete_one("expenses", {"_id": expense_id, "user_id": user_id})
    if not deleted:
        raise HTTPException(status_code=404, detail="Expense not found.")
    return {"message": "Expense deleted."}

