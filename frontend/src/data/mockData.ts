

export const MOCK_EMAILS = [
    { id: 1, from: 'IT Support', subject: 'Password Expiry Notification', preview: 'Your password for account CORP\\JDoe is set to expire in 3 days...', time: '10:42 AM', unread: true },
    { id: 2, from: 'Alice Smith', subject: 'Re: SAP Access Request', preview: 'Hi John, I have submitted the GRC request for the new finance role...', time: '09:15 AM', unread: false },
    { id: 3, from: 'Microsoft Viva', subject: 'Your daily briefing', preview: 'You have 4 meetings today. Prepare for "Q4 Roadmap Review"...', time: '08:00 AM', unread: false },
    { id: 4, from: 'ServiceNow', subject: 'INC-99281 Assigned to Group', preview: 'Incident INC-99281 has been routed to your assignment group...', time: 'Yesterday', unread: true },
    { id: 5, from: 'HR Bot', subject: 'Open Enrollment Begins', preview: 'It is that time of year again! Review your benefits package...', time: 'Yesterday', unread: false },
];

export const MOCK_TICKETS = [
    { id: 'INC0019283', summary: 'Email sync failing on mobile devices', priority: '1 - Critical', state: 'New', assignedTo: '', updated: '10 mins ago' },
    { id: 'RITM004921', summary: 'Request for New Laptop - MacBook Pro', priority: '3 - Moderate', state: 'Work in Progress', assignedTo: 'John Doe', updated: '2 hours ago' },
    { id: 'INC0019255', summary: 'SAP Login Timeout Issue', priority: '2 - High', state: 'Resolved', assignedTo: 'Service Desk', updated: 'Yesterday' },
    { id: 'CHG0003921', summary: 'Upgrade Database Server cluster', priority: '2 - High', state: 'Scheduled', assignedTo: 'DBA Team', updated: '2 days ago' },
];

export const MOCK_SAP_REQUESTS = [
    { id: 'REQ-2024-001', user: 'Alice Smith', role: 'SAP_FINANCE_READ', status: 'Pending', risk: 'Low' },
    { id: 'REQ-2024-002', user: 'Bob Jones', role: 'SAP_HR_ADMIN', status: 'Approved', risk: 'High' },
    { id: 'REQ-2024-003', user: 'Charlie Day', role: 'SAP_LOGISTICS_WRITE', status: 'Pending', risk: 'Medium' },
];

export const MOCK_M365_USERS = [
    { id: 'u1', name: 'John Doe', email: 'john.doe@contoso.com', license: 'E5', status: 'Active', department: 'IT' },
    { id: 'u2', name: 'Jane Smith', email: 'jane.smith@contoso.com', license: 'E3', status: 'Active', department: 'Sales' },
    { id: 'u3', name: 'Bob Johnson', email: 'bob.j@contoso.com', license: 'F1', status: 'Blocked', department: 'Retail' },
    { id: 'u4', name: 'Alice Wong', email: 'alice.w@contoso.com', license: 'E5', status: 'Active', department: 'Finance' },
];

export const MOCK_INTUNE_DEVICES = [
    { id: 'dev1', name: 'LAPTOP-JD-01', user: 'John Doe', os: 'Windows 10', compliance: 'Compliant', lastSync: 'Just now' },
    { id: 'dev2', name: 'IPHONE-13-JS', user: 'Jane Smith', os: 'iOS 16.0', compliance: 'Non-Compliant', lastSync: '2 days ago' },
    { id: 'dev3', name: 'ANDROID-WORK-02', user: 'Bob Johnson', os: 'Android 12', compliance: 'Compliant', lastSync: '1 hour ago' },
];
