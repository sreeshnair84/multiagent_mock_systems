"""
Seed data for database initialization
"""
from datetime import datetime, timedelta
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
import bcrypt

from app.models import User, Role, Token, AccessRequest, Ticket, Device, Email


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
    users_data = [
        {"email": "admin@company.com", "username": "Admin User", "role": "admin", "status": "Active"},
        {"email": "user1@company.com", "username": "John Doe", "role": "user", "status": "Active"},
        {"email": "user2@company.com", "username": "Jane Smith", "role": "approver", "status": "Inactive"},
        {"email": "newuser@company.com", "username": "Bob Johnson", "role": "user", "status": "Pending"},
    ]
    
    users = []
    for user_data in users_data:
        # Hash password (using email as password for demo)
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
    
    # Refresh to get IDs
    for user in users:
        await session.refresh(user)
    
    # 3. Create Access Requests
    access_requests = [
        AccessRequest(
            request_id="REQ-1001",
            user_email="user1@company.com",
            resource="SAP Module A",
            action="Read",
            status="Approved",
            approver_email="admin@company.com",
            submitted_date=datetime.utcnow() - timedelta(days=5),
            reviewed_date=datetime.utcnow() - timedelta(days=4)
        ),
        AccessRequest(
            request_id="REQ-1002",
            user_email="user2@company.com",
            resource="SAP Module B",
            action="Write",
            status="Pending",
            approver_email="admin@company.com",
            submitted_date=datetime.utcnow() - timedelta(days=2)
        ),
        AccessRequest(
            request_id="REQ-1003",
            user_email="newuser@company.com",
            resource="SAP Module A",
            action="Read",
            status="Rejected",
            approver_email="admin@company.com",
            submitted_date=datetime.utcnow() - timedelta(days=1),
            reviewed_date=datetime.utcnow(),
            reason="User not yet onboarded"
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
            assignee_email="admin@company.com",
            created_date=datetime.utcnow() - timedelta(days=2)
        ),
        Ticket(
            ticket_id="T002",
            title="Access Denied to SAP",
            description="User1 cannot log into Module B...",
            status="In Progress",
            priority="Medium",
            assignee_email="admin@company.com",
            created_date=datetime.utcnow() - timedelta(days=1)
        ),
        Ticket(
            ticket_id="T003",
            title="Email Sync Issue",
            description="Outlook not syncing on mobile...",
            status="Closed",
            priority="Low",
            assignee_email="admin@company.com",
            created_date=datetime.utcnow() - timedelta(days=3),
            resolved_date=datetime.utcnow() - timedelta(days=1)
        ),
    ]
    for ticket in tickets:
        session.add(ticket)
    
    # 5. Create Devices
    devices = [
        Device(
            device_id="D001",
            serial_number="SN12345",
            user_email="user1@company.com",
            profile_name="Standard",
            status="Enrolled",
            provision_date=datetime.utcnow() - timedelta(days=15),
            os_version="Windows 11",
            last_sync=datetime.utcnow()
        ),
        Device(
            device_id="D002",
            serial_number="SN67890",
            user_email="user2@company.com",
            profile_name="Mobile",
            status="Pending",
            os_version="iOS 18"
        ),
        Device(
            device_id="D003",
            serial_number="SN11223",
            user_email="newuser@company.com",
            profile_name="Standard",
            status="Failed",
            provision_date=datetime.utcnow() - timedelta(days=1),
            os_version="Android 15"
        ),
    ]
    for device in devices:
        session.add(device)
    
    # 6. Create Emails
    emails = [
        Email(
            email_id="E001",
            sender="hr@company.com",
            recipient="user1@company.com",
            subject="Access Request Approval",
            body_snippet="Please review the attached workflow...",
            status="Unread",
            date_received=datetime.utcnow() - timedelta(days=2)
        ),
        Email(
            email_id="E002",
            sender="support@company.com",
            recipient="admin@company.com",
            subject="Ticket #T123 Update",
            body_snippet="Ticket escalated to IT Ops...",
            status="Read",
            date_received=datetime.utcnow() - timedelta(days=1)
        ),
        Email(
            email_id="E003",
            sender="it@company.com",
            recipient="user2@company.com",
            subject="Device Provisioning",
            body_snippet="Your Intune profile is ready...",
            status="Pending",
            date_received=datetime.utcnow()
        ),
    ]
    for email in emails:
        session.add(email)
    
    await session.commit()
    print("Database seeded successfully!")
