import React from 'react';
import { api } from '../services/api';
import type { MOCK_TICKETS } from '../data/mockData';

export const ServiceNowTickets: React.FC = () => {
    const [tickets, setTickets] = React.useState<typeof MOCK_TICKETS>([]);

    React.useEffect(() => {
        api.getServiceNowTickets().then(setTickets);
    }, []);

    return (
        <div className="p-8 max-w-full mx-auto text-gray-100 h-full flex flex-col">
            <header className="mb-6 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <span className="text-3xl">🎫</span>
                    <div>
                        <h2 className="text-2xl font-bold">Service Operations Workspace</h2>
                        <p className="text-gray-400">Incidents, Requests, and Changes</p>
                    </div>
                </div>
                <div className="flex space-x-3">
                    <input type="text" placeholder="Search tickets..." className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500 w-64" />
                    <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm font-bold">Create New</button>
                </div>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                {[{ label: 'Open Incidents', val: 12, color: 'text-red-400' }, { label: 'Unassigned', val: 5, color: 'text-yellow-400' }, { label: 'SLA Breached', val: 1, color: 'text-red-500' }, { label: 'My Work', val: 3, color: 'text-blue-400' }].map((k, i) => (
                    <div key={i} className="bg-gray-800 p-4 rounded border-t-4 border-t-blue-500 shadow-lg">
                        <div className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">{k.label}</div>
                        <div className={`text-3xl font-bold ${k.color}`}>{k.val}</div>
                    </div>
                ))}
            </div>

            {/* List */}
            <div className="bg-gray-800 rounded border border-gray-700 flex-1 overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-900 border-b border-gray-700 text-gray-400">
                            <tr>
                                <th className="px-4 py-3 font-medium">Number</th>
                                <th className="px-4 py-3 font-medium">Short Description</th>
                                <th className="px-4 py-3 font-medium">Priority</th>
                                <th className="px-4 py-3 font-medium">State</th>
                                <th className="px-4 py-3 font-medium">Assigned To</th>
                                <th className="px-4 py-3 font-medium">Updated</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {tickets.map((t) => (
                                <tr key={t.id} className="hover:bg-gray-750 transition-colors cursor-pointer group">
                                    <td className="px-4 py-3 text-blue-400 font-medium group-hover:underline">{t.id}</td>
                                    <td className="px-4 py-3 text-gray-200">{t.summary}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded text-xs border ${t.priority.startsWith('1') ? 'bg-red-900/40 text-red-300 border-red-800' :
                                            t.priority.startsWith('2') ? 'bg-orange-900/40 text-orange-300 border-orange-800' :
                                                'bg-gray-700 text-gray-300 border-gray-600'
                                            }`}>
                                            {t.priority}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-400">{t.state}</td>
                                    <td className="px-4 py-3 text-gray-400">{t.assignedTo || <span className="text-gray-600 italic">Unassigned</span>}</td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">{t.updated}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
