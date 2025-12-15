import React, { useState, useEffect } from 'react';
import { rbacApi, usersApi } from '../services/api';
import '../styles/design-system.css';

interface UserRoleMappingModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
}

const UserRoleMappingModal: React.FC<UserRoleMappingModalProps> = ({ isOpen, onClose, user }) => {
    const [apps, setApps] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [selectedApp, setSelectedApp] = useState<number | null>(null);
    const [selectedRole, setSelectedRole] = useState<number | null>(null);
    const [userRoles, setUserRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && user) {
            fetchUserRoles();
            fetchApps();
        }
    }, [isOpen, user]);

    useEffect(() => {
        if (selectedApp) {
            fetchRoles(selectedApp);
        }
    }, [selectedApp]);

    const fetchUserRoles = async () => {
        try {
            // TODO: Add new API endpoint for granular user roles if needed
            // For now, we reuse the existing roles logic or just list assigned
            // But rbac.py has get_user_roles endpoint: /rbac/users/{user_id}/roles
            const data = await rbacApi.getUserRoles(user.id || user.user_id);
            setUserRoles(data);
        } catch (error) {
            console.error("Failed to fetch user roles", error);
        }
    };

    const fetchApps = async () => {
        try {
            const data = await rbacApi.getApplications();
            setApps(data);
        } catch (error) {
            console.error("Failed to fetch apps", error);
        }
    };

    const fetchRoles = async (appId: number) => {
        try {
            const data = await rbacApi.getRoles(appId);
            setRoles(data);
        } catch (error) {
            console.error("Failed to fetch roles", error);
        }
    };

    const handleAssign = async () => {
        if (!selectedRole || !user) return;
        setLoading(true);
        try {
            const userId = user.id || user.user_id;
            await rbacApi.assignRole(userId, selectedRole);
            await fetchUserRoles(); // Refresh list
            alert('Role assigned successfully');
        } catch (error) {
            console.error("Failed to assign role", error);
            alert('Failed to assign role');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="glass-card w-full max-w-2xl relative z-10 animate-scale-in p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Manage App Roles</h2>
                        <p className="text-sm text-gray-500">For {user.email}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Assign New Role */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-700 border-b pb-2">Assign New Role</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Application</label>
                            <select
                                className="input"
                                value={selectedApp || ''}
                                onChange={(e) => setSelectedApp(Number(e.target.value))}
                            >
                                <option value="">Select Application...</option>
                                {apps.map(app => (
                                    <option key={app.id} value={app.id}>{app.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                            <select
                                className="input"
                                value={selectedRole || ''}
                                onChange={(e) => setSelectedRole(Number(e.target.value))}
                                disabled={!selectedApp}
                            >
                                <option value="">Select Role...</option>
                                {roles.map(role => (
                                    <option key={role.id} value={role.id}>{role.name}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={handleAssign}
                            disabled={loading || !selectedRole}
                            className="btn btn-primary w-full"
                        >
                            {loading ? 'Assigning...' : 'Assign Role'}
                        </button>
                    </div>

                    {/* Assigned Roles List */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 h-[300px] overflow-y-auto">
                        <h3 className="font-semibold text-gray-700 mb-3 sticky top-0 bg-gray-50 pb-2">Current Assignments</h3>

                        {userRoles.length === 0 ? (
                            <p className="text-sm text-gray-400 italic text-center mt-10">No specific app roles assigned.</p>
                        ) : (
                            <div className="space-y-3">
                                {userRoles.map((ur: any, idx) => (
                                    <div key={idx} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex justify-between items-center">
                                        <div>
                                            <div className="font-bold text-sm text-gray-800">{ur.role_name}</div>
                                            <div className="text-xs text-purple-600 font-medium">{ur.application}</div>
                                        </div>
                                        <button className="text-red-400 hover:text-red-600" title="Remove Role">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserRoleMappingModal;
