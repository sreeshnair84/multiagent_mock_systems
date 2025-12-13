import React, { useState } from 'react';
import { api } from '../services/api';
import type { MOCK_M365_USERS } from '../data/mockData';

export const M365Users: React.FC = () => {
    const [users, setUsers] = useState<typeof MOCK_M365_USERS>([]);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        api.getM365Users()
            .then(data => setUsers(data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="text-center p-10 text-gray-500">Loading users...</div>;

    return (
        <div className="p-8 max-w-6xl mx-auto text-gray-900">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">M365 User Management</h2>
                    <p className="text-gray-400">Manage directory users and licenses</p>
                </div>
                <div className="space-x-2">
                    <button className="bg-white hover:bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 shadow-sm">Export CSV</button>
                    <button className="bg-[#007CC3] hover:bg-blue-600 px-4 py-2 rounded-lg text-sm font-medium text-white shadow-sm">Add User</button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-gray-500 text-sm mb-1">Total Users</div>
                    <div className="text-3xl font-bold text-gray-900">1,248</div>
                    <div className="text-green-600 text-xs mt-2 font-medium">+12 this week</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-gray-500 text-sm mb-1">E5 Licenses Used</div>
                    <div className="text-3xl font-bold text-gray-900">85%</div>
                    <div className="text-yellow-600 text-xs mt-2 font-medium">150 remaining</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-gray-500 text-sm mb-1">Blocked Users</div>
                    <div className="text-3xl font-bold text-gray-900">3</div>
                    <div className="text-gray-500 text-xs mt-2 font-medium">Security automated actions</div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 font-medium">Name</th>
                            <th className="px-6 py-4 font-medium">Email</th>
                            <th className="px-6 py-4 font-medium">Department</th>
                            <th className="px-6 py-4 font-medium">License</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {users.map((u) => (
                            <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900 flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs text-white uppercase">
                                        {u.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <span>{u.name}</span>
                                </td>
                                <td className="px-6 py-4 text-gray-500">{u.email}</td>
                                <td className="px-6 py-4 text-gray-600">{u.department}</td>
                                <td className="px-6 py-4">
                                    <span className="bg-gray-100 px-2 py-1 rounded text-xs border border-gray-200 font-mono text-gray-700">{u.license}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center space-x-1.5 px-2 py-1 rounded-full text-xs font-medium ${u.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`} />
                                        <span>{u.status}</span>
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-gray-400 hover:text-white">...</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
