import React from 'react';

interface TypingIndicatorProps {
    agentName?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ agentName = 'Agent' }) => {
    return (
        <div className="flex items-start gap-2 animate-fade-in">
            {/* Agent Avatar */}
            <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            </div>

            {/* Typing Bubble */}
            <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">{agentName} is thinking...</p>
            </div>
        </div>
    );
};
