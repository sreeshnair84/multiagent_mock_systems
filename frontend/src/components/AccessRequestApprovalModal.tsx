import React, { useState } from 'react';
import { accessRequestsApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import '../styles/design-system.css';

interface AccessRequestApprovalModalProps {
    isOpen: boolean;
    onClose: () => void;
    request: any;
    onRequestUpdated: () => void;
}

const AccessRequestApprovalModal: React.FC<AccessRequestApprovalModalProps> = ({ isOpen, onClose, request, onRequestUpdated }) => {
    const { user } = useAuth();
    const [remarks, setRemarks] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen || !request) return null;

    const handleAction = async (actionType: 'approve' | 'reject') => {
        // Require remarks for rejection
        if (actionType === 'reject' && !remarks.trim()) {
            alert('Please provide remarks for rejection.');
            return;
        }

        setIsSubmitting(true);
        try {
            if (actionType === 'approve') {
                await accessRequestsApi.approve(request.request_id, user?.email || 'admin@Enterprise Hub.com');
            } else {
                await accessRequestsApi.reject(request.request_id, user?.email || 'admin@Enterprise Hub.com', remarks);
            }

            onRequestUpdated();
            onClose();
            setRemarks('');
        } catch (error) {
            console.error('Failed to process request', error);
            alert(`Failed to ${actionType} request`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const riskColor = (level: string) => {
        switch (level?.toLowerCase()) {
            case 'high': return 'text-red-600 bg-red-100 border-red-200';
            case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
            default: return 'text-green-600 bg-green-100 border-green-200';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="glass-card w-full max-w-lg relative z-10 animate-scale-in p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Review Access Request</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="flex items-start justify-between bg-gray-50 p-4 rounded-lg">
                        <div>
                            <p className="text-sm text-gray-500  mb-1">Request for</p>
                            <p className="font-semibold text-gray-900">{request.user_email}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${riskColor(request.risk_level)}`}>
                            {request.risk_level?.toUpperCase()} RISK
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="block text-gray-500">Resource</span>
                            <span className="font-medium text-gray-900">{request.resource}</span>
                        </div>
                        <div>
                            <span className="block text-gray-500">Permission</span>
                            <span className="font-medium text-gray-900">{request.action}</span>
                        </div>
                    </div>

                    <div>
                        <span className="block text-sm text-gray-500 mb-1">Business Justification</span>
                        <div className="bg-white border border-gray-200 p-3 rounded-lg text-sm text-gray-700">
                            {request.business_justification}
                        </div>
                    </div>

                    {request.status !== 'Pending' ? (
                        <div className="bg-gray-100 p-4 rounded-lg text-center text-gray-500">
                            This request has already been processed ({request.status}).
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Remarks <span className="text-gray-400">(Optional for Approval)</span>
                            </label>
                            <textarea
                                className="input h-24 resize-none"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                placeholder="Enter approval or rejection comments..."
                            />
                        </div>
                    )}

                    {request.status === 'Pending' && (
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => handleAction('reject')}
                                className={`flex-1 btn bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={isSubmitting}
                            >
                                Reject
                            </button>
                            <button
                                onClick={() => handleAction('approve')}
                                className={`flex-1 btn bg-green-600 text-white hover:bg-green-700 border-transparent ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={isSubmitting}
                            >
                                Approve
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AccessRequestApprovalModal;
