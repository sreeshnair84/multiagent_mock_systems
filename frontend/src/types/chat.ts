export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system' | 'tool';
    content: string;
    agentName?: string; // e.g. "Supervisor", "ServiceNow Agent"
    timestamp: number;
}

export interface Agent {
    id: string;
    name: string;
    avatar?: string;
    description: string;
}

// WebSocket Event Types from Backend
export type ServerEvent =
    | { type: 'token'; value: string }
    | { type: 'message'; agent: string; content: string }
    | { type: 'error'; message: string };
