import React, { useState, useEffect, useRef } from 'react';
import '../styles/design-system.css';
import { AgentService } from '../services/agentApi';
import type { AgentId } from '../services/agentApi';
import { useToast } from '../context/ToastContext';
import { TypingIndicator } from '../components/chat/TypingIndicator';
import { ToolCallCard } from '../components/chat/ToolCallCard';
import { ConnectionStatus } from '../components/chat/ConnectionStatus';

interface Message {
    id: string;
    type: 'user' | 'agent' | 'tool';
    content: string;
    timestamp: Date;
    isStreaming?: boolean;
    toolCall?: {
        name: string;
        parameters: any;
        response: any;
        executionTime: number;
        isExecuting?: boolean;
    };
}

type Workflow = 'INTUNE_COPILOT' | 'ACCESS_WORKFLOW' | 'RESOURCE_PROVISIONING' | null;

const AgentStreamsPage: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow>(null);
    const [isSoundEnabled, setIsSoundEnabled] = useState(true);
    const [isConnected, setIsConnected] = useState(true);

    const { addToast } = useToast();

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

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const speak = (text: string) => {
        if (!isSoundEnabled) return; // Respect toggle
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(utterance);
        }
    };

    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            try {
                recognitionRef.current.start();
                setIsListening(true);
                addToast("Listening...", "info", 2000);
            } catch (e) {
                console.error(e);
            }
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
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
        setIsConnected(true); // Assume connected when starting

        // Send via A2A Streaming
        let agentId: AgentId = 'intune'; // default
        if (selectedWorkflow === 'ACCESS_WORKFLOW') agentId = 'access';
        if (selectedWorkflow === 'RESOURCE_PROVISIONING') agentId = 'resource';

        const responseId = (Date.now() + 1).toString();
        let currentContent = '';

        // Placeholder message for streaming response
        setMessages(prev => [...prev, {
            id: responseId,
            type: 'agent',
            content: '',
            timestamp: new Date(),
            isStreaming: true
        }]);

        try {
            await AgentService.streamMessage(agentId, text, (event) => {
                console.log('[DEBUG] Received event:', event.type, event);
                if (event.type === 'status_update') {
                    // A2A sends status updates with the accumulated message
                    const statusMessage = event.data?.status?.message || event.data?.message;
                    console.log('[DEBUG] Status message:', statusMessage);
                    if (statusMessage && statusMessage.parts) {
                        const textPart = statusMessage.parts.find((p: any) => p.text);
                        console.log('[DEBUG] Text part:', textPart);
                        if (textPart) {
                            currentContent = textPart.text;
                            console.log('[DEBUG] Setting content:', currentContent);
                            setMessages(prev => {
                                const updated = prev.map(m =>
                                    m.id === responseId ? { ...m, content: currentContent, isStreaming: true } : m
                                );
                                console.log('[DEBUG] Updated messages:', updated);
                                return updated;
                            });
                        }
                    }
                } else if (event.type === 'message_chunk') {
                    currentContent += event.content || '';
                    setMessages(prev => prev.map(m =>
                        m.id === responseId ? { ...m, content: currentContent, isStreaming: true } : m
                    ));
                } else if (event.type === 'tool_call') {
                    addToast(`Agent is using tool: ${event.data.tool_name}`, 'info', 3000);

                    const toolMsg: Message = {
                        id: Date.now().toString(),
                        type: 'tool',
                        content: event.data.tool_name || 'Tool Call',
                        timestamp: new Date(),
                        toolCall: {
                            name: event.data.tool_name,
                            parameters: event.data.parameters,
                            response: event.data.result,
                            executionTime: event.data.duration || 0,
                            isExecuting: !event.data.result
                        }
                    };
                    setMessages(prev => {
                        const last = prev[prev.length - 1];
                        if (last.id === responseId) {
                            return [...prev.slice(0, -1), toolMsg, last];
                        }
                        return [...prev, toolMsg];
                    });
                } else if (event.type === 'error') {
                    setIsConnected(false);
                    addToast(`Error: ${event.content}`, 'error');
                    console.error("Stream Error:", event.content);
                    setMessages(prev => prev.map(m =>
                        m.id === responseId ? { ...m, content: `❌ Error: ${event.content}`, isStreaming: false } : m
                    ));
                }
            });

            console.log('[DEBUG] Stream complete, final content:', currentContent);
            // Mark streaming as complete
            setMessages(prev => {
                const updated = prev.map(m =>
                    m.id === responseId ? { ...m, isStreaming: false } : m
                );
                console.log('[DEBUG] Final messages:', updated);
                return updated;
            });

            if (currentContent) {
                speak(currentContent);
            }
        } catch (error: any) {
            setIsConnected(false);
            addToast(`Connection error: ${error.message}`, 'error');
            setMessages(prev => prev.map(m =>
                m.id === responseId ? { ...m, content: `❌ Failed to connect to agent`, isStreaming: false } : m
            ));
        } finally {
            setIsLoading(false);
        }
    };

    const handleWorkflowSelect = (workflow: Workflow) => {
        setSelectedWorkflow(workflow);
        setMessages([]); // Clear chat on workflow switch? Or keep history? Clean slate is better for "New Chat" feel
    };

    // Render Logic
    const isWelcomeScreen = messages.length === 0 && !isLoading;

    return (
        <div className="h-full flex flex-col bg-gray-50 relative">
            {/* Connection Status */}
            <ConnectionStatus isConnected={isConnected} onRetry={() => window.location.reload()} />
            {/* Top Bar - Simplified for Card Context */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
                {/* Empty or Breadcrumbs */}
            </div>

            {/* Main Content Centered Card - LARGER AND WIDER */}
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="bg-white w-full max-w-5xl h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 relative">

                    {/* Bot Header */}
                    <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between z-20 relative">
                        <div className="flex items-center gap-3 flex-1">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                {selectedWorkflow ? (
                                    <div className="relative group">
                                        <select
                                            value={selectedWorkflow}
                                            onChange={(e) => handleWorkflowSelect(e.target.value as Workflow)}
                                            className="appearance-none bg-transparent font-bold text-gray-900 pr-6 cursor-pointer focus:outline-none focus:underline decoration-dashed underline-offset-4"
                                        >
                                            <option value="INTUNE_COPILOT">Intune Copilot</option>
                                            <option value="ACCESS_WORKFLOW">App Access Bot</option>
                                            <option value="RESOURCE_PROVISIONING">Resource Agent</option>
                                        </select>
                                        <svg className="w-4 h-4 text-gray-500 absolute left-[calc(100%-1.5rem)] top-1 pointer-events-none hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                        <p className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        <h3 className="font-bold text-gray-900">Enterprise Hub bot</h3>
                                        <p className="text-xs text-gray-500">Select an agent to start</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Audio Toggle */}
                            {selectedWorkflow && (
                                <button
                                    onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                                    className={`p-2 rounded-full transition-colors ${isSoundEnabled ? 'text-purple-600 bg-purple-50' : 'text-gray-400 hover:bg-gray-100'}`}
                                    title={isSoundEnabled ? "Mute Text-to-Speech" : "Enable Text-to-Speech"}
                                >
                                    {isSoundEnabled ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                                    )}
                                </button>
                            )}

                            <button onClick={() => setSelectedWorkflow(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 scroll-smooth">
                        {isWelcomeScreen ? (
                            <div className="text-center mt-8 animate-fade-in">
                                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 scale-100 hover:scale-105 transition-transform">
                                    <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 mb-2">Enterprise Hub bot</h2>
                                <p className="text-sm text-gray-500 mb-8 px-4 leading-relaxed">
                                    Hey! I'm here to help. Select a specific agent below or choose from the dropdown menu to get started.
                                </p>

                                <div className="grid grid-cols-2 gap-3 px-2">
                                    <button
                                        onClick={() => handleWorkflowSelect('ACCESS_WORKFLOW')}
                                        className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-purple-200 transition-all text-left flex flex-col items-center gap-2 group"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </div>
                                        <span className="text-xs font-semibold text-gray-700">App Access</span>
                                    </button>

                                    <button
                                        onClick={() => handleWorkflowSelect('RESOURCE_PROVISIONING')}
                                        className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-purple-200 transition-all text-left flex flex-col items-center gap-2 group"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-green-50 group-hover:bg-green-100 flex items-center justify-center transition-colors">
                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                        </div>
                                        <span className="text-xs font-semibold text-gray-700">Resources</span>
                                    </button>

                                    <button
                                        onClick={() => handleWorkflowSelect('INTUNE_COPILOT')}
                                        className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-purple-200 transition-all text-left flex flex-col items-center gap-2 group col-span-2"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-purple-50 group-hover:bg-purple-100 flex items-center justify-center transition-colors">
                                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                        </div>
                                        <span className="text-xs font-semibold text-gray-700">Intune Copilot</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 pb-4">
                                {messages.map((msg) => (
                                    <React.Fragment key={msg.id}>
                                        {msg.type === 'tool' ? (
                                            <ToolCallCard
                                                toolName={msg.toolCall?.name || 'Unknown Tool'}
                                                parameters={msg.toolCall?.parameters}
                                                result={msg.toolCall?.response}
                                                executionTime={msg.toolCall?.executionTime}
                                                isExecuting={msg.toolCall?.isExecuting}
                                            />
                                        ) : (
                                            <div className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start items-end gap-2'}`}>
                                                {msg.type !== 'user' && (
                                                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mb-1">
                                                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                                    </div>
                                                )}

                                                <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.type === 'user'
                                                    ? 'bg-purple-600 text-white rounded-tr-sm'
                                                    : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
                                                    }`}>
                                                    <div className="markdown-body whitespace-pre-wrap">
                                                        {msg.content}
                                                        {msg.isStreaming && (
                                                            <span className="inline-block w-1 h-4 ml-1 bg-purple-600 animate-pulse"></span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </React.Fragment>
                                ))}
                                {isLoading && messages[messages.length - 1]?.type !== 'agent' && (
                                    <TypingIndicator agentName={selectedWorkflow === 'ACCESS_WORKFLOW' ? 'Access Agent' : selectedWorkflow === 'RESOURCE_PROVISIONING' ? 'Resource Agent' : 'Intune Agent'} />
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {/* Footer Input */}
                    <div className="p-4 bg-white border-t border-gray-100 z-20">
                        <div className="relative group">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        sendMessage();
                                    }
                                }}
                                disabled={!selectedWorkflow && messages.length === 0}
                                placeholder={isListening ? "Listening..." : (!selectedWorkflow && messages.length === 0 ? "Select an agent above..." : "Ask a question...")}
                                className={`w-full pl-5 pr-20 py-3.5 border rounded-full text-sm focus:outline-none focus:ring-2 transition-all shadow-sm group-hover:bg-white
                                    ${isListening
                                        ? 'bg-red-50 border-red-200 focus:border-red-500 focus:ring-red-100 text-red-600 placeholder-red-400'
                                        : 'bg-gray-50 border-gray-200 focus:border-purple-500 focus:ring-purple-100'
                                    }`}
                            />

                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                                {/* Microphone Button */}
                                <button
                                    onClick={() => isListening ? stopListening() : startListening()}
                                    className={`p-2 rounded-full transition-colors ${isListening
                                        ? 'bg-red-100 text-red-600 animate-pulse'
                                        : 'text-gray-400 hover:text-purple-600 hover:bg-gray-100'
                                        }`}
                                    title={isListening ? "Stop Listening" : "Voice Input"}
                                >
                                    {isListening ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                                    )}
                                </button>

                                {/* Send Button */}
                                <button
                                    onClick={() => sendMessage()}
                                    disabled={!inputText.trim() || (!selectedWorkflow && messages.length === 0)}
                                    className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:bg-gray-300 shadow-sm"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                </button>
                            </div>
                        </div>
                        <p className="text-[10px] text-center text-gray-400 mt-2">
                            AI can make mistakes. Verify important info.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AgentStreamsPage;
