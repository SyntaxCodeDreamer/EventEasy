from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.schemas.all_schemas import (
    TaskCreate, TaskUpdate, TaskResponse,
    VendorCreate, VendorUpdate, VendorResponse,
    GuestCreate, GuestUpdate, GuestResponse,
    CommunityEventCreate, VolunteerCreate, DonationCreate
)
from app.database import db_manager
from app.utils.security import get_current_user_id
import uuid

router = APIRouter(tags=["Modules"])

# --- TASKS ---
@router.get("/tasks/{event_id}", response_model=List[TaskResponse])
async def get_tasks(event_id: str, user_id: str = Depends(get_current_user_id)):
    tasks = await db_manager.find("tasks", {"event_id": event_id, "user_id": user_id}, sort_field="due_date", sort_order=1)
    res = []
    for t in tasks:
        res.append({
            "id": t["_id"],
            "event_id": t["event_id"],
            "title": t["title"],
            "description": t.get("description", ""),
            "category": t.get("category", "General"),
            "due_date": t["due_date"],
            "priority": t.get("priority", "MEDIUM"),
            "status": t.get("status", "PENDING"),
            "dependencies": t.get("dependencies", []),
            "assigned_to": t.get("assigned_to", ""),
            "created_at": t.get("created_at")
        })
    return res

@router.post("/tasks", response_model=TaskResponse)
async def create_task(task: TaskCreate, user_id: str = Depends(get_current_user_id)):
    t_dict = task.dict()
    t_id = str(uuid.uuid4())
    t_dict["_id"] = t_id
    t_dict["user_id"] = user_id
    t_dict["status"] = "PENDING"
    await db_manager.insert_one("tasks", t_dict)
    return {"id": t_id, **t_dict}

