import React, { useState, useEffect } from 'react';
import { usersApi } from '../services/api';
import '../styles/design-system.css';

interface UserEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    onUserUpdated: () => void;
}

const UserEditModal: React.FC<UserEditModalProps> = ({ isOpen, onClose, user, onUserUpdated }) => {
    const [formData, setFormData] = useState({
        job_title: '',
        department: '',
        license_sku: '',
        role: '',
        manager_email: '',
        status: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                job_title: user.job_title || '',
                department: user.department || '',
                license_sku: user.license_sku || '',
                role: user.role || 'user',
                manager_email: user.manager_email || '',
                status: user.status || 'Active'
            });
        }
    }, [user]);

    if (!isOpen || !user) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const userId = user.id || user.user_id;
            if (!userId) {
                throw new Error("User ID is missing");
            }
            await usersApi.update(userId, formData);

            // If license changed, also call assignLicense for realism (api supports separate calls)
            if (user.license_sku !== formData.license_sku) {
                await usersApi.assignLicense(user.email, formData.license_sku);
            }

            onUserUpdated();
            onClose();
        } catch (error) {
            console.error('Failed to update user', error);
            alert('Failed to update user');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeactivate = async () => {
        if (confirm(`Are you sure you want to deactivate ${user.email}?`)) {
            try {
                await usersApi.deactivate(user.email);
                onUserUpdated();
                onClose();
            } catch (error) {
                console.error('Failed to deactivate user', error);
                alert('Failed to deactivate user');
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="glass-card w-full max-w-lg relative z-10 animate-scale-in p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Edit User</h2>
                        <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                            <input
                                type="text"
                                className="input"
                                value={formData.job_title}
                                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                            <select
                                className="input"
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            >
                                <option value="">Select Dept...</option>
                                <option value="IT">IT</option>
                                <option value="HR">HR</option>
                                <option value="Finance">Finance</option>
                                <option value="Sales">Sales</option>
                                <option value="Marketing">Marketing</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                        <select
                            className="input"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            <option value="approver">Approver</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">M365 License</label>
                        <div className="grid grid-cols-3 gap-3">
                            {['E3', 'E5', 'F3', 'Business Basic'].map((sku) => (
                                <label key={sku} className={`cursor-pointer border rounded-lg p-3 text-center transition-all ${formData.license_sku === sku
                                    ? 'border-purple-600 bg-purple-50 text-purple-700 font-bold'
                                    : 'border-gray-200 hover:border-purple-300'
                                    }`}>
                                    <input
                                        type="radio"
                                        name="license"
                                        value={sku}
                                        checked={formData.license_sku === sku}
                                        onChange={(e) => setFormData({ ...formData, license_sku: e.target.value })}
                                        className="hidden"
                                    />
                                    {sku}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-between pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={handleDeactivate}
                            className="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1 hover:bg-red-50 rounded"
                        >
                            Deactivate User
                        </button>
                        <div className="flex gap-3">
                            <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
                            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserEditModal;
