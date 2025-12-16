import React, { useState } from 'react';

interface ToolCallCardProps {
    toolName: string;
    parameters?: any;
    result?: any;
    executionTime?: number;
    isExecuting?: boolean;
}

export const ToolCallCard: React.FC<ToolCallCardProps> = ({
    toolName,
    parameters,
    result,
    executionTime = 0,
    isExecuting = false
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="flex items-start gap-2 my-3 animate-fade-in">
            {/* Tool Icon */}
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </div>

            {/* Tool Card */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-2xl rounded-tl-sm shadow-sm max-w-[85%] overflow-hidden">
                {/* Header */}
                <div className="px-4 py-2 bg-white/50 border-b border-blue-200/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {isExecuting && (
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                        )}
                        <span className="text-xs font-semibold text-blue-900">
                            {isExecuting ? 'Executing Tool' : 'Tool Executed'}
                        </span>
                    </div>
                    {executionTime > 0 && (
                        <span className="text-[10px] text-blue-600 font-mono">
                            {executionTime.toFixed(2)}s
                        </span>
                    )}
                </div>

                {/* Tool Name */}
                <div className="px-4 py-3">
                    <div className="flex items-center gap-2 mb-2">
                        <code className="text-sm font-mono font-bold text-purple-700 bg-white/70 px-2 py-1 rounded">
                            {toolName}
                        </code>
                        {isExecuting && (
                            <div className="flex gap-1">
                                <span className="w-1 h-1 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-1 h-1 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-1 h-1 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                        )}
                    </div>

                    {/* Expandable Details */}
                    {(parameters || result) && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors"
                        >
                            {isExpanded ? 'Hide Details' : 'View Details'}
                            <svg
                                className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    )}

                    {/* Expanded Content */}
                    {isExpanded && (
                        <div className="mt-3 space-y-2 animate-fade-in">
                            {parameters && (
                                <div>
                                    <p className="text-[10px] font-semibold text-gray-600 mb-1">Parameters:</p>
                                    <pre className="text-[10px] bg-white/70 rounded p-2 overflow-x-auto font-mono text-gray-700 border border-blue-100">
                                        {JSON.stringify(parameters, null, 2)}
                                    </pre>
                                </div>
                            )}
                            {result && !isExecuting && (
                                <div>
                                    <p className="text-[10px] font-semibold text-gray-600 mb-1">Result:</p>
                                    <pre className="text-[10px] bg-white/70 rounded p-2 overflow-x-auto font-mono text-gray-700 border border-blue-100 max-h-40">
                                        {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
