import React from 'react';

interface HeaderProps {
    toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-20 shadow-sm">
            <div className="flex items-center space-x-4">
                <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-[#007CC3] transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <div className="hidden md:flex items-center text-gray-400 bg-gray-50 rounded-lg px-3 py-1.5 w-64 border border-gray-200 focus-within:border-[#007CC3] focus-within:ring-1 focus-within:ring-[#007CC3]/20 transition-all">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-transparent border-none outline-none text-sm text-gray-700 w-full placeholder-gray-400"
                    />
                </div>
            </div>

            <div className="flex items-center space-x-4">
                <button className="p-2 text-gray-400 hover:text-[#007CC3] relative">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </button>

                <div className="h-8 w-px bg-gray-200 mx-2"></div>

                <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#007CC3] to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                        JD
                    </div>
                    <div className="hidden md:block">
                        <p className="text-sm font-medium text-gray-700">John Doe</p>
                        <p className="text-xs text-gray-500">IT Admin</p>
                    </div>
                </div>
            </div>
        </header>
    );
};
