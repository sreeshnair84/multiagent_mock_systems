import React, { useState } from 'react';
import { devicesApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import '../styles/design-system.css';

interface DeviceComplianceViewProps {
    isOpen: boolean;
    onClose: () => void;
    device: any;
    onDeviceUpdated: () => void;
}

const DeviceComplianceView: React.FC<DeviceComplianceViewProps> = ({ isOpen, onClose, device, onDeviceUpdated }) => {
    const { user } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);
    const [wipeConfirm, setWipeConfirm] = useState(false);

    if (!isOpen || !device) return null;

    const handleCheckCompliance = async () => {
        setIsProcessing(true);
        try {
            await devicesApi.checkCompliance(device.id);
            onDeviceUpdated();
            // Show a temporary success message or just refresh
            alert('Compliance check initiated. Status updated.');
        } catch (error) {
            console.error('Failed to check compliance', error);
            alert('Failed to check compliance');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleWipeDevice = async () => {
        if (!wipeConfirm) {
            setWipeConfirm(true);
            return;
        }

        setIsProcessing(true);
        try {
            await devicesApi.wipe(device.id, user?.email || 'admin@nexus.com', true);
            alert('Remote wipe command sent successfully.');
            onDeviceUpdated();
            onClose();
        } catch (error) {
            console.error('Failed to wipe device', error);
            alert('Failed to send wipe command');
        } finally {
            setIsProcessing(false);
            setWipeConfirm(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'compliant': return 'success';
            case 'non-compliant': return 'error';
            case 'enrolled': return 'info';
            default: return 'warning';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="glass-card w-full max-w-2xl relative z-10 animate-scale-in flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white/50 backdrop-blur-md rounded-t-2xl">
                    <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center bg-gray-100 text-gray-500`}>
                            {device.os_version?.includes('iOS') || device.os_version?.includes('Android') ? (
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                            ) : (
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{device.device_name}</h2>
                            <p className="text-sm text-gray-500 font-mono">{device.serial_number}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* Status Overview */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl border border-gray-100 bg-white/60">
                            <span className="text-sm text-gray-500 block mb-1">Compliance Status</span>
                            <span className={`badge badge-${getStatusColor(device.compliance_status)} text-base px-3 py-1`}>
                                {device.compliance_status || 'Unknown'}
                            </span>
                        </div>
                        <div className="p-4 rounded-xl border border-gray-100 bg-white/60">
                            <span className="text-sm text-gray-500 block mb-1">Ownership</span>
                            <span className="font-semibold text-gray-900 flex items-center gap-2">
                                {device.ownership}
                                {device.ownership === 'Company' ? (
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Corporate</span>
                                ) : (
                                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">BYOD</span>
                                )}
                            </span>
                        </div>
                    </div>

                    {/* Device Details */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Device Details</h3>
                        <div className="bg-gray-50/50 rounded-xl p-5 border border-gray-100 grid grid-cols-2 gap-y-6 gap-x-8">
                            <div>
                                <span className="text-xs text-gray-500 uppercase block mb-1">Assigned User</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                                        {device.user_email?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-medium text-gray-900 truncate">{device.user_email}</span>
                                </div>
                            </div>
                            <div>
                                <span className="text-xs text-gray-500 uppercase block mb-1">Last Check-in</span>
                                <span className="text-sm font-medium text-gray-900">{new Date(device.last_sync).toLocaleString()}</span>
                            </div>
                            <div>
                                <span className="text-xs text-gray-500 uppercase block mb-1">OS Version</span>
                                <span className="text-sm font-medium text-gray-900">{device.os_version}</span>
                            </div>
                            <div>
                                <span className="text-xs text-gray-500 uppercase block mb-1">Manufacturer/Model</span>
                                <span className="text-sm font-medium text-gray-900">{device.manufacturer} {device.model}</span>
                            </div>
                        </div>
                    </div>

                    {/* Compliance Policies (Mock) */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Applied Policies</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-lg">
                                <span className="text-sm font-medium text-gray-800">Password Policy</span>
                                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-lg">
                                <span className="text-sm font-medium text-gray-800">Encryption (BitLocker)</span>
                                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-lg">
                                <span className="text-sm font-medium text-gray-800">Antivirus Status</span>
                                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Actions Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl flex justify-between items-center">
                    {wipeConfirm ? (
                        <div className="flex items-center gap-3 animate-fade-in">
                            <span className="text-sm text-red-600 font-medium">Confirm Wipe? Include data loss.</span>
                            <button
                                onClick={() => setWipeConfirm(false)}
                                className="px-3 py-1.5 text-sm bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleWipeDevice}
                                disabled={isProcessing}
                                className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors shadow-sm"
                            >
                                {isProcessing ? 'Wiping...' : 'Yes, Wipe Device'}
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setWipeConfirm(true)}
                            className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            Remote Wipe
                        </button>
                    )}

                    <div className="flex gap-3">
                        <button type="button" onClick={onClose} className="btn btn-outline bg-white">Close</button>
                        <button type="button" onClick={handleCheckCompliance} disabled={isProcessing} className="btn btn-primary">
                            {isProcessing ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Checking...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                    Check Compliance
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeviceComplianceView;
