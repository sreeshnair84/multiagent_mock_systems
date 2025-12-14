import React, { useState, useEffect } from 'react';
import { accessRequestsApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import AccessRequestCreateModal from '../components/AccessRequestCreateModal';
import AccessRequestApprovalModal from '../components/AccessRequestApprovalModal';
import '../styles/design-system.css';

interface AccessRequest {
    request_id: string;
    user_email: string;
    resource: string;
    action: string;
    status: string;
    risk_level: string;
    submitted_date: string;
    business_justification: string; // Ensure this is in interface
}

const AccessRequestsPage: React.FC = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState<AccessRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);
    const [filters, setFilters] = useState({
        status: '',
        risk_level: ''
    });

    useEffect(() => {
        loadRequests();
    }, [filters]);

    const loadRequests = async () => {
        setIsLoading(true);
        try {
            const activeFilters = Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v !== '')
            );
            const data = await accessRequestsApi.list(activeFilters);
            setRequests(data);
        } catch (error) {
            console.error('Failed to load access requests', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReview = (request: AccessRequest) => {
        setSelectedRequest(request);
        setShowApprovalModal(true);
    };

    const riskColor = (r: string) => {
        switch (r?.toLowerCase()) {
            case 'critical': return 'badge-danger';
            case 'high': return 'badge-warning';
            case 'medium': return 'badge-info';
            default: return 'badge-success';
        }
    };

    const statusColor = (s: string) => {
        switch (s.toLowerCase()) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const canApprove = (req: AccessRequest) => {
        return req.status === 'Pending' && (user?.role === 'admin' || user?.role === 'approver');
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Create Modal */}
            <AccessRequestCreateModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onRequestCreated={loadRequests}
            />

            {/* Approval Modal */}
            <AccessRequestApprovalModal
                isOpen={showApprovalModal}
                onClose={() => setShowApprovalModal(false)}
                request={selectedRequest}
                onRequestUpdated={loadRequests}
            />

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Access Requests</h1>
                    <p className="text-gray-500">Manage resource access and approvals</p>
                </div>
                <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Request
                </button>
            </div>

            {/* Filters */}
            <div className="glass-card-light p-4 flex gap-4 items-center">
                <select
                    className="input w-48"
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                    <option value="">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                </select>

                <select
                    className="input w-48"
                    value={filters.risk_level}
                    onChange={(e) => setFilters({ ...filters, risk_level: e.target.value })}
                >
                    <option value="">All Risks</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                </select>
            </div>

            {/* Requests List */}
            {isLoading ? (
                <div className="flex justify-center p-12">
                    <div className="spinner"></div>
                </div>
            ) : (
                <div className="glass-card overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource & Action</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {requests.map((req) => (
                                <tr key={req.request_id} className={`hover:bg-gray-50 transition-colors ${canApprove(req) ? 'bg-yellow-50/20' : ''}`}>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-purple-600">{req.request_id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.user_email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="font-medium text-gray-900">{req.resource}</div>
                                        <div className="text-xs">{req.action}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`badge ${riskColor(req.risk_level)}`}>
                                            {req.risk_level}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor(req.status)}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(req.submitted_date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {canApprove(req) ? (
                                            <button
                                                onClick={() => handleReview(req)}
                                                className="text-primary hover:text-primary-hover border border-primary/30 px-3 py-1 rounded hover:bg-primary/5 transition-colors"
                                            >
                                                Review
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleReview(req)}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                Details
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {requests.length === 0 && (
                        <div className="text-center p-8 text-gray-500">
                            No access requests found.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AccessRequestsPage;
