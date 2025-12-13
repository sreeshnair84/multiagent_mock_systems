import React from 'react';
import { api } from '../services/api';
import type { MOCK_SAP_REQUESTS } from '../data/mockData';

export const SAPAccess: React.FC = () => {
    // Infer type from mock data for now, or define interface
    const [requests, setRequests] = React.useState<typeof MOCK_SAP_REQUESTS>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        api.getSapRequests()
            .then(data => setRequests(data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="text-center p-10 text-gray-500">Loading requests...</div>;

    return (
        <div className="p-8 max-w-6xl mx-auto text-gray-900">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">SAP Access Management</h2>
                    <p className="text-gray-400">Review and approve role assignment requests</p>
                </div>
                <button className="bg-[#007CC3] hover:bg-blue-600 px-4 py-2 rounded-lg text-sm font-medium text-white shadow-sm">
                    New GRC Request
                </button>
            </header>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 font-medium">Request ID</th>
                            <th className="px-6 py-4 font-medium">User</th>
                            <th className="px-6 py-4 font-medium">Requested Role</th>
                            <th className="px-6 py-4 font-medium">Risk Level</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {requests.map((req) => (
                            <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">{req.id}</td>
                                <td className="px-6 py-4 text-gray-600">{req.user}</td>
                                <td className="px-6 py-4 font-mono text-xs text-blue-700 bg-blue-50 rounded inline-block my-3 mx-6 border border-blue-100">{req.role}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${req.risk === 'High' ? 'bg-red-100 text-red-700 border border-red-200' :
                                        req.risk === 'Medium' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                                            'bg-green-100 text-green-700 border border-green-200'
                                        }`}>
                                        {req.risk}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center space-x-1.5 ${req.status === 'Approved' ? 'text-green-600' : 'text-yellow-600'
                                        }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${req.status === 'Approved' ? 'bg-green-500' : 'bg-yellow-500'
                                            }`} />
                                        <span>{req.status}</span>
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {req.status === 'Pending' && (
                                        <div className="flex justify-end space-x-2">
                                            <button className="text-green-700 hover:text-green-800 font-medium text-xs border border-green-200 bg-green-50 px-3 py-1.5 rounded hover:bg-green-100">Approve</button>
                                            <button className="text-red-700 hover:text-red-800 font-medium text-xs border border-red-200 bg-red-50 px-3 py-1.5 rounded hover:bg-red-100">Reject</button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
