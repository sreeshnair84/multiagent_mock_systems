import React from 'react';

import type { Message } from '../../types/chat';

interface ChatBubbleProps {
    message: Message;
    isStreaming?: boolean;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isStreaming }) => {
    const isUser = message.role === 'user';

    return (
        <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-4xl ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar Placeholder */}
                <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${isUser ? 'bg-[#007CC3] ml-3' : 'bg-purple-600 mr-3'
                    }`}>
                    <span className="text-xs font-bold text-white">
                        {isUser ? 'U' : (message.agentName?.[0] || 'A')}
                    </span>
                </div>

                <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                    {/* Metadata */}
                    <div className="flex items-center space-x-2 mb-1 opacity-70 text-xs">
                        <span className="font-medium text-gray-700">
                            {isUser ? 'You' : (message.agentName || 'Assistant')}
                        </span>
                        <span className="text-gray-500">
                            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>

                    {/* Bubble Content */}
                    <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${isUser
                        ? 'bg-[#007CC3] text-white rounded-tr-sm'
                        : 'bg-white border border-gray-200 text-gray-900 rounded-tl-sm shadow-sm'
                        }`}>
                        {/* Using simple div for now, could upgrade to ReactMarkdown */}
                        <div className="whitespace-pre-wrap font-sans">
                            {message.content}
                            {isStreaming && (
                                <span className="inline-block w-2 h-4 ml-1 align-middle bg-blue-400 animate-pulse" />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
