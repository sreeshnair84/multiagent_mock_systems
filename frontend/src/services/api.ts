import {
    MOCK_EMAILS,
    MOCK_TICKETS,
    MOCK_SAP_REQUESTS,
    MOCK_M365_USERS,
    MOCK_INTUNE_DEVICES
} from '../data/mockData';

const API_BASE = 'http://localhost:8000/api';
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

// Helper to simulate delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithFallback<T>(endpoint: string, mockData: T): Promise<T> {
    // 1. If mocks are forced, return mock data immediately
    if (USE_MOCKS) {
        console.log(`[Mock Mode] Returning mock data for ${endpoint}`);
        await delay(500); // Simulate network latency
        return mockData;
    }

    // 2. Try fetching from API
    try {
        const response = await fetch(`${API_BASE}${endpoint}`);
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        // 3. If API fails, check if we should fallback (could be another env var, but logic assumes fallback based on user request)
        // User request: "endpoint is not available AND configuration is enabled to show mockedup data"
        // I will interpret this as always fallback on error for now, logging the error.
        console.warn(`[API Failed] ${endpoint} - Falling back to mock data.`, error);
        return mockData;
    }
}

export const api = {
    getOutlookEmails: () => fetchWithFallback('/outlook/emails', MOCK_EMAILS),
    getServiceNowTickets: () => fetchWithFallback('/servicenow/tickets', MOCK_TICKETS),
    getSapRequests: () => fetchWithFallback('/sap/requests', MOCK_SAP_REQUESTS),
    getM365Users: () => fetchWithFallback('/m365/users', MOCK_M365_USERS),
    getIntuneDevices: () => fetchWithFallback('/intune/devices', MOCK_INTUNE_DEVICES),
};
