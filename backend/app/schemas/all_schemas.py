from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- Auth Schemas ---
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    role: str = "organizer"
    created_at: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# --- Event Schemas ---
class EventCreate(BaseModel):
    name: str
    type: str # Wedding, Birthday, Anniversary, Navratri, Festival, Corporate, etc.
    location: str
    date: str # YYYY-MM-DD
    duration_days: int = 1
    guest_count: int
    budget: float
    currency: str = "INR"
    preferred_theme: Optional[str] = "Traditional Gujarati"
    food_preferences: Optional[str] = "Vegetarian with Jain options"
    cultural_preferences: Optional[str] = "Gujarati Traditional"
    arrangement_type: Optional[str] = "Outdoor" # Indoor, Outdoor, Both
    additional_requirements: Optional[str] = ""
    natural_language_prompt: Optional[str] = ""

class EventUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    location: Optional[str] = None
    date: Optional[str] = None
    duration_days: Optional[int] = None
    guest_count: Optional[int] = None
    budget: Optional[float] = None
    preferred_theme: Optional[str] = None
    food_preferences: Optional[str] = None
    cultural_preferences: Optional[str] = None
    arrangement_type: Optional[str] = None
    additional_requirements: Optional[str] = None
    status: Optional[str] = None

class EventResponse(BaseModel):
    id: str
    user_id: str
    name: str
    type: str
    location: str
    date: str
    duration_days: int
    guest_count: int
    budget: float
    currency: str
    preferred_theme: Optional[str]
    food_preferences: Optional[str]
    cultural_preferences: Optional[str]
    arrangement_type: Optional[str]
    additional_requirements: Optional[str]
    status: str = "planning"
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

# --- Budget & Expense Schemas ---
class CategoryAllocation(BaseModel):
    category: str
    percentage: float
    allocated_amount: float
    description: str

class BudgetResponse(BaseModel):
    id: str
    event_id: str
    total_budget: float
    contingency_reserve: float
    contingency_percentage: float
    categories: List[CategoryAllocation]
    total_planned: float
    total_actual: float = 0.0
    remaining_budget: float

class ExpenseCreate(BaseModel):
    event_id: str
    category: str
    title: str
    estimated_cost: float
    actual_cost: float = 0.0
    paid_amount: float = 0.0
    vendor_id: Optional[str] = None
    notes: Optional[str] = ""

class ExpenseResponse(BaseModel):
    id: str
    event_id: str
    category: str
    title: str
    estimated_cost: float
    actual_cost: float
    paid_amount: float
    vendor_id: Optional[str]
    status: str = "pending" # pending, partially_paid, paid
    notes: Optional[str]
    created_at: Optional[str]

# --- Task Schemas ---
class TaskCreate(BaseModel):
    event_id: str
    title: str
    description: Optional[str] = ""
    category: str
    due_date: str
    priority: str = "MEDIUM" # CRITICAL, HIGH, MEDIUM, LOW
    dependencies: List[str] = []
    assigned_to: Optional[str] = ""

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    due_date: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None # PENDING, IN_PROGRESS, COMPLETED, DELAYED
    dependencies: Optional[List[str]] = None
    assigned_to: Optional[str] = None

class TaskResponse(BaseModel):
    id: str
    event_id: str
    title: str
    description: Optional[str]
    category: str
    due_date: str
    priority: str
    status: str
    dependencies: List[str]
    assigned_to: Optional[str]
    created_at: Optional[str]

# --- Vendor Schemas ---
class VendorCreate(BaseModel):
    event_id: str
    name: str
    category: str
    contact_name: Optional[str] = ""
    phone: Optional[str] = ""
    email: Optional[str] = ""
    quoted_price: float = 0.0
    final_price: float = 0.0
    paid_amount: float = 0.0
    status: str = "Not Contacted" # Not contacted, Contacted, Quotation received, Negotiating, Booked, Cancelled
    notes: Optional[str] = ""

class VendorUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    contact_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    quoted_price: Optional[float] = None
    final_price: Optional[float] = None
    paid_amount: Optional[float] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class VendorResponse(BaseModel):
    id: str
    event_id: str
    name: str
    category: str
    contact_name: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    quoted_price: float
    final_price: float
    paid_amount: float
    status: str
    notes: Optional[str]
    created_at: Optional[str]

# --- Guest Schemas ---
class GuestCreate(BaseModel):
    event_id: str
    name: str
    group_tag: Optional[str] = "General" # Family, Friends, VIP, Colleague
    phone: Optional[str] = ""
    email: Optional[str] = ""
    pax_count: int = 1
    dietary_preference: Optional[str] = "Vegetarian" # Vegetarian, Jain, Vegan, Regular
    invitation_status: str = "Not Sent" # Not Sent, Sent, Delivered
    rsvp_status: str = "Pending" # Pending, Confirmed, Declined

class GuestUpdate(BaseModel):
    name: Optional[str] = None
    group_tag: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    pax_count: Optional[int] = None
    dietary_preference: Optional[str] = None
    invitation_status: Optional[str] = None
    rsvp_status: Optional[str] = None

class GuestResponse(BaseModel):
    id: str
    event_id: str
    name: str
    group_tag: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    pax_count: int
    dietary_preference: Optional[str]
    invitation_status: str
    rsvp_status: str
    created_at: Optional[str]

# --- Community Mode Schemas ---
class CommunityEventCreate(BaseModel):
    event_id: str
    community_name: str
    target_donation: float = 0.0
    organizer_committee: Optional[str] = "Executive Committee"
    announcements: Optional[List[str]] = []

class VolunteerCreate(BaseModel):
    community_event_id: str
    name: str
    phone: str
    team: str # Stage & Sound, Food & Prasadam, Crowd Management, Decoration, Logistics
    assigned_tasks: Optional[str] = ""

class DonationCreate(BaseModel):
    community_event_id: str
    donor_name: str
    amount: float
    payment_method: str = "UPI" # UPI, Cash, Bank Transfer, Cheque
    notes: Optional[str] = ""

# --- AI & Simulation Schemas ---
class PromptExtractionRequest(BaseModel):
    natural_language_prompt: str
    language: Optional[str] = "English"

class SimulationRequest(BaseModel):
    event_id: str
    new_budget: Optional[float] = None
    new_guest_count: Optional[int] = None
    new_duration_days: Optional[int] = None
    indoor_outdoor_change: Optional[str] = None
    scenario_type: Optional[str] = None # "BUDGET_CUT", "GUEST_INCREASE", "RAIN_RISK", "CATERER_ISSUE"

class ThemeGenerateRequest(BaseModel):
    event_type: str
    description: str
    cultural_vibe: Optional[str] = "Gujarati Traditional"
    color_preference: Optional[str] = "Red & Gold"

class AIChatRequest(BaseModel):
    event_id: str
    message: str
    context: Optional[Dict[str, Any]] = None

