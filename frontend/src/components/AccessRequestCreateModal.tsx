import React, { useState } from 'react';
import { accessRequestsApi } from '../services/api';
import '../styles/design-system.css';

interface AccessRequestCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRequestCreated: () => void;
}

const AccessRequestCreateModal: React.FC<AccessRequestCreateModalProps> = ({ isOpen, onClose, onRequestCreated }) => {
    const [formData, setFormData] = useState({
        user_email: '',
        resource: '',
        action: 'Read',
        business_justification: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await accessRequestsApi.create(formData);
            onRequestCreated();
            onClose();
        } catch (error) {
            console.error('Failed to create access request', error);
            alert('Failed to create access request');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="glass-card w-full max-w-lg relative z-10 animate-scale-in flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">New Access Request</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">User Email</label>
                        <input
                            type="email"
                            required
                            className="input w-full"
                            value={formData.user_email}
                            onChange={(e) => setFormData({ ...formData, user_email: e.target.value })}
                            placeholder="user@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Resource</label>
                        <select
                            required
                            className="input w-full"
                            value={formData.resource}
                            onChange={(e) => setFormData({ ...formData, resource: e.target.value })}
                        >
                            <option value="">Select Resource...</option>
                            <option value="SAP Finance">SAP Finance Module</option>
                            <option value="SAP HR">SAP HR Module</option>
                            <option value="AWS Production">AWS Production Environment</option>
                            <option value="Azure DevOps">Azure DevOps Project</option>
                            <option value="SharePoint Confidential">SharePoint Confidential Site</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Action</label>
                        <select
                            className="input w-full"
                            value={formData.action}
                            onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                        >
                            <option value="Read">Read Access</option>
                            <option value="Write">Write Access</option>
                            <option value="Admin">Admin Privileges</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Business Justification</label>
                        <textarea
                            required
                            className="input w-full h-24 resize-none"
                            value={formData.business_justification}
                            onChange={(e) => setFormData({ ...formData, business_justification: e.target.value })}
                            placeholder="Why do you need this access?"
                        />
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-sm text-blue-800 flex items-start gap-3">
                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <p>Requests for <strong>Admin privileges</strong> or <strong>Sensitive resources</strong> may require multi-level approval.</p>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                            {isSubmitting ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AccessRequestCreateModal;
