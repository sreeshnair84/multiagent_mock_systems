import React, { useState, useEffect, useRef } from 'react';
import './index.css';
import type { Agent, Message, ServerEvent } from './types/chat';
import { ChatBubble } from './components/chat/ChatBubble';
import { AgentSelector } from './components/chat/AgentSelector';

const MOCK_AGENTS: Agent[] = [
  { id: 'supervisor', name: 'Supervisor Agent', description: 'Orchestrates other agents' },
  { id: 'servicenow', name: 'ServiceNow Agent', description: 'ITOps tickets' },
  { id: 'intune', name: 'Intune Agent', description: 'Device management' },
  { id: 'access', name: 'Access Agent', description: 'SAP & Permissions' },
];

import { Sidebar } from './components/dashboard/Sidebar';
import { Header } from './components/dashboard/Header'; // New import
import { SAPAccess } from './pages/SAPAccess';
import { M365Users } from './pages/M365Users';
import { IntuneDevices } from './pages/IntuneDevices';
import { OutlookInbox } from './pages/OutlookInbox';
import { ServiceNowTickets } from './pages/ServiceNowTickets';

function App() {
  const [currentView, setCurrentView] = useState('chat');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I am the Supervisor Agent. How can I help you today?',
      agentName: 'Supervisor Agent',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState("");
  const [selectedAgent, setSelectedAgent] = useState('supervisor');
  const [isStreaming, setIsStreaming] = useState(false);

  // WebSocket State
  const wsRef = useRef<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [clientId] = useState(() => Math.floor(Math.random() * 1000000).toString());

  // Auto-scroll logic 
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming, currentView]);

  // WebSocket Connection (omitted for brevity, unchanged)
  useEffect(() => {
    const socket = new WebSocket(`ws://localhost:8000/ws/chat/${clientId}`);
    wsRef.current = socket;
    socket.onopen = () => console.log('WS Connected');
    socket.onmessage = (event) => {
      try {
        const data: ServerEvent = JSON.parse(event.data);
        handleServerEvent(data);
      } catch (e) {
        console.error("Failed to parse event", event.data);
      }
    };
    return () => socket.close();
  }, [clientId]);

  const handleServerEvent = (event: ServerEvent) => {
    // (same logic as before)
    if (event.type === 'token') {
      setIsStreaming(true);
      setMessages(prev => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg.role === 'assistant' && lastMsg.id === 'streaming_placeholder') {
          return [...prev.slice(0, -1), { ...lastMsg, content: lastMsg.content + event.value }];
        } else {
          return [...prev, { id: 'streaming_placeholder', role: 'assistant', content: event.value, agentName: 'Supervisor Agent', timestamp: Date.now() }];
        }
      });
    } else if (event.type === 'message') {
      setIsStreaming(false);
      setMessages(prev => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg.id === 'streaming_placeholder') {
          return [...prev.slice(0, -1), { ...lastMsg, id: `msg_${Date.now()}` }];
        }
        return prev;
      });
    }
  };

  const sendMessage = () => {
    if (!input.trim() || !wsRef.current) return;
    const userMsg: Message = { id: `usr_${Date.now()}`, role: 'user', content: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    wsRef.current.send(input);
    setInput("");
    setIsStreaming(true);
  };

  return (
    <div className="flex h-screen bg-[#F5F6FA] text-gray-900 font-sans overflow-hidden">
      {/* Collapsible Sidebar */}
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        isCollapsed={isSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative w-full h-full overflow-hidden">
        {/* Navbar Header */}
        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {currentView === 'chat' ? (
          <>
            {/* Sub-Header / Agent Selector (Optional: keep or move to Header) */}
            {/* We can keep Agent Selector as a local tool bar for Chat view */}
            <div className="px-6 py-3 bg-white/50 border-b border-gray-200 z-10 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Agent</span>
              <AgentSelector
                agents={MOCK_AGENTS}
                selectedAgentId={selectedAgent}
                onSelect={setSelectedAgent}
              />
            </div>

            {/* Messages */}
            <main className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth bg-gray-50/50" ref={scrollRef}>
              <div className="max-w-4xl mx-auto w-full pt-8 pb-12">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center mt-20 opacity-0 animate-fadeIn">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                      <span className="text-3xl">👋</span>
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">Welcome to Antigravity</h2>
                    <p className="text-gray-500 max-w-md">
                      I'm your AI super-agent. I can help you with IT tickets, M365 management, permissions, and more.
                    </p>
                  </div>
                )}
                {messages.map((msg) => (
                  <ChatBubble
                    key={msg.id}
                    message={msg}
                    isStreaming={msg.id === 'streaming_placeholder' && isStreaming}
                  />
                ))}
              </div>
            </main>

            {/* Input Area */}
            <footer className="p-6 bg-transparent shrink-0">
              <div className="max-w-4xl mx-auto w-full bg-white rounded-2xl flex items-center p-3 border border-gray-200 shadow-xl shadow-blue-900/5 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50 transition-all duration-300">
                <button className="p-2 text-gray-400 hover:text-[#007CC3] hover:bg-blue-50 transition-colors rounded-xl mx-1">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder={`Ask ${MOCK_AGENTS.find(a => a.id === selectedAgent)?.name || 'Antigravity'} anything...`}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-gray-800 placeholder-gray-400 mx-3 text-base py-2 outline-none"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className={`p-2.5 rounded-xl transition-all duration-200 transform ${input.trim()
                      ? 'bg-[#007CC3] text-white shadow-lg hover:bg-blue-600 hover:shadow-blue-500/25 hover:scale-105 active:scale-95'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
              </div>
              <div className="text-center mt-3 text-xs text-gray-400 font-medium">
                Antigravity can make mistakes. Verify important info.
              </div>
            </footer>
          </>
        ) : currentView === 'sap' ? (
          <SAPAccess />
        ) : currentView === 'm365' ? (
          <M365Users />
        ) : currentView === 'intune' ? (
          <IntuneDevices />
        ) : currentView === 'outlook' ? (
          <OutlookInbox />
        ) : currentView === 'snow' ? (
          <ServiceNowTickets />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-400 mb-2">Work In Progress</h2>
              <p>The {currentView} module is currently under development.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
