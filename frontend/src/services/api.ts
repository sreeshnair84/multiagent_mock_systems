// API Service Layer
const API_BASE_URL = 'http://localhost:8000/api';

// Helper function to handle API calls
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
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
}

// Authentication API
export const authApi = {
    login: async (email: string, password: string) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            throw new Error('Invalid credentials');
        }

        return await response.json();
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
        return apiCall<any[]>(`/tickets?${params}`);
    },

    get: async (ticketId: string) => {
        return apiCall<any>(`/tickets/${ticketId}`);
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
        return apiCall<any[]>(`/access-requests?${params}`);
    },

    get: async (requestId: string) => {
        return apiCall<any>(`/access-requests/${requestId}`);
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
        return apiCall<any[]>(`/users?${params}`);
    },

    get: async (userId: number) => {
        return apiCall<any>(`/users/${userId}`);
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
        return apiCall<any[]>(`/devices?${params}`);
    },

    get: async (deviceId: string) => {
        return apiCall<any>(`/devices/${deviceId}`);
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
        return apiCall<any[]>(`/emails?${params}`);
    },

    get: async (emailId: string) => {
        return apiCall<any>(`/emails/${emailId}`);
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

// Resources API
export const resourcesApi = {
    getVMs: async () => {
        // Force array return
        const res = await apiCall<any[]>('/resources/vms');
        return Array.isArray(res) ? res : [];
    },

    getApps: async () => {
        const res = await apiCall<any[]>('/resources/apps');
        return Array.isArray(res) ? res : [];
    },

    getRGs: async () => {
        const res = await apiCall<any[]>('/resources/rgs');
        return Array.isArray(res) ? res : [];
    },

    getSAs: async () => {
        const res = await apiCall<any[]>('/resources/service-accounts');
        return Array.isArray(res) ? res : [];
    },
};

// Agent Streams API (Deprecated placeholders to prevent errors)
export const agentApi = {
    sendMessage: async (message: string) => {
        // No-op
        return {};
    },
    connectWebSocket: (onMessage: (data: any) => void, clientId: string = "default") => {
        // No-op
        return { close: () => { }, send: () => { } } as unknown as WebSocket;
    },
};

// RBAC API
export const rbacApi = {
    getApplications: async () => {
        const res = await apiCall<any[]>('/rbac/applications');
        return Array.isArray(res) ? res : [];
    },

    getFlavors: async () => {
        const res = await apiCall<any[]>('/rbac/flavors');
        return Array.isArray(res) ? res : [];
    },

    getRoles: async (applicationId?: number) => {
        const query = applicationId ? `?application_id=${applicationId}` : '';
        const res = await apiCall<any[]>(`/rbac/roles${query}`);
        return Array.isArray(res) ? res : [];
    },

    getUserRoles: async (userId: number) => {
        const res = await apiCall<any[]>(`/rbac/users/${userId}/roles`);
        return Array.isArray(res) ? res : [];
    },

    assignRole: async (userId: number, roleId: number) => {
        return apiCall<any>(`/rbac/assign`, {
            method: 'POST',
            body: JSON.stringify({ user_id: userId, role_id: roleId }),
        });
    }
};
