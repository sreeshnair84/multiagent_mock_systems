"""
Onboarding API Endpoint
Orchestrates full user onboarding workflow
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional

from app.api.auth import get_current_user
from app.tools.access_management_tools import onboard_user as onboard_user_tool

router = APIRouter(prefix="/onboard", tags=["Onboarding"])


class OnboardRequest(BaseModel):
    email: str
    username: str
    password: str
    device_serial: Optional[str] = None


class OnboardResponse(BaseModel):
    status: str
    workflow_id: str
    user_created: dict
    device_provisioned: Optional[dict] = None


@router.post("", response_model=OnboardResponse)
async def onboard_new_user(
    request: OnboardRequest,
    current_user: dict = Depends(get_current_user)
):
    """Full onboarding workflow for new user (admin only)"""
    if current_user.get("role") not in ["admin", "supervisor"]:
        raise HTTPException(status_code=403, detail="Admin or supervisor access required")
    
    result = await onboard_user_tool(
        email=request.email,
        username=request.username,
        password=request.password,
        device_serial=request.device_serial
    )
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return OnboardResponse(
        status="onboarded" if result.get("onboarding_complete") else "partial",
        workflow_id=result.get("workflow_id", ""),
        user_created=result.get("user_created", {}),
        device_provisioned=result.get("device_provisioned")
    )
