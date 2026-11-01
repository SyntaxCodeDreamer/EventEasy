from fastapi import APIRouter, HTTPException, Depends, status
from app.schemas.all_schemas import UserRegister, UserLogin, UserResponse, TokenResponse
from app.database import db_manager
from app.utils.security import verify_password, get_password_hash, create_access_token, get_current_user_id
import uuid

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserRegister):
    existing = await db_manager.find_one("users", {"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists.")

    new_user = {
        "_id": str(uuid.uuid4()),
        "email": user_data.email,
        "password_hash": get_password_hash(user_data.password),
        "full_name": user_data.full_name,
        "role": "organizer"
    }
    user_id = await db_manager.insert_one("users", new_user)
    
    token = create_access_token(data={"sub": user_id, "email": user_data.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "email": user_data.email,
            "full_name": user_data.full_name,
            "role": "organizer"
        }
    }

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db_manager.find_one("users", {"email": credentials.email})
    if not user or not verify_password(credentials.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = create_access_token(data={"sub": user["_id"], "email": user["email"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["_id"],
            "email": user["email"],
            "full_name": user.get("full_name", "User"),
            "role": user.get("role", "organizer")
        }
    }

@router.get("/me", response_model=UserResponse)
async def get_me(user_id: str = Depends(get_current_user_id)):
    user = await db_manager.find_one("users", {"_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return {
        "id": user["_id"],
        "email": user["email"],
        "full_name": user.get("full_name", ""),
        "role": user.get("role", "organizer"),
        "created_at": user.get("created_at")
    }

