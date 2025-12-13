import React from 'react';

interface SidebarProps {
    currentView: string;
    onNavigate: (view: string) => void;
    isCollapsed: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, isCollapsed }) => {
    const navItems = [
        { id: 'chat', label: 'Chat Agent', icon: '💬' },
        { id: 'm365', label: 'M365 Users', icon: '👥' },
        { id: 'sap', label: 'SAP Access', icon: '🔐' },
        { id: 'outlook', label: 'Outlook', icon: '📧' },
        { id: 'intune', label: 'Intune', icon: '📱' },
        { id: 'snow', label: 'ServiceNow', icon: '🎫' },
    ];

    return (
        <div className={`hidden md:flex flex-col transition-all duration-300 ease-in-out bg-white border-r border-gray-200 ${isCollapsed ? 'w-20' : 'w-64'}`}>
            <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : ''} overflow-hidden`}>
                <h1 className="text-xl font-bold text-[#007CC3] whitespace-nowrap">
                    {isCollapsed ? 'AG' : 'Antigravity'}
                </h1>
                {!isCollapsed && <p className="text-xs text-gray-500 mt-1 ml-2 opacity-0 group-hover:opacity-100 hidden">Enterprise Agent Platform</p>}
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all group ${isCollapsed ? 'justify-center' : 'space-x-3'
                            } ${currentView === item.id
                                ? 'bg-[#007CC3]/10 text-[#007CC3] border border-[#007CC3]/20'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        title={isCollapsed ? item.label : ''}
                    >
                        <span className="text-lg">{item.icon}</span>
                        {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-200">
                <button className={`flex items-center w-full text-gray-400 hover:text-gray-600 transition-colors ${isCollapsed ? 'justify-center' : 'space-x-3 px-4'}`}>
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {!isCollapsed && <span className="text-sm whitespace-nowrap">Settings</span>}
                </button>
            </div>
        </div>
    );
};
