import React, { useState, useEffect } from 'react';
import { usersApi } from '../services/api';
import UserCreateModal from '../components/UserCreateModal';
import UserEditModal from '../components/UserEditModal';
import '../styles/design-system.css';

interface User {
    id: number;
    email: string;
    username: string;
    job_title: string;
    department: string;
    license_sku: string;
    role: string;
    status: string;
    manager_email?: string; // Add optional fields to interface
}

const UsersPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setIsLoading(true);
        try {
            const data = await usersApi.list();
            setUsers(data);
        } catch (error) {
            console.error('Failed to load users', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setShowEditModal(true);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Create Modal */}
            <UserCreateModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onUserCreated={loadUsers}
            />

            {/* Edit Modal */}
            <UserEditModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                user={selectedUser}
                onUserUpdated={loadUsers}
            />

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-500">Manage M365 users and licenses</p>
                </div>
                <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New User
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-12"><div className="spinner"></div></div>
            ) : (
                <div className="glass-card overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dept</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">License</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => handleEditUser(user)}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold mr-3 shadow-md">
                                                {user.username.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{user.username}</div>
                                                <div className="text-xs text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.job_title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.department}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`badge ${user.license_sku?.includes('E5') ? 'badge-primary' : 'badge-info'}`}>{user.license_sku}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{user.role}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleEditUser(user); }}
                                            className="text-primary hover:text-primary-hover opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default UsersPage;
