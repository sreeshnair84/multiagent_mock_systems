// API Service Layer with Mock Failover
import { MOCK_TICKETS, MOCK_SAP_REQUESTS, MOCK_M365_USERS, MOCK_INTUNE_DEVICES, MOCK_EMAILS } from '../data/mockData';

const API_BASE_URL = 'http://localhost:8000/api';

// Helper function to handle API calls with fallback to mock data
async function apiCall<T>(endpoint: string, options?: RequestInit, mockData?: T): Promise<T> {
    try {
        const token = localStorage.getItem('auth_token');
        const headers = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options?.headers,
        };

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.warn(`API call failed for ${endpoint}, using mock data:`, error);
        if (mockData !== undefined) {
            return mockData;
        }
        throw error;
    }
}

// Authentication API
export const authApi = {
    login: async (email: string, password: string) => {
        // For auth, we might want to fail if API is down, or allow demo login
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error('Invalid credentials');
            }

            return await response.json();
        } catch (e) {
            console.warn("Auth API failed, falling back to demo mode if applicable");
            // Fallback for demo users
            if (password === 'admin123' || password === 'user123' || password === 'approver123') {
                return {
                    token: 'mock-jwt-token',
                    user: {
                        id: 1,
                        email: email,
                        username: email.split('@')[0],
                        role: password.replace('123', '')
                    }
                };
            }
            throw e;
        }
    },

    logout: async () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
    },
};

// ServiceNow Tickets API
export const ticketsApi = {
    list: async (filters?: any) => {
        const params = new URLSearchParams(filters);
        return apiCall<any[]>(`/tickets?${params}`, {}, MOCK_TICKETS);
    },

    get: async (ticketId: string) => {
        return apiCall<any>(`/tickets/${ticketId}`, {}, MOCK_TICKETS.find(t => t.id === ticketId) || MOCK_TICKETS[0]);
    },

    create: async (data: any) => {
        return apiCall<any>('/tickets', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    update: async (ticketId: string, data: any) => {
        return apiCall<any>(`/tickets/${ticketId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    assignToGroup: async (ticketId: string, groupName: string) => {
        return apiCall<any>(`/tickets/${ticketId}/assign-group`, {
            method: 'POST',
            body: JSON.stringify({ group_name: groupName }),
        });
    },

    addWorkNote: async (ticketId: string, note: string, authorEmail: string) => {
        return apiCall<any>(`/tickets/${ticketId}/work-notes`, {
            method: 'POST',
            body: JSON.stringify({ note, author_email: authorEmail }),
        });
    },

    escalate: async (ticketId: string, reason: string) => {
        return apiCall<any>(`/tickets/${ticketId}/escalate`, {
            method: 'POST',
            body: JSON.stringify({ reason }),
        });
    },
};

// Access Requests API
export const accessRequestsApi = {
    list: async (filters?: any) => {
        const params = new URLSearchParams(filters);
        return apiCall<any[]>(`/access-requests?${params}`, {}, MOCK_SAP_REQUESTS);
    },

    get: async (requestId: string) => {
        return apiCall<any>(`/access-requests/${requestId}`, {}, MOCK_SAP_REQUESTS.find(r => r.id === requestId) || MOCK_SAP_REQUESTS[0]);
    },

    create: async (data: any) => {
        return apiCall<any>('/access-requests', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    approve: async (requestId: string, approverEmail: string) => {
        return apiCall<any>(`/access-requests/${requestId}/approve`, {
            method: 'POST',
            body: JSON.stringify({ approver_email: approverEmail, approved: true }),
        });
    },

    reject: async (requestId: string, approverEmail: string, reason: string) => {
        return apiCall<any>(`/access-requests/${requestId}/approve`, {
            method: 'POST',
            body: JSON.stringify({ approver_email: approverEmail, approved: false, reason }),
        });
    },

    calculateRisk: async (resource: string, action: string) => {
        return apiCall<any>('/access-requests/calculate-risk', {
            method: 'POST',
            body: JSON.stringify({ resource, action }),
        });
    },
};

// Users API
export const usersApi = {
    list: async (filters?: any) => {
        const params = new URLSearchParams(filters);
        return apiCall<any[]>(`/users?${params}`, {}, MOCK_M365_USERS);
    },

    get: async (userId: number) => {
        return apiCall<any>(`/users/${userId}`, {}, MOCK_M365_USERS.find(u => u.id === userId) || MOCK_M365_USERS[0]);
    },

    create: async (data: any) => {
        return apiCall<any>('/users', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    update: async (userId: number, data: any) => {
        return apiCall<any>(`/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    deactivate: async (userEmail: string) => {
        return apiCall<any>(`/users/deactivate`, {
            method: 'POST',
            body: JSON.stringify({ user_email: userEmail }),
        });
    },

    assignLicense: async (userEmail: string, licenseSku: string) => {
        return apiCall<any>(`/users/assign-license`, {
            method: 'POST',
            body: JSON.stringify({ user_email: userEmail, license_sku: licenseSku }),
        });
    },
};

// Devices API
export const devicesApi = {
    list: async (filters?: any) => {
        const params = new URLSearchParams(filters);
        return apiCall<any[]>(`/devices?${params}`, {}, MOCK_INTUNE_DEVICES);
    },

    get: async (deviceId: string) => {
        return apiCall<any>(`/devices/${deviceId}`, {}, MOCK_INTUNE_DEVICES.find(d => d.id === deviceId) || MOCK_INTUNE_DEVICES[0]);
    },

    provision: async (data: any) => {
        return apiCall<any>('/devices', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    updateStatus: async (deviceId: string, status: string) => {
        return apiCall<any>(`/devices/${deviceId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
    },

    checkCompliance: async (deviceId: string) => {
        return apiCall<any>(`/devices/${deviceId}/check-compliance`, {
            method: 'POST',
        });
    },

    wipe: async (deviceId: string, adminEmail: string, confirmation: boolean) => {
        return apiCall<any>(`/devices/${deviceId}/wipe`, {
            method: 'POST',
            body: JSON.stringify({ admin_email: adminEmail, confirmation }),
        });
    },
};

// Emails API
export const emailsApi = {
    list: async (filters?: any) => {
        const params = new URLSearchParams(filters);
        return apiCall<any[]>(`/emails?${params}`, {}, MOCK_EMAILS);
    },

    get: async (emailId: string) => {
        return apiCall<any>(`/emails/${emailId}`, {}, MOCK_EMAILS.find(e => e.id === emailId) || MOCK_EMAILS[0]);
    },

    send: async (data: any) => {
        return apiCall<any>('/emails', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    markRead: async (emailId: string) => {
        return apiCall<any>(`/emails/${emailId}/mark-read`, {
            method: 'POST',
        });
    },

    reply: async (emailId: string, body: string, replyAll: boolean) => {
        return apiCall<any>(`/emails/${emailId}/reply`, {
            method: 'POST',
            body: JSON.stringify({ body, reply_all: replyAll }),
        });
    },
};

// Agent Streams API (WebSocket)
export const agentApi = {
    sendMessage: async (message: string) => {
        return apiCall<any>('/agent/chat', {
            method: 'POST',
            body: JSON.stringify({ message }),
        });
    },

    // WebSocket connection for real-time updates
    connectWebSocket: (onMessage: (data: any) => void, clientId: string = "default") => {
        const ws = new WebSocket(`ws://localhost:8000/ws/chat/${clientId}`);

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            onMessage(data);
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        return ws;
    },
};
