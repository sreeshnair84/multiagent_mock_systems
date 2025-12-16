
const AGENT_BASE_URL = 'http://localhost:8006/agents';

export type AgentId = 'vm' | 'intune' | 'access' | 'resource';

export interface AgentMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface StreamEvent {
    type: 'message_chunk' | 'status_update' | 'tool_call' | 'error';
    content?: string;
    data?: any;
}

export const AgentService = {
    /**
     * Send a message to an agent and stream the response.
     * This uses the A2A 0.3.x /v1/message:stream endpoint.
     * 
     * @param agentId The ID of the agent (e.g., 'vm', 'intune')
     * @param message The user message
     * @param onEvent Callback for handling stream events
     */
    streamMessage: async (
        agentId: AgentId,
        message: string,
        onEvent: (event: StreamEvent) => void
    ) => {
        try {
            const response = await fetch(`${AGENT_BASE_URL}/${agentId}/v1/message:stream`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: {
                        role: 'ROLE_USER',
                        content: [{ text: message }]
                    }
                }),
            });

            if (!response.ok) {
                throw new Error(`Agent API Error: ${response.statusText}`);
            }

            if (!response.body) {
                throw new Error('No response body received');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let currentDataBuffer = ''; // To accumulate multi-line data

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;

                // Process SSE lines
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // Keep incomplete line in buffer

                for (const line of lines) {
                    if (line.trim() === '') {
                        // Empty line indicates end of an event
                        if (currentDataBuffer.trim()) {
                            try {
                                const dataStr = currentDataBuffer.trim();
                                if (dataStr === '[DONE]') {
                                    return; // Check logic
                                }

                                const data = JSON.parse(dataStr);

                                // Map A2A events to our StreamEvent format
                                if (data.statusUpdate || data.status) {
                                    const statusData = data.statusUpdate || data;
                                    const status = statusData.status || statusData;

                                    if (status.state === 'TASK_STATE_FAILED') {
                                        const errorText = status.message?.parts?.[0]?.text ||
                                            JSON.stringify(status.message);
                                        onEvent({ type: 'error', content: errorText });
                                    } else {
                                        // Send status update with the message content
                                        onEvent({ type: 'status_update', data: statusData });
                                    }
                                } else if (data.messageDelta || data.delta) {
                                    const text = data.messageDelta?.content?.[0]?.text || data.delta?.text || '';
                                    if (text) {
                                        onEvent({ type: 'message_chunk', content: text });
                                    }
                                } else if (data.type === 'token' || data.type === 'content_block_delta') {
                                    onEvent({ type: 'message_chunk', content: data.delta?.text || data.text || '' });
                                } else if (data.type === 'status_update' || data.type === 'task_status') {
                                    onEvent({ type: 'status_update', data: data.status });
                                } else if (data.type === 'tool_call') {
                                    onEvent({ type: 'tool_call', data: data });
                                }
                            } catch (e) {
                                console.warn("Failed to parse SSE data chunk", e, currentDataBuffer);
                            }
                            currentDataBuffer = ''; // Reset for next event
                        }
                        continue;
                    }

                    if (line.startsWith('data: ')) {
                        // Append data content with newline to preserve JSON structure
                        const dataContent = line.slice(6);
                        if (currentDataBuffer) {
                            currentDataBuffer += '\n' + dataContent;
                        } else {
                            currentDataBuffer = dataContent;
                        }
                    }
                }
            }
        } catch (error: any) {
            console.error("Stream error:", error);
            onEvent({ type: 'error', content: error.message });
        }
    },

    /**
     * Simple unary message send.
     */
    sendMessage: async (agentId: AgentId, message: string) => {
        const response = await fetch(`${AGENT_BASE_URL}/${agentId}/v1/message:send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: {
                    role: 'ROLE_USER',
                    content: [{ text: message }]
                }
            }),
        });
        return await response.json();
    }
};
