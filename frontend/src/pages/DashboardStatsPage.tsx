import React, { useEffect, useState } from 'react';
import { ticketsApi, devicesApi, accessRequestsApi, usersApi, rbacApi } from '../services/api';
import '../styles/design-system.css';

interface DashboardStats {
    ticketsCount: number;
    openTicketsCount: number;
    devicesCount: number;
    compliantDevicesCount: number;
    requestsCount: number;
    pendingRequestsCount: number;
    usersCount: number;
    rolesCount: number;
}

const DashboardStatsPage: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats>({
        ticketsCount: 0,
        openTicketsCount: 0,
        devicesCount: 0,
        compliantDevicesCount: 0,
        requestsCount: 0,
        pendingRequestsCount: 0,
        usersCount: 0,
        rolesCount: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch all data in parallel
                const [tickets, devices, requests, users, roles] = await Promise.all([
                    ticketsApi.list(),
                    devicesApi.list(),
                    accessRequestsApi.list(),
                    usersApi.list(),
                    rbacApi.getRoles(),
                ]);

                setStats({
                    ticketsCount: tickets.length,
                    openTicketsCount: tickets.filter((t: any) => t.status !== 'Closed' && t.status !== 'Resolved').length,
                    devicesCount: devices.length,
                    compliantDevicesCount: devices.filter((d: any) => d.compliance_status === 'Compliant').length,
                    requestsCount: requests.length,
                    pendingRequestsCount: requests.filter((r: any) => r.status === 'Pending').length,
                    usersCount: users.length,
                    rolesCount: roles.length,
                });
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    const StatCard = ({ title, count, subtext, icon, color }: any) => (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
                    {icon}
                </div>
                {subtext && (
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-50 text-gray-500">
                        {subtext}
                    </span>
                )}
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{count}</h3>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                    <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
                        Export Report
                    </button>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors shadow-sm">
                        + New Request
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Active Tickets"
                    count={stats.openTicketsCount}
                    subtext={`${stats.ticketsCount} Total`}
                    color="bg-blue-500 text-blue-600"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
                />
                <StatCard
                    title="Pending Approvals"
                    count={stats.pendingRequestsCount}
                    subtext={`${stats.requestsCount} Total`}
                    color="bg-amber-500 text-amber-600"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
                <StatCard
                    title="Compliant Devices"
                    count={stats.compliantDevicesCount}
                    subtext={`${stats.devicesCount} Total`}
                    color="bg-green-500 text-green-600"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
                <StatCard
                    title="Total Users"
                    count={stats.usersCount}
                    subtext={`${stats.rolesCount} Roles`}
                    color="bg-purple-500 text-purple-600"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                />
            </div>

            {/* Recent Activity Section Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">System Status</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-sm font-medium text-gray-700">API Gateway</span>
                            </div>
                            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">Operational</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-sm font-medium text-gray-700">Database Cluster</span>
                            </div>
                            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">Operational</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-sm font-medium text-gray-700">Auth Service</span>
                            </div>
                            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">Operational</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Pending Actions</h3>
                    <div className="space-y-4">
                        {stats.pendingRequestsCount > 0 ? (
                            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-3">
                                <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                <div>
                                    <p className="text-sm font-bold text-amber-800">Approvals Required</p>
                                    <p className="text-xs text-amber-600 mt-1">You have {stats.pendingRequestsCount} pending access requests requiring your attention.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 bg-green-50 rounded-xl border border-green-100 flex items-start gap-3">
                                <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <div>
                                    <p className="text-sm font-bold text-green-800">All Clear</p>
                                    <p className="text-xs text-green-600 mt-1">No pending actions at this time.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardStatsPage;
