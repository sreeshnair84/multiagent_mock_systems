"""
Seed data for database initialization
"""
from datetime import datetime, timedelta
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
import bcrypt

from app.models import User, Role, Token, AccessRequest, Ticket, Device, Email, Application, AppRole, AppPermission, UserAppRoleLink, UserFlavor


async def seed_database(session: AsyncSession):
    """Populate database with mock data for testing"""
    
    # Check if data already exists
    result = await session.execute(select(User))
    if result.scalars().first():
        print("Database already seeded, skipping...")
        return
    
    print("Seeding database with mock data...")
    
    # 1. Create Roles
    roles = [
        Role(name="Admin", permissions='{"all": true}'),
        Role(name="Approver", permissions='{"approve_requests": true, "view_workflows": true}'),
        Role(name="User", permissions='{"read": true}'),
        Role(name="Pending", permissions='{"limited": true}'),
    ]
    for role in roles:
        session.add(role)
    
    # 2. Create Users (with hashed passwords)
    # Password for all is "password123"
    users_data = [
        {"email": "alex.admin@company.com", "username": "Alex Admin", "role": "admin", "status": "Active", "job_title": "System Administrator", "department": "IT Operations"},
        {"email": "sarah.staff@company.com", "username": "Sarah Staff", "role": "user", "status": "Active", "job_title": "Software Engineer", "department": "Engineering"},
        {"email": "mike.manager@company.com", "username": "Mike Manager", "role": "approver", "status": "Active", "job_title": "Engineering Manager", "department": "Engineering"},
        {"email": "patrick.pending@company.com", "username": "Pending Patrick", "role": "user", "status": "Pending", "job_title": "Intern", "department": "HR"},
        # New Users
        {"email": "devon.ops@company.com", "username": "Devon Ops", "role": "user", "status": "Active", "job_title": "DevOps Engineer", "department": "Cloud Infrastructure"},
        {"email": "isabella.intune@company.com", "username": "Isabella Intune", "role": "user", "status": "Active", "job_title": "Device Specialist", "department": "IT Support"},
        {"email": "sam.sales@company.com", "username": "Sam Sales", "role": "user", "status": "Active", "job_title": "Sales Representative", "department": "Sales"},
    ]
    
    users = []
    for user_data in users_data:
        # Hash password
        password = "password123"
        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        user = User(
            **user_data,
            password_hash=hashed.decode('utf-8'),
            token_expires=datetime.utcnow() + timedelta(days=7),
            created_at=datetime.utcnow() - timedelta(days=30)
        )
        session.add(user)
        users.append(user)
    
    await session.commit()
    
    # Refresh and capture IDs
    for user in users:
        await session.refresh(user)
    
    user_ids = [u.id for u in users]
    # Indices:
    # 0: Alex, 1: Sarah, 2: Mike, 3: Patrick, 4: Devon, 5: Isabella, 6: Sam
    
    # 3. Create Access Requests
    access_requests = [
        AccessRequest(
            request_id="REQ-1001",
            user_email="sarah.staff@company.com",
            resource="SAP Module A",
            action="Read",
            status="Approved",
            approver_email="alex.admin@company.com",
            submitted_date=datetime.utcnow() - timedelta(days=5),
            reviewed_date=datetime.utcnow() - timedelta(days=4)
        ),
        AccessRequest(
            request_id="REQ-1002",
            user_email="mike.manager@company.com",
            resource="SAP Module B",
            action="Write",
            status="Pending",
            approver_email="alex.admin@company.com",
            submitted_date=datetime.utcnow() - timedelta(days=2)
        ),
        AccessRequest(
            request_id="REQ-1003",
            user_email="patrick.pending@company.com",
            resource="SAP Module A",
            action="Read",
            status="Rejected",
            approver_email="alex.admin@company.com",
            submitted_date=datetime.utcnow() - timedelta(days=1),
            reviewed_date=datetime.utcnow(),
            reason="User not yet onboarded"
        ),
        # New Request: Devon requests SAP access
        AccessRequest(
            request_id="REQ-1004",
            user_email="devon.ops@company.com",
            resource="SAP ERP",
            action="Read",
            status="Pending",
            approver_email="mike.manager@company.com", # Mike approves
            submitted_date=datetime.utcnow() - timedelta(hours=4)
        ),
    ]
    for req in access_requests:
        session.add(req)
    
    # 4. Create Tickets
    tickets = [
        Ticket(
            ticket_id="T001",
            title="Laptop Not Booting",
            description="Device D001 won't power on...",
            status="Open",
            priority="High",
            assignee_email="alex.admin@company.com",
            created_date=datetime.utcnow() - timedelta(days=2)
        ),
        Ticket(
            ticket_id="T002",
            title="Access Denied to SAP",
            description="User1 cannot log into Module B...",
            status="In Progress",
            priority="Medium",
            assignee_email="alex.admin@company.com",
            created_date=datetime.utcnow() - timedelta(days=1)
        ),
        Ticket(
            ticket_id="T003",
            title="Email Sync Issue",
            description="Outlook not syncing on mobile...",
            status="Closed",
            priority="Low",
            assignee_email="alex.admin@company.com",
            created_date=datetime.utcnow() - timedelta(days=3),
            resolved_date=datetime.utcnow() - timedelta(days=1)
        ),
        # New Ticket: Sam has CRM issue
        Ticket(
            ticket_id="T004",
            title="Salesforce Login Error",
            description="Cannot access customer data.",
            status="Open",
            priority="High",
            assignee_email="isabella.intune@company.com", # Assigned to Isabella (IT Support)
            created_date=datetime.utcnow() - timedelta(hours=2)
        ),
    ]
    for ticket in tickets:
        session.add(ticket)
    
    # 5. Create Devices
    devices = [
        Device(
            device_id="D001",
            serial_number="SN12345",
            user_email="sarah.staff@company.com",
            profile_name="Standard",
            status="Enrolled",
            provision_date=datetime.utcnow() - timedelta(days=15),
            os_version="Windows 11",
            last_sync=datetime.utcnow()
        ),
        Device(
            device_id="D002",
            serial_number="SN67890",
            user_email="mike.manager@company.com",
            profile_name="Mobile",
            status="Pending",
            os_version="iOS 18"
        ),
        Device(
            device_id="D003",
            serial_number="SN11223",
            user_email="patrick.pending@company.com",
            profile_name="Standard",
            status="Failed",
            provision_date=datetime.utcnow() - timedelta(days=1),
            os_version="Android 15"
        ),
        # New Device for Devon
        Device(
            device_id="D004",
            serial_number="SN99887",
            user_email="devon.ops@company.com",
            profile_name="Developer",
            status="Enrolled",
            provision_date=datetime.utcnow() - timedelta(days=10),
            os_version="Ubuntu 22.04"
        ),
    ]
    for device in devices:
        session.add(device)
    
    # 6. Create Emails
    emails = [
        Email(
            email_id="E001",
            sender="hr@company.com",
            recipient="sarah.staff@company.com",
            subject="Access Request Approval",
            body_snippet="Please review the attached workflow...",
            status="Unread",
            date_received=datetime.utcnow() - timedelta(days=2)
        ),
        Email(
            email_id="E002",
            sender="support@company.com",
            recipient="alex.admin@company.com",
            subject="Ticket #T123 Update",
            body_snippet="Ticket escalated to IT Ops...",
            status="Read",
            date_received=datetime.utcnow() - timedelta(days=1)
        ),
        Email(
            email_id="E003",
            sender="it@company.com",
            recipient="mike.manager@company.com",
            subject="Device Provisioning",
            body_snippet="Your Intune profile is ready...",
            status="Pending",
            date_received=datetime.utcnow()
        ),
        # Invoice email for Sam
        Email(
            email_id="E004",
            sender="billing@company.com",
            recipient="sam.sales@company.com",
            subject="Q4 Invoice Pending",
            body_snippet="Please approve the invoice for Client X...",
            status="Unread",
            date_received=datetime.utcnow() - timedelta(minutes=30)
        ),
    ]
    for email in emails:
        session.add(email)
    
    # 7. Seed RBAC Data
    # ------------------
    
    # Flavors
    flavors = [
        UserFlavor(name="Standard User", description="Regular employee", attributes='{"can_remote": true}'),
        UserFlavor(name="Manager", description="Team Lead", attributes='{"can_remote": true, "budget_limit": 5000}'),
        UserFlavor(name="IT Admin", description="IT Administrator", attributes='{"admin_access": true}')
    ]
    for f in flavors:
        session.add(f)
        
    # Applications
    apps = [
        Application(name="Intune", description="Device Management System"),
        Application(name="SAP", description="ERP System"),
        Application(name="VM Provisioning", description="Cloud Infrastructure")
    ]
    app_map = {} # name -> obj
    for app in apps:
        session.add(app)
        app_map[app.name] = app
    
    # We need to commit/refresh to get IDs for roles
    await session.commit()
    for app in apps:
        await session.refresh(app)
        
    # Roles & Permissions
    # 1. Intune
    intune_admin = AppRole(name="Intune Admin", application_id=app_map["Intune"].id, description="Full access to Intune")
    intune_user = AppRole(name="Intune User", application_id=app_map["Intune"].id, description="View only access")
    
    # 2. SAP
    sap_approver = AppRole(name="SAP Approver", application_id=app_map["SAP"].id, description="Can approve PRs")
    sap_user = AppRole(name="SAP User", application_id=app_map["SAP"].id, description="Standard SAP access")
    
    # 3. VM
    vm_admin = AppRole(name="VM Admin", application_id=app_map["VM Provisioning"].id, description="Can provision any VM")
    vm_requester = AppRole(name="VM Requester", application_id=app_map["VM Provisioning"].id, description="Can request VMs")

    rbac_roles = [intune_admin, intune_user, sap_approver, sap_user, vm_admin, vm_requester]
    for r in rbac_roles:
        session.add(r)
        
    await session.commit()
    for r in rbac_roles:
        await session.refresh(r)
        
    # Assign Roles to Users
    # 0: Alex Admin -> Intune Admin, VM Admin
    session.add(UserAppRoleLink(user_id=user_ids[0], role_id=intune_admin.id))
    session.add(UserAppRoleLink(user_id=user_ids[0], role_id=vm_admin.id))
    
    # 1: Sarah Staff -> Intune User, SAP User
    session.add(UserAppRoleLink(user_id=user_ids[1], role_id=intune_user.id))
    session.add(UserAppRoleLink(user_id=user_ids[1], role_id=sap_user.id))
    
    # 2: Mike Manager -> SAP Approver
    session.add(UserAppRoleLink(user_id=user_ids[2], role_id=sap_approver.id))
    
    # 4: Devon Ops -> VM Admin
    session.add(UserAppRoleLink(user_id=user_ids[4], role_id=vm_admin.id))

    # 5: Isabella Intune -> Intune Admin
    session.add(UserAppRoleLink(user_id=user_ids[5], role_id=intune_admin.id))
    
    # 6: Sam Sales -> SAP User
    session.add(UserAppRoleLink(user_id=user_ids[6], role_id=sap_user.id))

    await session.commit()
    print("Database seeded with RBAC data successfully!")
