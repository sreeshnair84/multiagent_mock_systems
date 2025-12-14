import React, { useState } from 'react';
import { emailsApi } from '../services/api';
import '../styles/design-system.css';

interface EmailComposeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onEmailSent: () => void;
}

const EmailComposeModal: React.FC<EmailComposeModalProps> = ({ isOpen, onClose, onEmailSent }) => {
    const [formData, setFormData] = useState({
        to: '',
        cc: '',
        subject: '',
        body: '',
        importance: 'Normal'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await emailsApi.send({
                recipient: formData.to,
                cc_recipients: formData.cc ? formData.cc.split(',').map(e => e.trim()) : [],
                subject: formData.subject,
                body: formData.body,
                importance: formData.importance
            });
            onEmailSent();
            onClose();
        } catch (error) {
            console.error('Failed to send email', error);
            alert('Failed to send email');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="glass-card w-full max-w-3xl relative z-10 animate-scale-in flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50 rounded-t-lg">
                    <h2 className="text-lg font-bold text-gray-900">New Message</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="p-4 space-y-4 overflow-y-auto flex-1">
                        <div>
                            <input
                                type="email"
                                required
                                className="input border-none border-b border-gray-200 rounded-none px-0 py-2 focus:ring-0 focus:border-purple-500 w-full"
                                value={formData.to}
                                onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                                placeholder="To: recipient@example.com"
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                className="input border-none border-b border-gray-200 rounded-none px-0 py-2 focus:ring-0 focus:border-purple-500 w-full"
                                value={formData.cc}
                                onChange={(e) => setFormData({ ...formData, cc: e.target.value })}
                                placeholder="CC: (comma separated)"
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                required
                                className="input border-none border-b border-gray-200 rounded-none px-0 py-2 font-medium focus:ring-0 focus:border-purple-500 w-full text-lg"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                placeholder="Subject"
                            />
                        </div>

                        <div className="flex items-center gap-2 py-2">
                            <label className="text-sm text-gray-500">Importance:</label>
                            <select
                                className="text-sm border-none bg-gray-50 rounded px-2 py-1 focus:ring-0 cursor-pointer hover:bg-gray-100 transition-colors"
                                value={formData.importance}
                                onChange={(e) => setFormData({ ...formData, importance: e.target.value })}
                            >
                                <option value="Low">Low</option>
                                <option value="Normal">Normal</option>
                                <option value="High">High</option>
                            </select>
                        </div>

                        <div className="flex-1 min-h-[200px]">
                            <textarea
                                required
                                className="input border-none w-full h-full resize-none focus:ring-0 p-0 text-gray-800"
                                value={formData.body}
                                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                                placeholder="Type your message here..."
                            />
                        </div>
                    </div>

                    <div className="flex justify-between items-center p-4 border-t border-gray-100 bg-gray-50/30 rounded-b-lg mt-auto">
                        <button type="button" className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                        </button>
                        <div className="flex gap-3">
                            <button type="button" onClick={onClose} className="btn btn-outline">Discard</button>
                            <button type="submit" disabled={isSubmitting} className="btn btn-primary px-6">
                                {isSubmitting ? 'Sending...' : 'Send'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmailComposeModal;
