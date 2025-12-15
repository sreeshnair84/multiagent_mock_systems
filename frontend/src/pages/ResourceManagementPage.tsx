import React, { useState, useEffect } from 'react';
import { resourcesApi } from '../services/api';
import '../styles/design-system.css';

// Interfaces match backend data structure
interface ResourceGroup {
    name: string;
    location: string;
    provisioning_state: string;
}

interface VirtualMachine {
    name: string;
    resource_group: string;
    location: string;
    size: string;
    provisioning_state: string;
    power_state: string;
    public_ip: string;
}

interface AppService {
    name: string;
    resource_group: string;
    location: string;
    plan: string;
    default_host_name: string;
    state: string;
}

interface ServiceAccount {
    name: string;
    resource_group: string;
    type: string;
    client_id: string;
}

const ResourceManagementPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'vms' | 'apps' | 'rgs' | 'sa'>('vms');
    const [isLoading, setIsLoading] = useState(true);

    // Data states
    const [vms, setVms] = useState<VirtualMachine[]>([]);
    const [apps, setApps] = useState<AppService[]>([]);
    const [rgs, setRGs] = useState<ResourceGroup[]>([]);
    const [sas, setSAs] = useState<ServiceAccount[]>([]);

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            // Load data based on active tab to optimize
            if (activeTab === 'vms' && vms.length === 0) {
                const data = await resourcesApi.getVMs();
                setVms(data);
            } else if (activeTab === 'apps' && apps.length === 0) {
                const data = await resourcesApi.getApps();
                setApps(data);
            } else if (activeTab === 'rgs' && rgs.length === 0) {
                const data = await resourcesApi.getRGs();
                setRGs(data);
            } else if (activeTab === 'sa' && sas.length === 0) {
                const data = await resourcesApi.getSAs();
                setSAs(data);
            }
        } catch (error) {
            console.error("Failed to load resource data", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Resource Management</h1>
                    <p className="text-gray-500">Manage Azure Resources, App Services, and Service Accounts</p>
                </div>
                <div className="flex gap-2">
                    <button className="btn btn-primary" onClick={loadData}>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                    <button className="btn btn-outline">
                        + New Resource
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {[
                        { id: 'vms', label: 'Virtual Machines' },
                        { id: 'apps', label: 'App Services' },
                        { id: 'rgs', label: 'Resource Groups' },
                        { id: 'sa', label: 'Service Accounts' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`
                                py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                ${activeTab === tab.id
                                    ? 'border-purple-500 text-purple-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                            `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content Area */}
            {isLoading ? (
                <div className="flex justify-center p-12"><div className="spinner"></div></div>
            ) : (
                <div className="glass-card overflow-hidden min-h-[400px]">

                    {activeTab === 'vms' && (
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VM Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource Group</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Public IP</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {vms.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center p-8 text-gray-400">No Virtual Machines found</td></tr>
                                ) : vms.map((vm) => (
                                    <tr key={vm.name} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{vm.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vm.resource_group}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vm.location}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${vm.power_state.includes('running') ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {vm.power_state}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">{vm.public_ip}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {activeTab === 'apps' && (
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">App Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource Group</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {apps.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center p-8 text-gray-400">No App Services found</td></tr>
                                ) : apps.map((app) => (
                                    <tr key={app.name} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{app.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.resource_group}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.plan}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:underline cursor-pointer">{app.default_host_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">{app.state}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {activeTab === 'rgs' && (
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {rgs.length === 0 ? (
                                    <tr><td colSpan={3} className="text-center p-8 text-gray-400">No Resource Groups found</td></tr>
                                ) : rgs.map((rg) => (
                                    <tr key={rg.name} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{rg.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rg.location}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">{rg.provisioning_state}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {activeTab === 'sa' && (
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {sas.length === 0 ? (
                                    <tr><td colSpan={4} className="text-center p-8 text-gray-400">No Service Accounts found</td></tr>
                                ) : sas.map((sa) => (
                                    <tr key={sa.name} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{sa.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sa.type}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{sa.client_id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2024-12-15</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                </div>
            )}
            <p className="text-center text-sm text-gray-400 mt-4">
                Use the <span className="font-semibold text-purple-500">Enterprise Hub Assistant</span> to provision or manage these resources interactively.
            </p>
        </div>
    );
};

export default ResourceManagementPage;
