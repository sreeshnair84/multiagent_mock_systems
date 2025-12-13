"""
Access Management Agent Tools
Handles SAP-like access request workflows, approvals, and onboarding
Exposed via MCP server, not as LangChain tools
"""
from typing import List, Dict, Any, Optional
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from datetime import datetime

from app.models import AccessRequest, User, Device
from app.core.database import engine


async def submit_access_request(user_email: str, resource: str, action: str) -> Dict[str, Any]:
    """Creates a new access request for approval.
    
    Args:
        user_email: User requesting access
        resource: Resource to access (e.g., SAP Module A)
        action: Action requested (Read, Write, Admin)
    
    Returns:
        Dict with request details
    """
    async with AsyncSession(engine) as session:
        # Generate request ID
        result = await session.execute(select(AccessRequest))
        requests = result.scalars().all()
        req_num = len(requests) + 1
        request_id = f"REQ-{req_num:04d}"
        
        request = AccessRequest(
            request_id=request_id,
            user_email=user_email,
            resource=resource,
            action=action,
            status="Pending"
        )
        session.add(request)
        await session.commit()
        await session.refresh(request)
        
        return {
            "request_id": request.request_id,
            "user_email": request.user_email,
            "resource": request.resource,
            "action": request.action,
            "status": request.status,
            "submitted_date": request.submitted_date.isoformat()
        }


async def approve_request(request_id: str, approver_email: str, approved: bool, reason: Optional[str] = None) -> Dict[str, Any]:
    """Approves or rejects an access request (requires Approver role).
    
    Args:
        request_id: Request identifier
        approver_email: Email of approver (must have Approver or Admin role)
        approved: True to approve, False to reject
        reason: Optional reason for rejection
    
    Returns:
        Dict with approval decision
    """
    async with AsyncSession(engine) as session:
        # Verify approver has appropriate role
        result = await session.execute(select(User).where(User.email == approver_email))
        approver = result.scalars().first()
        
        if not approver or approver.role not in ["admin", "approver"]:
            return {"error": "User does not have approval permissions"}
        
        # Get request
        result = await session.execute(select(AccessRequest).where(AccessRequest.request_id == request_id))
        request = result.scalars().first()
        
        if not request:
            return {"error": f"Request {request_id} not found"}
        
        request.status = "Approved" if approved else "Rejected"
        request.approver_email = approver_email
        request.reviewed_date = datetime.utcnow()
        
        if not approved and reason:
            request.reason = reason
        
        await session.commit()
        await session.refresh(request)
        
        return {
            "request_id": request.request_id,
            "status": request.status,
            "approver_email": request.approver_email,
            "reviewed_date": request.reviewed_date.isoformat(),
            "reason": request.reason
        }


async def get_workflow_status(request_id: Optional[str] = None, user_email: Optional[str] = None) -> List[Dict[str, Any]]:
    """Checks status of access requests.
    
    Args:
        request_id: Optional specific request ID
        user_email: Optional filter by user email
    
    Returns:
        List of request status dictionaries
    """
    async with AsyncSession(engine) as session:
        query = select(AccessRequest)
        
        if request_id:
            query = query.where(AccessRequest.request_id == request_id)
        elif user_email:
            query = query.where(AccessRequest.user_email == user_email)
        
        result = await session.execute(query)
        requests = result.scalars().all()
        
        return [
            {
                "request_id": r.request_id,
                "user_email": r.user_email,
                "resource": r.resource,
                "action": r.action,
                "status": r.status,
                "approver_email": r.approver_email,
                "submitted_date": r.submitted_date.isoformat()
            }
            for r in requests
        ]


async def notify_approver(request_id: str, approver_email: str) -> Dict[str, Any]:
    """Sends mock email notification to approver.
    
    Args:
        request_id: Request identifier
        approver_email: Email to notify
    
    Returns:
        Dict with notification confirmation
    """
    async with AsyncSession(engine) as session:
        result = await session.execute(select(AccessRequest).where(AccessRequest.request_id == request_id))
        request = result.scalars().first()
        
        if not request:
            return {"error": f"Request {request_id} not found"}
        
        # Mock email notification (in production, integrate with email service)
        notification = {
            "to": approver_email,
            "subject": f"Access Request {request_id} Requires Approval",
            "body": f"User {request.user_email} has requested {request.action} access to {request.resource}",
            "sent_at": datetime.utcnow().isoformat()
        }
        
        return {
            "request_id": request_id,
            "notification_sent": True,
            "recipient": approver_email,
            "sent_at": notification["sent_at"]
        }


async def onboard_user(email: str, username: str, password: str, device_serial: Optional[str] = None) -> Dict[str, Any]:
    """Orchestrates full user onboarding workflow.
    
    This is a composite tool that:
    1. Creates user account
    2. Assigns default "User" role
    3. Provisions device (if serial provided)
    4. Sets status to Active
    
    Args:
        email: User email
        username: Display name
        password: Initial password
        device_serial: Optional device serial number to provision
    
    Returns:
        Dict with onboarding workflow results
    """
    from app.tools.user_management_tools import create_user
    from app.tools.intune_tools import provision_device
    
    results = {}
    
    # Step 1: Create user
    user_result = await create_user(email, username, password, role="user")
    if "error" in user_result:
        return user_result
    
    results["user_created"] = user_result
    
    # Step 2: Activate user
    async with AsyncSession(engine) as session:
        result = await session.execute(select(User).where(User.email == email))
        user = result.scalars().first()
        if user:
            user.status = "Active"
            await session.commit()
            results["user_activated"] = True
    
    # Step 3: Provision device (if provided)
    if device_serial:
        device_result = await provision_device(
            serial_number=device_serial,
            user_email=email,
            profile_name="Standard",
            os_version="Windows 11"
        )
        results["device_provisioned"] = device_result
    
    results["onboarding_complete"] = True
    results["workflow_id"] = f"ONBOARD-{user_result['user_id']}"
    
    return results
