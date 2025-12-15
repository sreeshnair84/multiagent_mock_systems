
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List, Optional
from app.core.database import get_session
from app.models.rbac import Application, AppRole, AppPermission, UserAppRoleLink, UserFlavor
from pydantic import BaseModel

router = APIRouter(
    prefix="/rbac",
    tags=["Role Management"],
    responses={404: {"description": "Not found"}},
)

# Pydantic Schemas for Requests
class RoleCreate(BaseModel):
    name: str
    description: Optional[str] = None
    application_id: int
    permissions: List[dict] # List of {"resource": "...", "action": "..."}

class RoleAssign(BaseModel):
    user_id: int
    role_id: int

class FlavorCreate(BaseModel):
    name: str
    description: Optional[str] = None
    attributes: str = "{}"

@router.get("/applications", response_model=List[Application])
async def list_applications(session: Session = Depends(get_session)):
    return (await session.execute(select(Application))).scalars().all()

@router.post("/applications", response_model=Application)
async def create_application(app: Application, session: Session = Depends(get_session)):
    session.add(app)
    await session.commit()
    await session.refresh(app)
    return app

@router.get("/roles", response_model=List[AppRole])
async def list_roles(application_id: Optional[int] = None, session: Session = Depends(get_session)):
    query = select(AppRole)
    if application_id:
        query = query.where(AppRole.application_id == application_id)
    return (await session.execute(query)).scalars().all()

@router.post("/roles", response_model=AppRole)
async def create_role(role_req: RoleCreate, session: Session = Depends(get_session)):
    # Create Role
    new_role = AppRole(
        name=role_req.name, 
        description=role_req.description, 
        application_id=role_req.application_id
    )
    session.add(new_role)
    await session.commit()
    await session.refresh(new_role)
    
    # Create Permissions
    for perm in role_req.permissions:
        new_perm = AppPermission(
            role_id=new_role.id,
            resource=perm.get("resource"),
            action=perm.get("action")
        )
        session.add(new_perm)
    
    await session.commit()
    await session.refresh(new_role)
    return new_role

@router.get("/roles/{role_id}/permissions", response_model=List[AppPermission])
async def list_permissions(role_id: int, session: Session = Depends(get_session)):
    return (await session.execute(select(AppPermission).where(AppPermission.role_id == role_id))).scalars().all()

@router.post("/assign")
async def assign_role_to_user(assignment: RoleAssign, session: Session = Depends(get_session)):
    # Check if exists
    result = await session.execute(select(UserAppRoleLink).where(
        UserAppRoleLink.user_id == assignment.user_id,
        UserAppRoleLink.role_id == assignment.role_id
    ))
    link = result.scalars().first()
    
    if link:
        return {"message": "Role already assigned"}
        
    new_link = UserAppRoleLink(user_id=assignment.user_id, role_id=assignment.role_id)
    session.add(new_link)
    await session.commit()
    return {"message": "Role assigned successfully"}

@router.get("/users/{user_id}/roles")
async def get_user_roles(user_id: int, session: Session = Depends(get_session)):
    result = await session.execute(select(UserAppRoleLink).where(UserAppRoleLink.user_id == user_id))
    links = result.scalars().all()
    roles = []
    for link in links:
        role = await session.get(AppRole, link.role_id)
        if role:
            # Fetch application name for context
            app = await session.get(Application, role.application_id)
            roles.append({
                "role_id": role.id,
                "role_name": role.name,
                "application": app.name if app else "Unknown",
                "assigned_at": link.assigned_at
            })
    return roles

# Flavors
@router.get("/flavors", response_model=List[UserFlavor])
async def list_flavors(session: Session = Depends(get_session)):
    return (await session.execute(select(UserFlavor))).scalars().all()

@router.post("/flavors", response_model=UserFlavor)
async def create_flavor(flavor: FlavorCreate, session: Session = Depends(get_session)):
    new_flavor = UserFlavor(name=flavor.name, description=flavor.description, attributes=flavor.attributes)
    session.add(new_flavor)
    await session.commit()
    await session.refresh(new_flavor)
    return new_flavor
