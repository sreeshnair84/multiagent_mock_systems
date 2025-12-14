import React, { useState, useEffect, useRef } from 'react';
import '../styles/design-system.css';
import { agentApi } from '../services/api';

interface Message {
    id: string;
    type: 'user' | 'agent' | 'tool';
    content: string;
    timestamp: Date;
    toolCall?: {
        name: string;
        parameters: any;
        response: any;
        executionTime: number;
    };
}

type Workflow = 'INTUNE_COPILOT' | 'ACCESS_WORKFLOW' | null;

const AgentStreamsPage: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow>(null);

    // For "Thinking" expanders
    const [expandedToolIds, setExpandedToolIds] = useState<Set<string>>(new Set());

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);

    // Initialize Speech Recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInputText(transcript);
                setIsListening(false);
                // Optional: Auto-send on voice end? For now, let user confirm.
            };

            recognitionRef.current.onerror = () => {
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, []);

    const wsRef = useRef<WebSocket | null>(null);

    // Initialize WebSocket
    useEffect(() => {
        // Connect with a random or fixed client ID
        const clientId = 'user-' + Math.floor(Math.random() * 10000);
        const ws = agentApi.connectWebSocket((data) => {
            const newMessage: Message = {
                id: Date.now().toString(),
                type: data.type === 'tool_call' ? 'tool' : 'agent',
                content: data.content || data.tool_name,
                timestamp: new Date(),
                toolCall: data.type === 'tool_call' ? {
                    name: data.tool_name,
                    parameters: data.parameters,
                    response: data.result,
                    executionTime: data.duration || 0.5
                } : undefined
            };
            setMessages(prev => [...prev, newMessage]);
            if (data.type !== 'tool_call') {
                speak(data.content);
            }
        }, clientId);

        wsRef.current = ws;

        return () => {
            ws.close();
        };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const speak = (text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);
            window.speechSynthesis.speak(utterance);
        }
    };

    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            setIsListening(true);
            recognitionRef.current.start();
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    const toggleToolExpansion = (id: string) => {
        setExpandedToolIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    const sendMessage = async (text: string = inputText) => {
        if (!text.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            type: 'user',
            content: text,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);

        // Send via WebSocket
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            const payload = {
                message: text,
                workflow: selectedWorkflow
            };
            wsRef.current.send(JSON.stringify(payload));
        } else {
            console.error("WebSocket not connected");
            simulateAgentResponse(); // Fallback
            setIsLoading(false);
        }
    };

    const simulateAgentResponse = () => {
        setTimeout(() => {
            const toolMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: 'tool',
                content: 'create_servicenow_ticket',
                timestamp: new Date(),
                toolCall: {
                    name: 'create_servicenow_ticket',
                    parameters: { title: 'Issue from chat', priority: 'High' },
                    response: { ticket_id: 'INC0000004', status: 'Open' },
                    executionTime: 0.8
                }
            };
            const agentMessage: Message = {
                id: (Date.now() + 2).toString(),
                type: 'agent',
                content: 'I have processed your request based on the current workflow.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, toolMessage, agentMessage]);
            speak(agentMessage.content);
            setIsLoading(false);
        }, 1500);
    };

    const handleWorkflowSelect = (workflow: Workflow) => {
        setSelectedWorkflow(workflow);
        setMessages([]); // Clear chat on workflow switch? Or keep history? Clean slate is better for "New Chat" feel
    };

    // Render Logic
    const isWelcomeScreen = messages.length === 0 && !isLoading;

    return (
        <div className="h-full flex flex-col bg-white relative">
            {/* Top Bar - Workflow Name / Branding */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-white/80 backdrop-blur-sm">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => setSelectedWorkflow(null)}>
                    <span className="text-xl font-semibold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                        Nexus Assistant
                    </span>
                    {selectedWorkflow && (
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            {selectedWorkflow === 'INTUNE_COPILOT' ? 'Intune Copilot' : 'Application Access'}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></span>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto w-full max-w-3xl mx-auto px-4 pt-16 pb-32">
                {isWelcomeScreen ? (
                    <div className="mt-20 text-left animate-fade-in">
                        <h1 className="text-5xl font-medium text-gray-200 mb-2">Hello, User</h1>
                        <h2 className="text-5xl font-medium text-gray-300 mb-12">How can I help you today?</h2>

                        {!selectedWorkflow ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div
                                    onClick={() => handleWorkflowSelect('INTUNE_COPILOT')}
                                    className="p-6 rounded-xl bg-gray-50 hover:bg-purple-50 border border-transparent hover:border-purple-200 transition-all cursor-pointer group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-1">Intune Copilot</h3>
                                    <p className="text-sm text-gray-500">Manage devices, wipe data, check compliance</p>
                                </div>

                                <div
                                    onClick={() => handleWorkflowSelect('ACCESS_WORKFLOW')}
                                    className="p-6 rounded-xl bg-gray-50 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all cursor-pointer group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-1">Application Access</h3>
                                    <p className="text-sm text-gray-500">Request SAP/M365 access, manage approvals</p>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 rounded-xl bg-gray-50 border border-gray-100">
                                <p className="text-gray-600 mb-4">You have selected <strong>{selectedWorkflow === 'INTUNE_COPILOT' ? 'Intune Copilot' : 'Application Access'}</strong>.</p>
                                <div className="flex gap-2">
                                    <button onClick={() => sendMessage("Check my device compliance")} className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50 transition-colors">Check Compliance</button>
                                    <button onClick={() => sendMessage("Create a new access request")} className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50 transition-colors">New Request</button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {messages.map((msg) => (
                            <div key={msg.id} className="animate-fade-in text-base">
                                {msg.type === 'user' ? (
                                    <div className="flex justify-end mb-6">
                                        <div className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-5 py-3 rounded-2xl rounded-tr-sm max-w-[80%]">
                                            {msg.content}
                                        </div>
                                    </div>
                                ) : msg.type === 'tool' && msg.toolCall ? (
                                    <div className="flex flex-col items-start mb-2">
                                        <div
                                            onClick={() => toggleToolExpansion(msg.id)}
                                            className="cursor-pointer flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 p-2 rounded hover:bg-gray-50 transition-colors select-none"
                                        >
                                            <span className="flex items-center justify-center w-5 h-5 rounded border border-gray-200 bg-white">
                                                {expandedToolIds.has(msg.id) ? (
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                ) : (
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                )}
                                            </span>
                                            <span>Used tool: <span className="font-mono font-medium">{msg.toolCall.name}</span></span>
                                        </div>

                                        {expandedToolIds.has(msg.id) && (
                                            <div className="ml-7 mt-1 w-full max-w-2xl bg-gray-50 border border-gray-100 rounded-md p-3 text-xs overflow-x-auto">
                                                <div className="mb-2">
                                                    <span className="font-semibold text-gray-500 uppercase tracking-wider">Input</span>
                                                    <pre className="mt-1 text-gray-700 font-mono whitespace-pre-wrap">{JSON.stringify(msg.toolCall.parameters, null, 2)}</pre>
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-gray-500 uppercase tracking-wider">Result</span>
                                                    <pre className="mt-1 text-blue-700 font-mono whitespace-pre-wrap">{JSON.stringify(msg.toolCall.response, null, 2)}</pre>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex gap-4 mb-6">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                                            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <div className="prose prose-sm max-w-none text-gray-800">
                                                {msg.content}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-center gap-2 text-gray-400 ml-12 animate-pulse">
                                <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                                <span className="w-2 h-2 rounded-full bg-gray-300 animation-delay-200"></span>
                                <span className="w-2 h-2 rounded-full bg-gray-300 animation-delay-400"></span>
                            </div>
                        )}
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Bottom Input Area - Floating like Gemini */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/0 pointer-events-none p-6">
                <div className="max-w-3xl mx-auto pointer-events-auto">
                    <div className={`bg-gray-100 rounded-3xl p-2 pl-4 transition-all duration-200 ${isListening ? 'ring-2 ring-red-400 shadow-lg' : 'focus-within:ring-2 focus-within:ring-purple-100 focus-within:shadow-md'}`}>
                        <div className="flex items-end gap-2">
                            {/* Input Field */}
                            <textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        sendMessage();
                                    }
                                }}
                                disabled={!selectedWorkflow && messages.length === 0}
                                placeholder={!selectedWorkflow && messages.length === 0 ? "Select a workflow above to start..." : "Ask anything..."}
                                className="w-full bg-transparent border-none focus:ring-0 resize-none py-3 text-gray-800 placeholder-gray-500 max-h-32 scrollbar-hide"
                                rows={1}
                                style={{ minHeight: '48px' }}
                            />

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1 pb-1">
                                <button
                                    onClick={isListening ? stopListening : startListening}
                                    className={`p-3 rounded-full transition-colors ${isListening ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'hover:bg-gray-200 text-gray-600'}`}
                                    title="Voice Input"
                                    disabled={!selectedWorkflow && messages.length === 0}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                                </button>
                                <button
                                    onClick={() => sendMessage()}
                                    disabled={!inputText.trim() || (!selectedWorkflow && messages.length === 0)}
                                    className={`p-3 rounded-full transition-all ${inputText.trim() ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md' : 'text-gray-400 cursor-not-allowed'}`}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                    <p className="text-center text-xs text-gray-400 mt-3 pb-2">
                        Nexus Assistant can make mistakes. Check important info.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AgentStreamsPage;
