from langchain_core.tools import tool
from typing import List, Dict, Any

# Mock Data (Mirrors Frontend)
MOCK_EMAILS = [
    { "id": 1, "from": 'IT Support', "subject": 'Password Expiry Notification', "preview": 'Your password for account CORP\\JDoe is set to expire in 3 days...', "time": '10:42 AM', "unread": True },
    { "id": 2, "from": 'Alice Smith', "subject": 'Re: SAP Access Request', "preview": 'Hi John, I have submitted the GRC request for the new finance role...', "time": '09:15 AM', "unread": False },
    { "id": 3, "from": 'Microsoft Viva', "subject": 'Your daily briefing', "preview": 'You have 4 meetings today. Prepare for "Q4 Roadmap Review"...', "time": '08:00 AM', "unread": False },
    { "id": 4, "from": 'ServiceNow', "subject": 'INC-99281 Assigned to Group', "preview": 'Incident INC-99281 has been routed to your assignment group...', "time": 'Yesterday', "unread": True },
]

MOCK_TICKETS = [
    { "id": 'INC0019283', "summary": 'Email sync failing on mobile devices', "priority": '1 - Critical', "state": 'New', "assignedTo": '', "updated": '10 mins ago' },
    { "id": 'RITM004921', "summary": 'Request for New Laptop - MacBook Pro', "priority": '3 - Moderate', "state": 'Work in Progress', "assignedTo": 'John Doe', "updated": '2 hours ago' },
     { "id": 'INC0019255', "summary": 'SAP Login Timeout Issue', "priority": '2 - High', "state": 'Resolved', "assignedTo": 'Service Desk', "updated": 'Yesterday' },
]

MOCK_SAP_REQUESTS = [
    { "id": 'REQ-2024-001', "user": 'Alice Smith', "role": 'SAP_FINANCE_READ', "status": 'Pending', "risk": 'Low' },
    { "id": 'REQ-2024-002', "user": 'Bob Jones', "role": 'SAP_HR_ADMIN', "status": 'Approved', "risk": 'High' },
]

MOCK_M365_USERS = [
    { "id": 'u1', "name": 'John Doe', "email": 'john.doe@contoso.com', "license": 'E5', "status": 'Active', "department": 'IT' },
    { "id": 'u2', "name": 'Jane Smith', "email": 'jane.smith@contoso.com', "license": 'E3', "status": 'Active', "department": 'Sales' },
]

MOCK_INTUNE_DEVICES = [
    { "id": 'dev1', "name": 'LAPTOP-JD-01', "user": 'John Doe', "os": 'Windows 10', "compliance": 'Compliant', "lastSync": 'Just now' },
    { "id": 'dev2', "name": 'IPHONE-13-JS', "user": 'Jane Smith', "os": 'iOS 16.0', "compliance": 'Non-Compliant', "lastSync": '2 days ago' },
]

# Tools
@tool
def get_outlook_emails(query: str = "") -> List[Dict[str, Any]]:
    """Fetches key emails from the user's Outlook inbox."""
    return MOCK_EMAILS

@tool
def get_servicenow_tickets(query: str = "") -> List[Dict[str, Any]]:
    """Fetches active ServiceNow incidents and requests."""
    return MOCK_TICKETS

@tool
def get_sap_requests(query: str = "") -> List[Dict[str, Any]]:
    """Fetches pending SAP GRC access requests."""
    return MOCK_SAP_REQUESTS

@tool
def get_m365_users(query: str = "") -> List[Dict[str, Any]]:
    """Searches for M365 users and their license status."""
    return MOCK_M365_USERS

@tool
def get_intune_devices(query: str = "") -> List[Dict[str, Any]]:
    """Fetches Intune device compliance status."""
    return MOCK_INTUNE_DEVICES
