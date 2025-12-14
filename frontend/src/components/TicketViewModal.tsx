import React from 'react';
import '../styles/design-system.css';

interface TicketViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    ticket: any; // Using any for now to match flexible schema, ideally interface
    onEdit: () => void;
}

const TicketViewModal: React.FC<TicketViewModalProps> = ({ isOpen, onClose, ticket, onEdit }) => {
    if (!isOpen || !ticket) return null;

    const priorityColor = (p: string) => {
        switch (p?.toLowerCase()) {
            case 'critical': return 'badge-danger';
            case 'high': return 'badge-warning';
            case 'medium': return 'badge-info';
            default: return 'badge-success';
        }
    };

    const statusColor = (s: string) => {
        switch (s?.toLowerCase()) {
            case 'open': return 'bg-purple-100 text-purple-800';
            case 'in progress': return 'bg-yellow-100 text-yellow-800';
            case 'resolved': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Parse work notes safely
    let workNotes: any[] = [];
    try {
        if (Array.isArray(ticket.work_notes)) {
            workNotes = ticket.work_notes;
        } else if (typeof ticket.work_notes === 'string') {
            workNotes = JSON.parse(ticket.work_notes);
        } else if (ticket.work_notes_history) {
            // Fallback for previous naming convention if used elsewhere
            workNotes = ticket.work_notes_history;
        }
    } catch (e) {
        console.warn('Failed to parse work notes', e);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="glass-card w-full max-w-2xl relative z-10 animate-scale-in max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-start mb-6 p-6 pb-0">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-2xl font-bold text-gray-900">{ticket.ticket_id}</h2>
                            <span className={`badge ${priorityColor(ticket.priority)}`}>{ticket.priority}</span>
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor(ticket.status)}`}>
                                {ticket.status}
                            </span>
                        </div>
                        <h3 className="text-lg text-gray-700">{ticket.title}</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="overflow-y-auto p-6 flex-1 space-y-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="block text-gray-500">Created</span>
                            <span className="font-medium">{new Date(ticket.created_date).toLocaleString()}</span>
                        </div>
                        <div>
                            <span className="block text-gray-500">Assignment Group</span>
                            <span className="font-medium">{ticket.assignment_group || 'Unassigned'}</span>
                        </div>
                        <div>
                            <span className="block text-gray-500">Requester</span>
                            <span className="font-medium">{ticket.requester_email || 'N/A'}</span>
                        </div>
                        <div>
                            <span className="block text-gray-500">SLA Due Date</span>
                            <span className={`font-medium ${ticket.sla_due_date && new Date(ticket.sla_due_date) < new Date() ? 'text-red-600' : ''}`}>
                                {ticket.sla_due_date ? new Date(ticket.sla_due_date).toLocaleString() : 'N/A'}
                            </span>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                        <div className="bg-gray-50 p-4 rounded-lg text-gray-700 whitespace-pre-wrap">
                            {ticket.description}
                        </div>
                    </div>

                    {ticket.tags && ticket.tags.length > 0 && (
                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                            <div className="flex flex-wrap gap-2">
                                {ticket.tags.map((tag: string, i: number) => (
                                    <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Work Notes / Activity Log */}
                    <div>
                        <h4 className="font-medium text-gray-900 mb-3">Activity Log</h4>
                        <div className="space-y-4">
                            {workNotes && workNotes.length > 0 ? (
                                workNotes.map((note: any, idx: number) => (
                                    <div key={idx} className="flex gap-3">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xs font-bold">
                                            {note.author_email ? note.author_email.charAt(0).toUpperCase() : (note.author ? note.author.charAt(0) : 'S')}
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-3 flex-1 text-sm">
                                            <div className="flex justify-between mb-1">
                                                <span className="font-bold text-gray-900">{note.author_email || note.author || 'System'}</span>
                                                <span className="text-gray-500 text-xs">{note.created_at ? new Date(note.created_at).toLocaleString() : (note.timestamp ? new Date(note.timestamp).toLocaleString() : 'Just now')}</span>
                                            </div>
                                            <p className="text-gray-700">{note.note}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 italic">No activity recorded.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-white rounded-b-lg">
                    <button onClick={onClose} className="btn btn-outline">Close</button>
                    <button onClick={() => { onClose(); onEdit(); }} className="btn btn-primary">Edit Ticket</button>
                </div>
            </div>
        </div>
    );
};

export default TicketViewModal;
