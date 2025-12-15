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

# Access Requests Endpoints
@router.get("/access-requests")
async def get_access_requests():
    """Get all access requests"""
    async with AsyncSession(engine) as session:
        result = await session.execute(select(AccessRequest))
        requests = result.scalars().all()
        return requests

@router.post("/access-requests")
async def create_access_request(request: AccessRequest):
    """Create a new access request"""
    async with AsyncSession(engine) as session:
        # Generate request_id if not provided
        if not request.request_id:
            # Get count for ID generation
            result = await session.execute(select(AccessRequest))
            count = len(result.scalars().all())
            from datetime import datetime
            request.request_id = f"REQ-{datetime.now().year}-{count + 1:03d}"
        
        session.add(request)
        await session.commit()
        await session.refresh(request)
        return request

# Emails Endpoints
from sqlmodel import select, or_
from app.api.auth import get_current_user

# ... imports ...

@router.get("/emails")
async def get_emails(user: dict = Depends(get_current_user)):
    """Get emails visible to the current user"""
    async with AsyncSession(engine) as session:
        # Filter: Sender OR Recipient OR CC/BCC
        stmt = select(Email).where(
            or_(
                Email.sender == user["email"],
                Email.recipient == user["email"],
                (Email.cc_recipients != None) & (Email.cc_recipients.contains(user["email"])),
                (Email.bcc_recipients != None) & (Email.bcc_recipients.contains(user["email"]))
            )
        )
        
        # If Admin, maybe allow all? 
        # Uncomment below to allow admin to see all
        # if user["role"] == "admin":
        #    stmt = select(Email)
        
        result = await session.execute(stmt)
        emails = result.scalars().all()
        return emails

@router.post("/emails/{email_id}/mark-read")
async def mark_email_read(email_id: int):
    """Mark an email as read"""
    async with AsyncSession(engine) as session:
        email = await session.get(Email, email_id)
        if not email:
            raise HTTPException(status_code=404, detail="Email not found")
        
        email.status = "Read"
        session.add(email)
        await session.commit()
        await session.refresh(email)
        return {"status": "success", "email_id": email_id, "is_read": True}

# Resource Management Endpoints
@router.get("/resources/vms")
async def get_vms():
    """Get all virtual machines"""
    # Mock data - in future fetch from Azure/DB
    return [
        {
            "name": "web-server-01",
            "resource_group": "default-rg",
            "location": "eastus",
            "size": "Standard_D2s_v3",
            "provisioning_state": "Succeeded",
            "power_state": "VM running",
            "public_ip": "20.40.60.80"
        },
        {
            "name": "db-server-01",
            "resource_group": "data-rg",
            "location": "westus",
            "size": "Standard_E4s_v3",
            "provisioning_state": "Succeeded",
            "power_state": "VM running",
            "public_ip": "10.0.0.4"
        }
    ]

@router.get("/resources/apps")
async def get_apps():
    """Get all app services"""
    return [
        {
            "name": "api-gateway",
            "resource_group": "default-rg",
            "location": "eastus",
            "plan": "S1",
            "default_host_name": "api-gateway.azurewebsites.net",
            "state": "Running"
        },
        {
            "name": "frontend-app",
            "resource_group": "default-rg",
            "location": "eastus",
            "plan": "P1v2",
            "default_host_name": "antigravity.azurewebsites.net",
            "state": "Running"
        }
    ]

@router.get("/resources/rgs")
async def get_resource_groups():
    """Get all resource groups"""
    return [
        {
            "name": "default-rg",
            "location": "eastus",
            "provisioning_state": "Succeeded"
        },
        {
            "name": "data-rg",
            "location": "westus",
            "provisioning_state": "Succeeded"
        }
    ]

@router.get("/resources/service-accounts")
async def get_service_accounts():
    """Get all service accounts"""
    return [
        {
            "name": "app-identity",
            "resource_group": "default-rg",
            "type": "ManagedIdentity",
            "client_id": "d123-456-789"
        },
        {
            "name": "automation-sa",
            "resource_group": "ops-rg",
            "type": "ServicePrincipal",
            "client_id": "a987-654-321"
        }
    ]
