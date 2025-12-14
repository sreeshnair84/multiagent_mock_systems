import React, { useState } from 'react';
import { usersApi } from '../services/api';
import '../styles/design-system.css';

interface UserCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUserCreated: () => void;
}

const UserCreateModal: React.FC<UserCreateModalProps> = ({ isOpen, onClose, onUserCreated }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        job_title: '',
        department: '',
        license_sku: 'E3',
        role: 'user',
        manager_email: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await usersApi.create(formData);
            onUserCreated();
            onClose();
        } catch (error) {
            console.error('Failed to create user', error);
            alert('Failed to create user');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="glass-card w-full max-w-lg relative z-10 animate-scale-in flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Add New User</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                            <input
                                type="text"
                                required
                                className="input w-full"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                            <select
                                className="input w-full"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                                <option value="approver">Approver</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                        <input
                            type="email"
                            required
                            className="input w-full"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="john.doe@contoso.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Temporary Password</label>
                        <input
                            type="password"
                            required
                            className="input w-full"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                            <select
                                className="input w-full"
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            >
                                <option value="">Select Dept...</option>
                                <option value="IT">IT</option>
                                <option value="HR">HR</option>
                                <option value="Finance">Finance</option>
                                <option value="Sales">Sales</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Job Title</label>
                            <input
                                type="text"
                                className="input w-full"
                                value={formData.job_title}
                                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                                placeholder="Software Engineer"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">M365 License</label>
                        <div className="grid grid-cols-2 gap-3">
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

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Manager Email</label>
                        <input
                            type="email"
                            className="input w-full"
                            value={formData.manager_email}
                            onChange={(e) => setFormData({ ...formData, manager_email: e.target.value })}
                            placeholder="manager@contoso.com"
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                            {isSubmitting ? 'Creating...' : 'Create User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserCreateModal;
