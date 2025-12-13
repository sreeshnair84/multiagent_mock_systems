"""
User Management Agent Tools
Handles M365 user operations, roles, and JWT token generation
Exposed via MCP server, not as LangChain tools
"""
from typing import List, Dict, Any, Optional
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from datetime import datetime, timedelta
import bcrypt
import jwt

from app.models import User, Token
from app.core.database import engine
from app.core.config import settings


# JWT secret (in production, use environment variable)
JWT_SECRET = getattr(settings, "JWT_SECRET", "your-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"


async def get_user_roles(user_email: str) -> Dict[str, Any]:
    """Fetches roles for a user by email.
    
    Args:
        user_email: User email address
    
    Returns:
        Dict with user roles and status
    """
    async with AsyncSession(engine) as session:
        result = await session.execute(select(User).where(User.email == user_email))
        user = result.scalars().first()
        
        if not user:
            return {"error": f"User {user_email} not found"}
        
        return {
            "user_id": user.id,
            "email": user.email,
            "username": user.username,
            "role": user.role,
            "status": user.status
        }


async def create_user(email: str, username: str, password: str, role: str = "user") -> Dict[str, Any]:
    """Creates a new user with hashed password.
    
    Args:
        email: User email (must be unique)
        username: Display name
        password: Plain text password (will be hashed)
        role: User role (user, admin, approver, supervisor)
    
    Returns:
        Dict with created user details
    """
    async with AsyncSession(engine) as session:
        # Check if user exists
        result = await session.execute(select(User).where(User.email == email))
        existing = result.scalars().first()
        
        if existing:
            return {"error": f"User with email {email} already exists"}
        
        # Hash password
        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        user = User(
            email=email,
            username=username,
            password_hash=hashed.decode('utf-8'),
            role=role,
            status="Pending",  # New users start as Pending
            token_expires=datetime.utcnow() + timedelta(days=7)
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
        
        return {
            "user_id": user.id,
            "email": user.email,
            "username": user.username,
            "role": user.role,
            "status": user.status,
            "created_at": user.created_at.isoformat()
        }


async def generate_token(user_email: str, password: str) -> Dict[str, Any]:
    """Issues JWT token for authenticated user.
    
    Args:
        user_email: User email
        password: User password
    
    Returns:
        Dict with JWT token and expiration
    """
    async with AsyncSession(engine) as session:
        result = await session.execute(select(User).where(User.email == user_email))
        user = result.scalars().first()
        
        if not user:
            return {"error": "Invalid credentials"}
        
        # Verify password
        if not bcrypt.checkpw(password.encode('utf-8'), user.password_hash.encode('utf-8')):
            return {"error": "Invalid credentials"}
        
        # Generate JWT
        expires_at = datetime.utcnow() + timedelta(hours=24)
        payload = {
            "user_id": user.id,
            "email": user.email,
            "role": user.role,
            "exp": expires_at
        }
        token_str = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
        
        # Save token to database
        token = Token(
            user_id=user.id,
            token=token_str,
            expires_at=expires_at
        )
        session.add(token)
        await session.commit()
        
        return {
            "token": token_str,
            "expires_at": expires_at.isoformat(),
            "user_id": user.id,
            "role": user.role
        }


async def list_users(status: Optional[str] = None, role: Optional[str] = None) -> List[Dict[str, Any]]:
    """Lists users with optional filters.
    
    Args:
        status: Filter by status (Active, Inactive, Pending)
        role: Filter by role (user, admin, approver, supervisor)
    
    Returns:
        List of user dictionaries
    """
    async with AsyncSession(engine) as session:
        query = select(User)
        
        if status:
            query = query.where(User.status == status)
        if role:
            query = query.where(User.role == role)
        
        result = await session.execute(query)
        users = result.scalars().all()
        
        return [
            {
                "user_id": u.id,
                "email": u.email,
                "username": u.username,
                "role": u.role,
                "status": u.status,
                "created_at": u.created_at.isoformat()
            }
            for u in users
        ]


async def deactivate_user(user_email: str) -> Dict[str, Any]:
    """Sets user status to Inactive.
    
    Args:
        user_email: User email to deactivate
    
    Returns:
        Dict with updated user status
    """
    async with AsyncSession(engine) as session:
        result = await session.execute(select(User).where(User.email == user_email))
        user = result.scalars().first()
        
        if not user:
            return {"error": f"User {user_email} not found"}
        
        user.status = "Inactive"
        await session.commit()
        await session.refresh(user)
        
        return {
            "user_id": user.id,
            "email": user.email,
            "status": user.status
        }
