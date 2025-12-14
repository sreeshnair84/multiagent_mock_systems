import React, { useState } from 'react';
import { devicesApi } from '../services/api';
import '../styles/design-system.css';

interface DeviceProvisionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDeviceProvisioned: () => void;
}

const DeviceProvisionModal: React.FC<DeviceProvisionModalProps> = ({ isOpen, onClose, onDeviceProvisioned }) => {
    const [formData, setFormData] = useState({
        serial_number: '',
        user_email: '',
        device_type: 'Company',
        os_version: 'Windows 11',
        manufacturer: 'Dell',
        model: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await devicesApi.provision(formData);
            onDeviceProvisioned();
            onClose();
        } catch (error) {
            console.error('Failed to provision device', error);
            alert('Failed to provision device');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="glass-card w-full max-w-lg relative z-10 animate-scale-in flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Provision New Device</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Serial Number</label>
                        <input
                            type="text"
                            required
                            className="input w-full font-mono"
                            value={formData.serial_number}
                            onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                            placeholder="SN123456789"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Assigned User Email</label>
                        <input
                            type="email"
                            required
                            className="input w-full"
                            value={formData.user_email}
                            onChange={(e) => setFormData({ ...formData, user_email: e.target.value })}
                            placeholder="user@example.com"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Device Type</label>
                            <select
                                className="input w-full"
                                value={formData.device_type}
                                onChange={(e) => setFormData({ ...formData, device_type: e.target.value })}
                            >
                                <option value="Company">Company Owned</option>
                                <option value="Personal">Personal (BYOD)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">OS Version</label>
                            <select
                                className="input w-full"
                                value={formData.os_version}
                                onChange={(e) => setFormData({ ...formData, os_version: e.target.value })}
                            >
                                <option value="Windows 11">Windows 11</option>
                                <option value="Windows 10">Windows 10</option>
                                <option value="macOS Sonoma">macOS Sonoma</option>
                                <option value="iOS 17">iOS 17</option>
                                <option value="Android 14">Android 14</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Manufacturer</label>
                            <input
                                type="text"
                                className="input w-full"
                                value={formData.manufacturer}
                                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                                placeholder="Dell, HP, Apple..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Model</label>
                            <input
                                type="text"
                                className="input w-full"
                                value={formData.model}
                                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                placeholder="Latitude 7420"
                            />
                        </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-sm text-yellow-800 flex items-start gap-3">
                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        <p>Device will be enrolled in Intune and compliance policies will be applied immediately upon first sync.</p>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                            {isSubmitting ? 'Provisioning...' : 'Provision Device'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DeviceProvisionModal;
