"""
API Endpoints for Frontend Integration
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import List, Optional
from app.core.database import engine
from app.models import Ticket, Device, User, AccessRequest, Email

router = APIRouter()

# Tickets Endpoints
@router.get("/tickets")
async def get_tickets():
    """Get all tickets"""
    async with AsyncSession(engine) as session:
        result = await session.execute(select(Ticket))
        tickets = result.scalars().all()
        return tickets

@router.get("/tickets/{ticket_id}")
async def get_ticket(ticket_id: str):
    """Get ticket by ID"""
    async with AsyncSession(engine) as session:
        result = await session.execute(select(Ticket).where(Ticket.ticket_id == ticket_id))
        ticket = result.scalar_one_or_none()
        if not ticket:
            raise HTTPException(status_code=404, detail="Ticket not found")
        return ticket

# Devices Endpoints
@router.get("/devices")
async def get_devices():
    """Get all devices"""
    async with AsyncSession(engine) as session:
        result = await session.execute(select(Device))
        devices = result.scalars().all()
        return devices

@router.get("/devices/{device_id}")
async def get_device(device_id: str):
    """Get device by ID"""
    async with AsyncSession(engine) as session:
        result = await session.execute(select(Device).where(Device.device_id == device_id))
        device = result.scalar_one_or_none()
        if not device:
            raise HTTPException(status_code=404, detail="Device not found")
        return device

# Users Endpoints (already exist in app/api/users.py, but adding GET all)
@router.get("/users")
async def get_users():
    """Get all users"""
    async with AsyncSession(engine) as session:
        result = await session.execute(select(User))
        users = result.scalars().all()
        return users

# Access Requests Endpoints
@router.get("/access-requests")
async def get_access_requests():
    """Get all access requests"""
    async with AsyncSession(engine) as session:
        result = await session.execute(select(AccessRequest))
        requests = result.scalars().all()
        return requests

# Emails Endpoints
@router.get("/emails")
async def get_emails():
    """Get all emails"""
    async with AsyncSession(engine) as session:
        result = await session.execute(select(Email))
        emails = result.scalars().all()
        return emails