@router.put("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(task_id: str, updates: TaskUpdate, user_id: str = Depends(get_current_user_id)):
    t = await db_manager.find_one("tasks", {"_id": task_id, "user_id": user_id})
    if not t:
        raise HTTPException(status_code=404, detail="Task not found.")
    clean_updates = {k: v for k, v in updates.dict().items() if v is not None}
    await db_manager.update_one("tasks", {"_id": task_id}, clean_updates)
    t.update(clean_updates)
    return {
        "id": t["_id"],
        "event_id": t["event_id"],
        "title": t["title"],
        "description": t.get("description", ""),
        "category": t.get("category", "General"),
        "due_date": t["due_date"],
        "priority": t.get("priority", "MEDIUM"),
        "status": t.get("status", "PENDING"),
        "dependencies": t.get("dependencies", []),
        "assigned_to": t.get("assigned_to", ""),
        "created_at": t.get("created_at")
    }

@router.delete("/tasks/{task_id}")
async def delete_task(task_id: str, user_id: str = Depends(get_current_user_id)):
    deleted = await db_manager.delete_one("tasks", {"_id": task_id, "user_id": user_id})
    if not deleted:
        raise HTTPException(status_code=404, detail="Task not found.")
    return {"message": "Task removed."}

# --- VENDORS ---
@router.get("/vendors/{event_id}", response_model=List[VendorResponse])
async def get_vendors(event_id: str, user_id: str = Depends(get_current_user_id)):
    vendors = await db_manager.find("vendors", {"event_id": event_id, "user_id": user_id})
    res = []
    for v in vendors:
        res.append({
            "id": v["_id"],
            "event_id": v["event_id"],
            "name": v["name"],
            "category": v["category"],
            "contact_name": v.get("contact_name", ""),
            "phone": v.get("phone", ""),
            "email": v.get("email", ""),
            "quoted_price": v.get("quoted_price", 0.0),
            "final_price": v.get("final_price", 0.0),
            "paid_amount": v.get("paid_amount", 0.0),
            "status": v.get("status", "Not Contacted"),
            "notes": v.get("notes", ""),
            "created_at": v.get("created_at")
        })
    return res

@router.post("/vendors", response_model=VendorResponse)
async def create_vendor(vendor: VendorCreate, user_id: str = Depends(get_current_user_id)):
    v_dict = vendor.dict()
    v_id = str(uuid.uuid4())
    v_dict["_id"] = v_id
    v_dict["user_id"] = user_id
    await db_manager.insert_one("vendors", v_dict)
    return {"id": v_id, **v_dict}

@router.put("/vendors/{vendor_id}", response_model=VendorResponse)
async def update_vendor(vendor_id: str, updates: VendorUpdate, user_id: str = Depends(get_current_user_id)):
    v = await db_manager.find_one("vendors", {"_id": vendor_id, "user_id": user_id})
    if not v:
        raise HTTPException(status_code=404, detail="Vendor not found.")
    clean = {k: v for k, v in updates.dict().items() if v is not None}
    await db_manager.update_one("vendors", {"_id": vendor_id}, clean)
    v.update(clean)
    return {
        "id": v["_id"],
        "event_id": v["event_id"],
        "name": v["name"],
        "category": v["category"],
        "contact_name": v.get("contact_name", ""),
        "phone": v.get("phone", ""),
        "email": v.get("email", ""),
        "quoted_price": v.get("quoted_price", 0.0),
        "final_price": v.get("final_price", 0.0),
        "paid_amount": v.get("paid_amount", 0.0),
        "status": v.get("status", "Not Contacted"),
        "notes": v.get("notes", ""),
        "created_at": v.get("created_at")
    }

@router.delete("/vendors/{vendor_id}")
async def delete_vendor(vendor_id: str, user_id: str = Depends(get_current_user_id)):
    deleted = await db_manager.delete_one("vendors", {"_id": vendor_id, "user_id": user_id})
    if not deleted:
        raise HTTPException(status_code=404, detail="Vendor not found.")
    return {"message": "Vendor deleted."}

# --- GUESTS ---
@router.get("/guests/{event_id}", response_model=List[GuestResponse])
async def get_guests(event_id: str, user_id: str = Depends(get_current_user_id)):
    guests = await db_manager.find("guests", {"event_id": event_id, "user_id": user_id})
    res = []
    for g in guests:
        res.append({
            "id": g["_id"],
            "event_id": g["event_id"],
            "name": g["name"],
            "group_tag": g.get("group_tag", "General"),
            "phone": g.get("phone", ""),
            "email": g.get("email", ""),
            "pax_count": g.get("pax_count", 1),
            "dietary_preference": g.get("dietary_preference", "Vegetarian"),
            "invitation_status": g.get("invitation_status", "Not Sent"),
            "rsvp_status": g.get("rsvp_status", "Pending"),
            "created_at": g.get("created_at")
        })
    return res

@router.post("/guests", response_model=GuestResponse)
async def create_guest(guest: GuestCreate, user_id: str = Depends(get_current_user_id)):
    g_dict = guest.dict()
    g_id = str(uuid.uuid4())
    g_dict["_id"] = g_id
    g_dict["user_id"] = user_id
    await db_manager.insert_one("guests", g_dict)
    return {"id": g_id, **g_dict}

@router.put("/guests/{guest_id}", response_model=GuestResponse)
async def update_guest(guest_id: str, updates: GuestUpdate, user_id: str = Depends(get_current_user_id)):
    g = await db_manager.find_one("guests", {"_id": guest_id, "user_id": user_id})
    if not g:
        raise HTTPException(status_code=404, detail="Guest not found.")
    clean = {k: v for k, v in updates.dict().items() if v is not None}
    await db_manager.update_one("guests", {"_id": guest_id}, clean)
    g.update(clean)
    return {
        "id": g["_id"],
        "event_id": g["event_id"],
        "name": g["name"],
        "group_tag": g.get("group_tag", "General"),
        "phone": g.get("phone", ""),
        "email": g.get("email", ""),
        "pax_count": g.get("pax_count", 1),
        "dietary_preference": g.get("dietary_preference", "Vegetarian"),
        "invitation_status": g.get("invitation_status", "Not Sent"),
        "rsvp_status": g.get("rsvp_status", "Pending"),
        "created_at": g.get("created_at")
    }

@router.delete("/guests/{guest_id}")
async def delete_guest(guest_id: str, user_id: str = Depends(get_current_user_id)):
    deleted = await db_manager.delete_one("guests", {"_id": guest_id, "user_id": user_id})
    if not deleted:
        raise HTTPException(status_code=404, detail="Guest not found.")
    return {"message": "Guest removed."}

# --- COMMUNITY EVENTS ---
@router.get("/community/{event_id}")
async def get_community_info(event_id: str, user_id: str = Depends(get_current_user_id)):
    comm = await db_manager.find_one("community_events", {"event_id": event_id})
    if not comm:
        return {
            "community_name": "Community Organizing Committee",
            "target_donation": 500000.0,
            "collected_donation": 185000.0,
            "organizer_committee": "Navratri Mahotsav Samiti",
            "volunteers": [],
            "donations": []
        }
    volunteers = await db_manager.find("volunteers", {"community_event_id": comm["_id"]})
    donations = await db_manager.find("donations", {"community_event_id": comm["_id"]})
    return {
        **comm,
        "volunteers": volunteers,
        "donations": donations
    }

@router.post("/community")
async def create_community_event(comm_in: CommunityEventCreate, user_id: str = Depends(get_current_user_id)):
    c_dict = comm_in.dict()
    c_id = str(uuid.uuid4())
    c_dict["_id"] = c_id
    c_dict["user_id"] = user_id
    c_dict["collected_donation"] = 0.0
    await db_manager.insert_one("community_events", c_dict)
    return {"id": c_id, **c_dict}

@router.post("/community/{community_event_id}/volunteers")
async def register_volunteer(community_event_id: str, vol: VolunteerCreate, user_id: str = Depends(get_current_user_id)):
    v_dict = vol.dict()
    v_id = str(uuid.uuid4())
    v_dict["_id"] = v_id
    v_dict["community_event_id"] = community_event_id
    v_dict["status"] = "Active"
    await db_manager.insert_one("volunteers", v_dict)
    return {"id": v_id, **v_dict}

@router.post("/community/{community_event_id}/donations")
async def record_donation(community_event_id: str, don: DonationCreate, user_id: str = Depends(get_current_user_id)):
    d_dict = don.dict()
    d_id = str(uuid.uuid4())
    d_dict["_id"] = d_id
    d_dict["community_event_id"] = community_event_id
    await db_manager.insert_one("donations", d_dict)
    return {"id": d_id, **d_dict}

