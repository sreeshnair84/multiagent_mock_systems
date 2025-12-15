import React, { useState, useEffect } from 'react';
import { rbacApi } from '../services/api';
import '../styles/design-system.css';

interface Application {
    id: number;
    name: string;
    description: string;
}

interface Role {
    id: number;
    name: string;
    application_id: number;
    description: string;
}

interface Flavor {
    id: number;
    name: string;
    description: string;
    attributes: string;
}

const RoleManagementPage: React.FC = () => {
    const [apps, setApps] = useState<Application[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [flavors, setFlavors] = useState<Flavor[]>([]);
    const [selectedApp, setSelectedApp] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [appsData, flavorsData] = await Promise.all([
                rbacApi.getApplications(),
                rbacApi.getFlavors()
            ]);

            setApps(appsData);
            setFlavors(flavorsData);

            if (appsData.length > 0) {
                // Optional: Auto-select first app
                // setSelectedApp(appsData[0].id); 
            }
        } catch (error) {
            console.error("Error fetching RBAC data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedApp) {
            fetchRoles(selectedApp);
        } else {
            setRoles([]);
        }
    }, [selectedApp]);

    const fetchRoles = async (appId: number) => {
        try {
            const data = await rbacApi.getRoles(appId);
            setRoles(data);
        } catch (error) {
            console.error("Error fetching roles:", error);
            setRoles([]);
        }
    };

    return (
        <div className="p-6 min-h-screen bg-gray-50 text-gray-900">
            <header className="mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                    Role & Access Granular Management
                </h1>
                <p className="text-gray-500 mt-2">Manage applications, define granular roles, and configure user flavors.</p>
            </header>

            {loading ? (
                <div className="animate-pulse flex space-x-4">
                    <div className="h-12 bg-gray-200 rounded w-full"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Applications & Flavors */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Applications List */}
                        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                            <h2 className="text-xl font-semibold mb-4 text-purple-700">Applications</h2>
                            <div className="space-y-3">
                                {apps.length === 0 ? (
                                    <div className="text-gray-400 text-sm italic">No applications found.</div>
                                ) : (
                                    apps.map(app => (
                                        <div
                                            key={app.id}
                                            onClick={() => setSelectedApp(app.id)}
                                            className={`p-4 rounded-lg cursor-pointer transition-all duration-200 border ${selectedApp === app.id
                                                ? 'bg-purple-50 border-purple-300 shadow-sm'
                                                : 'bg-white border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="font-bold text-lg text-gray-800">{app.name}</div>
                                            <div className="text-xs text-gray-500">{app.description}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* User Flavors */}
                        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                            <h2 className="text-xl font-semibold mb-4 text-blue-700">User Flavors</h2>
                            <div className="space-y-3">
                                {flavors.length === 0 ? (
                                    <div className="text-gray-400 text-sm italic">No flavors defined.</div>
                                ) : (
                                    flavors.map(flavor => (
                                        <div key={flavor.id} className="p-3 bg-gray-50 rounded border border-gray-200">
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium text-gray-800">{flavor.name}</span>
                                                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                                    Active
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">{flavor.description}</div>
                                            <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono text-gray-600 truncate">
                                                {flavor.attributes}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Roles & Matrix */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm min-h-[500px]">
                            {selectedApp ? (
                                <>
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-800">
                                                {apps.find(a => a.id === selectedApp)?.name} Roles
                                            </h2>
                                            <p className="text-gray-400 text-sm">Define capabilities and permissions</p>
                                        </div>
                                        <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow transition-colors font-medium">
                                            + New Role
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {roles.map(role => (
                                            <div key={role.id} className="p-5 bg-white rounded-lg border border-gray-200 hover:border-purple-300 transition-colors group shadow-sm">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="font-bold text-lg text-gray-800">{role.name}</h3>
                                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-purple-600 cursor-pointer hover:underline text-sm font-medium">
                                                        Edit
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500 mb-4">{role.description}</p>

                                                <div className="border-t border-gray-100 pt-3 mt-2">
                                                    <h4 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">Permissions</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {role.name.includes("Admin") ? (
                                                            <>
                                                                <span className="px-2 py-1 text-xs bg-red-100 text-red-700 border border-red-200 rounded">Full Access</span>
                                                                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 border border-blue-200 rounded">Config</span>
                                                            </>
                                                        ) : (
                                                            <span className="px-2 py-1 text-xs bg-green-100 text-green-700 border border-green-200 rounded">Read Only</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {roles.length === 0 && (
                                            <div className="col-span-full py-12 text-center text-gray-400 italic">
                                                No roles defined for this application yet.
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                    <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                                        <span className="text-2xl">⚡</span>
                                    </div>
                                    <p className="text-lg font-medium text-gray-600">Select an Application</p>
                                    <p className="text-sm">Choose an application from the left to manage its roles.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoleManagementPage;
