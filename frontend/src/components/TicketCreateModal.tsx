import React, { useState } from 'react';
import { ticketsApi } from '../services/api';
import '../styles/design-system.css';

interface TicketCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTicketCreated: () => void;
}

const TicketCreateModal: React.FC<TicketCreateModalProps> = ({ isOpen, onClose, onTicketCreated }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'Medium',
        urgency: 'Medium',
        assignment_group: '',
        requester_email: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await ticketsApi.create(formData);
            onTicketCreated();
            onClose();
        } catch (error) {
            console.error('Failed to create ticket', error);
            alert('Failed to create ticket');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="glass-card w-full max-w-lg relative z-10 animate-scale-in flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Create New Ticket</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                        <input
                            type="text"
                            required
                            className="input w-full"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Brief summary of the issue"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                        <textarea
                            required
                            className="input w-full h-32 resize-none"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Detailed description..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                            <select
                                className="input w-full"
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Critical">Critical</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Urgency</label>
                            <select
                                className="input w-full"
                                value={formData.urgency}
                                onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Assignment Group</label>
                        <select
                            className="input w-full"
                            value={formData.assignment_group}
                            onChange={(e) => setFormData({ ...formData, assignment_group: e.target.value })}
                        >
                            <option value="">Select Group...</option>
                            <option value="IT Support L1">IT Support L1</option>
                            <option value="Network Team">Network Team</option>
                            <option value="Database Team">Database Team</option>
                            <option value="Security Ops">Security Ops</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Requester Email</label>
                        <input
                            type="email"
                            required
                            className="input w-full"
                            value={formData.requester_email}
                            onChange={(e) => setFormData({ ...formData, requester_email: e.target.value })}
                            placeholder="user@example.com"
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                            {isSubmitting ? 'Creating...' : 'Create Ticket'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TicketCreateModal;
