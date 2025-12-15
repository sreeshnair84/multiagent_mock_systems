"""
User Management API Endpoints
Handles user CRUD operations and role management
"""
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import List, Optional

from app.api.auth import get_current_user
from app.tools.user_management_tools import (
    get_user_roles,
    create_user as create_user_tool,
    list_users as list_users_tool,
    deactivate_user as deactivate_user_tool
)
from app.models import User
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from app.core.database import engine

router = APIRouter(prefix="/users", tags=["Users"])


class CreateUserRequest(BaseModel):
    email: str
    username: str
    password: str
    role: str = "user"


class RoleAssignmentRequest(BaseModel):
    roles: List[str]
    action: str  # "add" or "remove"

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None
    job_title: Optional[str] = None
    department: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    user_id: int # Alias for id, for backward compat if needed
    email: str
    username: str
    role: str
    status: str
    job_title: Optional[str] = None
    department: Optional[str] = None


@router.get("/{user_id}/roles")
async def get_roles(user_id: int, current_user: dict = Depends(get_current_user)):
    """Get roles for a specific user"""
    async with AsyncSession(engine) as session:
        # FIX: exec -> execute(...).scalars()
        result = await session.execute(select(User).where(User.id == user_id))
        user = result.scalars().first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {
            "user_id": user.id,
            "email": user.email,
            "roles": [user.role]
        }

@router.get("/{user_id}")
async def get_user(user_id: int, current_user: dict = Depends(get_current_user)):
    """Get a single user by ID"""
    async with AsyncSession(engine) as session:
        result = await session.execute(select(User).where(User.id == user_id))
        user = result.scalars().first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user

@router.put("/{user_id}")
async def update_user(user_id: int, user_req: UserUpdate, current_user: dict = Depends(get_current_user)):
    """Update user details"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    async with AsyncSession(engine) as session:
        result = await session.execute(select(User).where(User.id == user_id))
        user = result.scalars().first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Update fields if provided
        if user_req.username is not None:
            user.username = user_req.username
        if user_req.email is not None:
            user.email = user_req.email
        if user_req.role is not None:
            user.role = user_req.role
        if user_req.status is not None:
            user.status = user_req.status
        if user_req.job_title is not None:
            user.job_title = user_req.job_title
        if user_req.department is not None:
            user.department = user_req.department
            
        session.add(user)
        await session.commit()
        await session.refresh(user)
        
        return user


@router.post("", response_model=UserResponse)
async def create_user(request: CreateUserRequest, current_user: dict = Depends(get_current_user)):
    """Create a new user (admin only)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await create_user_tool(
        email=request.email,
        username=request.username,
        password=request.password,
        role=request.role
    )
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    # Map result to UserResponse
    # result has user_id, email...
    result["id"] = result["user_id"]
    return UserResponse(**result)


@router.patch("/{user_id}/roles")
async def assign_roles(
    user_id: int,
    request: RoleAssignmentRequest,
    current_user: dict = Depends(get_current_user)
):
    """Assign or remove roles from a user (admin only)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    async with AsyncSession(engine) as session:
        # FIX: exec -> execute(...).scalars()
        result = await session.execute(select(User).where(User.id == user_id))
        user = result.scalars().first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Simple role assignment (in production, support multiple roles)
        if request.action == "add" and request.roles:
            user.role = request.roles[0]
        
        await session.commit()
        await session.refresh(user)
        
        return {
            "user_id": user.id,
            "updated_roles": [user.role]
        }


@router.get("")
async def get_users(
    status: Optional[str] = None,
    role: Optional[str] = None,
    authorization: Optional[str] = Header(None)
):
    """List all users with optional filters
    
    Authentication is optional - if provided, validates token.
    For development, allows unauthenticated access.
    """
    # Optional auth check - validate if provided
    if authorization and authorization.startswith("Bearer "):
        try:
            from app.api.auth import get_current_user
            current_user = await get_current_user(authorization)
        except HTTPException:
            # If auth fails, still allow access for development
            pass
    
    users = await list_users_tool(status=status, role=role)
    return users
