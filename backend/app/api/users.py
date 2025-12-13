"""
User Management API Endpoints
Handles user CRUD operations and role management
"""
from fastapi import APIRouter, HTTPException, Depends
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


class UserResponse(BaseModel):
    user_id: int
    email: str
    username: str
    role: str
    status: str


@router.get("/{user_id}/roles")
async def get_roles(user_id: int, current_user: dict = Depends(get_current_user)):
    """Get roles for a specific user"""
    async with AsyncSession(engine) as session:
        result = await session.exec(select(User).where(User.id == user_id))
        user = result.first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {
            "user_id": user.id,
            "email": user.email,
            "roles": [user.role]
        }


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
        result = await session.exec(select(User).where(User.id == user_id))
        user = result.first()
        
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
    current_user: dict = Depends(get_current_user)
):
    """List all users with optional filters"""
    users = await list_users_tool(status=status, role=role)
    return {"users": users}
