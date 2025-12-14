import React, { useState, useEffect } from 'react';
import { ticketsApi } from '../services/api';
import '../styles/design-system.css';

interface TicketEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    ticket: any;
    onTicketUpdated: () => void;
}

const TicketEditModal: React.FC<TicketEditModalProps> = ({ isOpen, onClose, ticket, onTicketUpdated }) => {
    const [formData, setFormData] = useState({
        status: '',
        priority: '',
        assignment_group: '',
        work_notes: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (ticket) {
            setFormData({
                status: ticket.status || 'Open',
                priority: ticket.priority || 'Medium',
                assignment_group: ticket.assignment_group || '',
                work_notes: ''
            });
        }
    }, [ticket]);

    if (!isOpen || !ticket) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Update fields
            const updateData = {
                status: formData.status,
                priority: formData.priority,
                assignment_group: formData.assignment_group
            };
            await ticketsApi.update(ticket.ticket_id, updateData);

            // Add work note if present
            if (formData.work_notes && formData.work_notes.trim()) {
                // Assuming current user is "System User" or get from auth context if available
                // Simplification: using hardcoded email or a generic one if auth not passed
                const authorEmail = 'system@nexus.com';
                await ticketsApi.addWorkNote(ticket.ticket_id, formData.work_notes, authorEmail);
            }

            onTicketUpdated();
            onClose();
        } catch (error) {
            console.error('Failed to update ticket', error);
            alert('Failed to update ticket');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="glass-card w-full max-w-lg relative z-10 animate-scale-in">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Edit Ticket {ticket.ticket_id}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select
                            className="input"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Closed">Closed</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                        <select
                            className="input"
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Group</label>
                        <select
                            className="input"
                            value={formData.assignment_group}
                            onChange={(e) => setFormData({ ...formData, assignment_group: e.target.value })}
                        >
                            <option value="">Unassigned</option>
                            <option value="IT Support L1">IT Support L1</option>
                            <option value="Network Team">Network Team</option>
                            <option value="Database Team">Database Team</option>
                            <option value="Security Ops">Security Ops</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Add Work Note</label>
                        <textarea
                            className="input h-24 resize-none"
                            value={formData.work_notes}
                            onChange={(e) => setFormData({ ...formData, work_notes: e.target.value })}
                            placeholder="Enter notes about recent updates..."
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                            {isSubmitting ? 'Updating...' : 'Update Ticket'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TicketEditModal;
