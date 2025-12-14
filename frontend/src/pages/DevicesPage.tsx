import React, { useState, useEffect } from 'react';
import { devicesApi } from '../services/api';
import DeviceProvisionModal from '../components/DeviceProvisionModal';
import DeviceComplianceView from '../components/DeviceComplianceView';
import '../styles/design-system.css';

interface Device {
    device_id: string;
    serial_number: string;
    name: string;
    user_email: string;
    device_type: string;
    compliance_state: string;
    status: string;
    os_version: string;
    manufacturer: string;
    model: string;
    ownership: string;
    last_sync: string;
}

const DevicesPage: React.FC = () => {
    const [devices, setDevices] = useState<Device[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showProvisionModal, setShowProvisionModal] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

    useEffect(() => {
        loadDevices();
    }, []);

    const loadDevices = async () => {
        setIsLoading(true);
        try {
            const data = await devicesApi.list();
            setDevices(data);
        } catch (error) {
            console.error('Failed to load devices', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewDevice = (device: Device) => {
        setSelectedDevice(device);
    };

    const complianceColor = (state: string) => {
        switch (state?.toLowerCase()) {
            case 'compliant': return 'text-green-600 bg-green-100';
            case 'non-compliant':
            case 'noncompliant': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Provision Modal */}
            <DeviceProvisionModal
                isOpen={showProvisionModal}
                onClose={() => setShowProvisionModal(false)}
                onDeviceProvisioned={loadDevices}
            />

            {/* View/Compliance Modal */}
            <DeviceComplianceView
                isOpen={!!selectedDevice}
                onClose={() => setSelectedDevice(null)}
                device={selectedDevice}
                onDeviceUpdated={() => {
                    loadDevices();
                    // Keep modal open but refresh data? Or close? Let's refresh.
                    // Ideally we'd re-fetch the specific device, but reloading list is fine for now
                }}
            />

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Device Management</h1>
                    <p className="text-gray-500">Intune MDM devices and compliance</p>
                </div>
                <button onClick={() => setShowProvisionModal(true)} className="btn btn-primary flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Provision Device
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-12"><div className="spinner"></div></div>
            ) : (
                <div className="glass-card overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                        {devices.map(device => (
                            <div
                                key={device.device_id}
                                onClick={() => handleViewDevice(device)}
                                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white cursor-pointer group"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg bg-gray-50 text-gray-500 group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors`}>
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 truncate max-w-[120px]" title={device.name}>{device.name}</h3>
                                            <p className="text-xs text-gray-500 font-mono">{device.serial_number}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${complianceColor(device.compliance_state)}`}>
                                        {device.compliance_state || 'Unknown'}
                                    </span>
                                </div>
                                <div className="space-y-2 text-sm text-gray-600 mt-4">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">User</span>
                                        <span className="font-medium truncate max-w-[150px]" title={device.user_email}>{device.user_email}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">OS</span>
                                        <span>{device.os_version}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Last Sync</span>
                                        <span>{new Date(device.last_sync).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {devices.length === 0 && (
                        <div className="text-center p-12 text-gray-500">
                            <div className="flex justify-center mb-4">
                                <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            </div>
                            <p className="text-lg font-medium text-gray-900">No devices found</p>
                            <p className="text-sm">Provision a new device to get started.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DevicesPage;
