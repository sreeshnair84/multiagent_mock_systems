import React, { useState } from 'react';
import { emailsApi } from '../services/api';
import '../styles/design-system.css';

interface EmailViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    email: any;
    onEmailUpdated: () => void;
}

const EmailViewModal: React.FC<EmailViewModalProps> = ({ isOpen, onClose, email, onEmailUpdated }) => {
    const [replyMode, setReplyMode] = useState(false);
    const [replyBody, setReplyBody] = useState('');
    const [isSending, setIsSending] = useState(false);

    if (!isOpen || !email) return null;

    const handleReply = async () => {
        setIsSending(true);
        try {
            await emailsApi.reply(email.id, replyBody, false);
            alert('Reply sent successfully');
            setReplyMode(false);
            setReplyBody('');
            onEmailUpdated();
            // onClose(); // Optional: close modal after reply
        } catch (error) {
            console.error('Failed to send reply', error);
            alert('Failed to send reply');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="glass-card w-full max-w-4xl relative z-10 animate-scale-in flex flex-col max-h-[90vh] h-[80vh]">

                {/* Header */}
                <div className="flex justify-between items-start p-6 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl">
                    <div className="flex-1 min-w-0 pr-4">
                        <h2 className="text-xl font-bold text-gray-900 truncate mb-1">{email.subject}</h2>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="font-semibold text-gray-900">{email.sender}</span>
                            <span>&bull;</span>
                            <span>{new Date(email.received_at).toLocaleString()}</span>
                            {email.importance === 'High' && (
                                <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">High Importance</span>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full flex-shrink-0">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Email Body */}
                <div className="flex-1 overflow-y-auto p-8 bg-white">
                    <div className="prose max-w-none text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {email.body}
                    </div>
                </div>

                {/* Reply Section */}
                <div className="border-t border-gray-200 bg-gray-50 p-6 rounded-b-2xl">
                    {replyMode ? (
                        <div className="animate-fade-in space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-700">Replying to {email.sender}</span>
                                <button onClick={() => setReplyMode(false)} className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <textarea
                                className="input w-full h-32 resize-none bg-white font-normal"
                                placeholder="Type your reply..."
                                value={replyBody}
                                onChange={(e) => setReplyBody(e.target.value)}
                                autoFocus
                            ></textarea>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setReplyMode(false)}
                                    className="btn btn-outline bg-white"
                                >
                                    Discard
                                </button>
                                <button
                                    onClick={handleReply}
                                    disabled={isSending || !replyBody.trim()}
                                    className="btn btn-primary"
                                >
                                    {isSending ? 'Sending...' : 'Send Reply'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex gap-3">
                            <button
                                onClick={() => setReplyMode(true)}
                                className="btn btn-primary flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                                Reply
                            </button>
                            <button className="btn btn-outline bg-white flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                Forward
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmailViewModal;
