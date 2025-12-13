import React from 'react';

import { api } from '../services/api';
import type { MOCK_INTUNE_DEVICES } from '../data/mockData';

export const IntuneDevices: React.FC = () => {
    const [devices, setDevices] = React.useState<typeof MOCK_INTUNE_DEVICES>([]);

    React.useEffect(() => {
        api.getIntuneDevices().then(setDevices);
    }, []);

    return (
        <div className="p-8 max-w-6xl mx-auto text-gray-100">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Intune Device Management</h2>
                    <p className="text-gray-400">Monitor device compliance and health</p>
                </div>
                <div className="space-x-2">
                    <button className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-medium">Enroll Device</button>
                </div>
            </header>

            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-900/50 text-gray-400 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4 font-medium">Device Name</th>
                            <th className="px-6 py-4 font-medium">Primary User</th>
                            <th className="px-6 py-4 font-medium">OS</th>
                            <th className="px-6 py-4 font-medium">Compliance</th>
                            <th className="px-6 py-4 font-medium">Last Sync</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {devices.map((d) => (
                            <tr key={d.id} className="hover:bg-gray-700/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-white">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-lg text-gray-500">
                                            {d.os.includes('Windows') ? '💻' : d.os.includes('mac') ? '🍏' : '📱'}
                                        </span>
                                        <span>{d.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-300">{d.user}</td>
                                <td className="px-6 py-4 text-gray-400">{d.os}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center space-x-1.5 px-2 py-1 rounded text-xs font-medium border ${d.compliance === 'Compliant'
                                        ? 'bg-green-900/20 text-green-400 border-green-900'
                                        : 'bg-red-900/20 text-red-400 border-red-900'
                                        }`}>
                                        {d.compliance === 'Compliant' && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                                        {d.compliance === 'Non-Compliant' && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                                        <span>{d.compliance}</span>
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-500">{d.lastSync}</td>
                                <td className="px-6 py-4 text-right text-gray-400 hover:text-white cursor-pointer">
                                    Manage
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
