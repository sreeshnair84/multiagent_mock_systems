"""
Intune Agent Tools
Handles device provisioning, profile management, and device operations
Exposed via MCP server, not as LangChain tools
"""
from typing import List, Dict, Any, Optional
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from datetime import datetime

from app.models import Device
from app.core.database import engine


async def provision_device(serial_number: str, user_email: str, profile_name: str = "Standard", os_version: str = "Unknown") -> Dict[str, Any]:
    """Enrolls a device with profile assignment.
    
    Args:
        serial_number: Device serial number
        user_email: User email to assign device to
        profile_name: Profile to assign (Standard, Mobile, etc.)
        os_version: Operating system version
    
    Returns:
        Dict with device enrollment details
    """
    async with AsyncSession(engine) as session:
        # Check if device already exists
        result = await session.exec(select(Device).where(Device.serial_number == serial_number))
        existing = result.first()
        
        if existing:
            return {"error": f"Device with serial {serial_number} already exists"}
        
        # Generate device ID
        result = await session.exec(select(Device))
        devices = result.all()
        device_num = len(devices) + 1
        device_id = f"D{device_num:03d}"
        
        device = Device(
            device_id=device_id,
            serial_number=serial_number,
            user_email=user_email,
            profile_name=profile_name,
            os_version=os_version,
            status="Enrolled",
            provision_date=datetime.utcnow(),
            last_sync=datetime.utcnow()
        )
        session.add(device)
        await session.commit()
        await session.refresh(device)
        
        return {
            "device_id": device.device_id,
            "serial_number": device.serial_number,
            "user_email": device.user_email,
            "profile_name": device.profile_name,
            "status": device.status,
            "provision_date": device.provision_date.isoformat()
        }


async def get_device_profile(device_id: str) -> Optional[Dict[str, Any]]:
    """Fetches device configuration and profile details.
    
    Args:
        device_id: Device identifier
    
    Returns:
        Dict with device profile details or None if not found
    """
    async with AsyncSession(engine) as session:
        result = await session.exec(select(Device).where(Device.device_id == device_id))
        device = result.first()
        
        if not device:
            return None
        
        return {
            "device_id": device.device_id,
            "serial_number": device.serial_number,
            "user_email": device.user_email,
            "profile_name": device.profile_name,
            "os_version": device.os_version,
            "status": device.status,
            "last_sync": device.last_sync.isoformat() if device.last_sync else None
        }


async def update_device_status(device_id: str, status: str) -> Dict[str, Any]:
    """Changes device enrollment status.
    
    Args:
        device_id: Device identifier
        status: New status (Enrolled, Pending, Failed)
    
    Returns:
        Dict with updated device details
    """
    async with AsyncSession(engine) as session:
        result = await session.exec(select(Device).where(Device.device_id == device_id))
        device = result.first()
        
        if not device:
            return {"error": f"Device {device_id} not found"}
        
        device.status = status
        device.last_sync = datetime.utcnow()
        
        await session.commit()
        await session.refresh(device)
        
        return {
            "device_id": device.device_id,
            "status": device.status,
            "last_sync": device.last_sync.isoformat()
        }


async def list_devices(user_email: Optional[str] = None, status: Optional[str] = None) -> List[Dict[str, Any]]:
    """Lists devices with optional filters.
    
    Args:
        user_email: Filter by user email
        status: Filter by status (Enrolled, Pending, Failed)
    
    Returns:
        List of device dictionaries
    """
    async with AsyncSession(engine) as session:
        query = select(Device)
        
        if user_email:
            query = query.where(Device.user_email == user_email)
        if status:
            query = query.where(Device.status == status)
        
        result = await session.exec(query)
        devices = result.all()
        
        return [
            {
                "device_id": d.device_id,
                "serial_number": d.serial_number,
                "user_email": d.user_email,
                "profile_name": d.profile_name,
                "status": d.status,
                "os_version": d.os_version
            }
            for d in devices
        ]


async def wipe_device(device_id: str, admin_email: str, confirmation: bool = False) -> Dict[str, Any]:
    """Wipes device data (admin-only operation with confirmation).
    
    Args:
        device_id: Device identifier
        admin_email: Admin user email (must have admin role)
        confirmation: Must be True to proceed with wipe
    
    Returns:
        Dict with wipe confirmation or error
    """
    if not confirmation:
        return {"error": "Confirmation required to wipe device. Set confirmation=True"}
    
    # TODO: Add admin role validation when auth is implemented
    
    async with AsyncSession(engine) as session:
        result = await session.exec(select(Device).where(Device.device_id == device_id))
        device = result.first()
        
        if not device:
            return {"error": f"Device {device_id} not found"}
        
        # Mark as wiped (in real scenario, would trigger MDM wipe)
        device.status = "Wiped"
        device.last_sync = datetime.utcnow()
        
        await session.commit()
        await session.refresh(device)
        
        return {
            "device_id": device.device_id,
            "status": "Wiped",
            "wiped_by": admin_email,
            "wiped_at": device.last_sync.isoformat()
        }
