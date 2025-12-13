import React, { useState } from 'react';
import { api } from '../services/api';
import type { MOCK_EMAILS } from '../data/mockData';

export const OutlookInbox: React.FC = () => {
    const [emails, setEmails] = useState<typeof MOCK_EMAILS>([]);

    React.useEffect(() => {
        api.getOutlookEmails().then(setEmails);
    }, []);

    return (
        <div className="flex h-full text-gray-100 bg-white dark:bg-gray-900 border-l border-gray-800">
            {/* Folder List */}
            <div className="w-64 flex-shrink-0 bg-gray-50 dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 p-4">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 mb-6 text-sm font-medium">New Message</button>
                <div className="space-y-1">
                    <div className="flex justify-between items-center px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded cursor-pointer">
                        <span className="text-sm font-medium">Inbox</span>
                        <span className="text-xs font-bold">2</span>
                    </div>
                    {['Sent Items', 'Drafts', 'Deleted', 'Archive', 'Junk Email'].map(folder => (
                        <div key={folder} className="px-3 py-2 text-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 rounded cursor-pointer text-sm">
                            {folder}
                        </div>
                    ))}
                </div>
            </div>

            {/* Email List */}
            <div className="w-96 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
                    <h2 className="font-bold text-lg">Inbox</h2>
                    <span className="text-xs text-gray-500">Filter</span>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {emails.map(email => (
                        <div key={email.id} className={`p-4 border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 ${email.unread ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}>
                            <div className="flex justify-between items-start mb-1">
                                <span className={`text-sm ${email.unread ? 'font-bold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'}`}>
                                    {email.from}
                                </span>
                                <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{email.time}</span>
                            </div>
                            <div className={`text-sm mb-1 ${email.unread ? 'font-semibold text-gray-800 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}>
                                {email.subject}
                            </div>
                            <div className="text-xs text-gray-500 line-clamp-2">
                                {email.preview}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Reading Pane */}
            <div className="flex-1 bg-gray-50 dark:bg-gray-950 p-8 flex flex-col justify-center items-center text-gray-400">
                <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <p className="text-lg font-medium">Select an item to read</p>
                <p className="text-sm mt-1">Nothing is selected</p>
            </div>
        </div>
    );
};
