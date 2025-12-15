import React, { useState, useEffect } from 'react';
import { ticketsApi } from '../services/api';
import TicketCreateModal from '../components/TicketCreateModal';
import TicketViewModal from '../components/TicketViewModal';
import TicketEditModal from '../components/TicketEditModal';
import '../styles/design-system.css';

interface Ticket {
    ticket_id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    urgency: string;
    assignment_group?: string;
    sla_due_date?: string;
    created_date: string;
}

const TicketsPage: React.FC = () => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [filters, setFilters] = useState({
        status: '',
        priority: '',
        assignment_group: ''
    });

    useEffect(() => {
        loadTickets();
    }, [filters]);

    const loadTickets = async () => {
        setIsLoading(true);
        try {
            // Filter out empty strings
            const activeFilters = Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v !== '')
            );
            const data = await ticketsApi.list(activeFilters);
            setTickets(data);
        } catch (error) {
            console.error('Failed to load tickets', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewTicket = (ticket: Ticket) => {
        setSelectedTicket(ticket);
        setShowViewModal(true);
    };

    const handleEditTicket = () => {
        // Switch from view to edit
        setShowViewModal(false);
        setShowEditModal(true);
    };

    const priorityColor = (p: string) => {
        switch (p.toLowerCase()) {
            case 'critical': return 'badge-danger';
            case 'high': return 'badge-warning';
            case 'medium': return 'badge-info';
            default: return 'badge-success';
        }
    };

    const statusColor = (s: string) => {
        switch (s.toLowerCase()) {
            case 'open': return 'bg-purple-100 text-purple-800';
            case 'in progress': return 'bg-yellow-100 text-yellow-800';
            case 'resolved': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Create Modal */}
            <TicketCreateModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onTicketCreated={loadTickets}
            />

            {/* View Modal */}
            <TicketViewModal
                isOpen={showViewModal}
                onClose={() => setShowViewModal(false)}
                ticket={selectedTicket}
                onEdit={handleEditTicket}
            />

            {/* Edit Modal */}
            <TicketEditModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                ticket={selectedTicket}
                onTicketUpdated={loadTickets}
            />

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">ServiceNow Tickets</h1>
                    <p className="text-gray-500">Manage and track support incidents</p>
                </div>
                <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Ticket
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        Filter Tickets
                    </h2>
                    <button
                        onClick={() => setFilters({ status: '', priority: '', assignment_group: '' })}
                        className="text-xs text-gray-400 hover:text-purple-600 font-medium transition-colors"
                    >
                        Reset Filters
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-500 ml-1">Status</label>
                        <div className="relative">
                            <select
                                className="w-full pl-3 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all appearance-none cursor-pointer hover:bg-white"
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            >
                                <option value="">All Statuses</option>
                                <option value="Open">Open</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Resolved">Resolved</option>
                                <option value="Closed">Closed</option>
                            </select>
                            <svg className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-500 ml-1">Priority</label>
                        <div className="relative">
                            <select
                                className="w-full pl-3 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all appearance-none cursor-pointer hover:bg-white"
                                value={filters.priority}
                                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                            >
                                <option value="">All Priorities</option>
                                <option value="Critical">Critical</option>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                            <svg className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-500 ml-1">Assignment Group</label>
                        <div className="relative">
                            <select
                                className="w-full pl-3 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all appearance-none cursor-pointer hover:bg-white"
                                value={filters.assignment_group}
                                onChange={(e) => setFilters({ ...filters, assignment_group: e.target.value })}
                            >
                                <option value="">All Groups</option>
                                <option value="IT Support L1">IT Support L1</option>
                                <option value="Network Team">Network Team</option>
                                <option value="Database Team">Database Team</option>
                            </select>
                            <svg className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tickets List */}
            {isLoading ? (
                <div className="flex justify-center p-12">
                    <div className="spinner"></div>
                </div>
            ) : (
                <div className="glass-card overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Groups</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {tickets.map((ticket) => (
                                <tr key={ticket.ticket_id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleViewTicket(ticket)}>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-purple-600">{ticket.ticket_id}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 font-medium">{ticket.title}</div>
                                        <div className="text-xs text-gray-500 truncate max-w-xs">{ticket.description}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`badge ${priorityColor(ticket.priority)}`}>
                                            {ticket.priority}
                                        </span>
                                        {ticket.urgency === 'High' && (
                                            <span className="ml-2 text-xs text-red-500 font-bold" title="High Urgency">!</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {ticket.assignment_group || 'Unassigned'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor(ticket.status)}`}>
                                            {ticket.status}
                                        </span>
                                        {ticket.sla_due_date && (
                                            <div className="text-xs text-red-500 mt-1">
                                                Due: {new Date(ticket.sla_due_date).toLocaleDateString()}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(ticket.created_date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleViewTicket(ticket); }}
                                            className="text-primary hover:text-primary-hover"
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {tickets.length === 0 && (
                        <div className="text-center p-8 text-gray-500">
                            No tickets found matching your filters.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TicketsPage;
