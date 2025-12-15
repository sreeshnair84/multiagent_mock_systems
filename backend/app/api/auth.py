"""
FastAPI Authentication Endpoints
Handles user login, token validation, and role management
"""
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional, List
import jwt
from datetime import datetime

from app.models import User
from app.tools.user_management_tools import generate_token, get_user_roles, create_user, list_users
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

# JWT secret
JWT_SECRET = getattr(settings, "JWT_SECRET", "your-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"


class LoginRequest(BaseModel):
    email: str
    password: str



class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    role: str
    job_title: Optional[str] = None
    department: Optional[str] = None

class LoginResponse(BaseModel):
    token: str
    roles: List[str]
    expires: str
    user_id: int
    user: UserResponse


class ValidateResponse(BaseModel):
    valid: bool
    user_id: Optional[int] = None
    email: Optional[str] = None
    role: Optional[str] = None


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """User authentication with JWT token generation"""
    result = await generate_token(request.email, request.password)
    
    if "error" in result:
        raise HTTPException(status_code=401, detail=result["error"])
    
    # Get user roles and details
    user_info = await get_user_roles(request.email)
    
    return LoginResponse(
        token=result["token"],
        roles=[user_info.get("role", "user")],
        expires=result["expires_at"],
        user_id=result["user_id"],
        user=UserResponse(
            id=result["user_id"],
            email=user_info.get("email"),
            username=user_info.get("username", user_info.get("email").split("@")[0]),
            role=user_info.get("role", "user"),
            job_title=user_info.get("job_title"),
            department=user_info.get("department")
        )
    )


@router.get("/validate", response_model=ValidateResponse)
async def validate_token(authorization: Optional[str] = Header(None)):
    """Validate JWT token from Authorization header"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    
    token = authorization.replace("Bearer ", "")
    
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        
        # Check expiration
        exp = datetime.fromtimestamp(payload.get("exp", 0))
        if exp < datetime.utcnow():
            raise HTTPException(status_code=401, detail="Token expired")
        
        return ValidateResponse(
            valid=True,
            user_id=payload.get("user_id"),
            email=payload.get("email"),
            role=payload.get("role")
        )
    
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    """Dependency to get current authenticated user"""
    validation = await validate_token(authorization)
    if not validation.valid:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {
        "user_id": validation.user_id,
        "email": validation.email,
        "role": validation.role
    }
