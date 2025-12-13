import React from 'react';
import type { Agent } from '../../types/chat';

interface AgentSelectorProps {
    agents: Agent[];
    selectedAgentId: string;
    onSelect: (id: string) => void;
}

export const AgentSelector: React.FC<AgentSelectorProps> = ({ agents, selectedAgentId, onSelect }) => {
    return (
        <div className="flex space-x-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
            {agents.map((agent) => {
                const isSelected = agent.id === selectedAgentId;
                return (
                    <button
                        key={agent.id}
                        onClick={() => onSelect(agent.id)}
                        className={`
              flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all
              ${isSelected
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 border border-blue-500'
                                : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700 hover:text-gray-200'
                            }
            `}
                    >
                        <span>{agent.name}</span>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                    </button>
                );
            })}
        </div>
    );
};
