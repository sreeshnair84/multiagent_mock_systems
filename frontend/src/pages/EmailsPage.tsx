import React, { useState, useEffect } from 'react';
import { emailsApi } from '../services/api';
import EmailComposeModal from '../components/EmailComposeModal';
import EmailViewModal from '../components/EmailViewModal';
import '../styles/design-system.css';

interface Email {
    email_id: string; // The mock data has 'id' but the interface says 'email_id', let's check mockData.ts or component usage. Using 'id' in mock generally.
    id: string;
    subject: string;
    sender: string;
    preview: string;
    body: string;
    status: string;
    date_received: string;
    importance: string;
    received_at?: string; // Standardize
}

const EmailsPage: React.FC = () => {
    const [emails, setEmails] = useState<Email[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showComposeModal, setShowComposeModal] = useState(false);
    const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

    useEffect(() => {
        loadEmails();
    }, []);

    const loadEmails = async () => {
        setIsLoading(true);
        try {
            const data = await emailsApi.list();
            // Map data if necessary to standard interface, for now assume matching
            setEmails(data);
        } catch (error) {
            console.error("Failed to load emails", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenEmail = (email: Email) => {
        setSelectedEmail(email);
        if (email.status === 'Unread') {
            // Mark as read locally instantly
            setEmails(prev => prev.map(e => e.id === email.id ? { ...e, status: 'Read' } : e));
            // Call API
            emailsApi.markRead(email.id).catch(err => console.error("Failed to mark read", err));
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Compose Modal */}
            <EmailComposeModal
                isOpen={showComposeModal}
                onClose={() => setShowComposeModal(false)}
                onEmailSent={loadEmails}
            />

            {/* View Modal */}
            <EmailViewModal
                isOpen={!!selectedEmail}
                onClose={() => setSelectedEmail(null)}
                email={selectedEmail}
                onEmailUpdated={loadEmails}
            />

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
                    <p className="text-gray-500">Outlook emails</p>
                </div>
                <button onClick={() => setShowComposeModal(true)} className="btn btn-primary flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Compose
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-12"><div className="spinner"></div></div>
            ) : (
                <div className="glass-card overflow-hidden">
                    <div className="divide-y divide-gray-100">
                        {emails.map(email => (
                            <div
                                key={email.id || email.email_id}
                                onClick={() => handleOpenEmail(email)}
                                className={`p-4 flex gap-4 hover:bg-gray-50 transition-colors cursor-pointer ${email.status === 'Unread' ? 'bg-purple-50/40 hover:bg-purple-50' : 'bg-white'}`}
                            >
                                <div className="flex-shrink-0">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br ${email.status === 'Unread' ? 'from-purple-500 to-indigo-600 shadow-purple-200' : 'from-gray-400 to-gray-500'}`}>
                                        {email.sender.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between mb-1 items-center">
                                        <h3 className={`text-sm font-medium text-gray-900 ${email.status === 'Unread' ? 'font-bold' : ''}`}>
                                            {email.sender}
                                        </h3>
                                        <span className={`text-xs whitespace-nowrap ${email.status === 'Unread' ? 'text-purple-600 font-medium' : 'text-gray-400'}`}>
                                            {new Date(email.date_received || email.received_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className={`text-sm text-gray-900 mb-1 leading-snug ${email.status === 'Unread' ? 'font-semibold' : ''}`}>
                                        {email.importance === 'High' && <span className="text-red-500 mr-2 font-bold">!</span>}
                                        {email.subject}
                                    </p>
                                    <p className="text-sm text-gray-500 truncate">{email.preview}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    {emails.length === 0 && (
                        <div className="text-center p-12 text-gray-500">
                            <div className="flex justify-center mb-4">
                                <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            </div>
                            <p className="text-lg font-medium text-gray-900">Inbox is empty</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default EmailsPage;
