import React, { useEffect, useState } from 'react';

interface ConnectionStatusProps {
    isConnected: boolean;
    onRetry?: () => void;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ isConnected, onRetry }) => {
    const [showReconnecting, setShowReconnecting] = useState(false);

    useEffect(() => {
        if (!isConnected) {
            setShowReconnecting(true);
        } else {
            setShowReconnecting(false);
        }
    }, [isConnected]);

    if (isConnected) {
        return null; // Don't show anything when connected
    }

    return (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
            <div className="bg-red-50 border border-red-200 rounded-full px-4 py-2 shadow-lg flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <span className="text-sm font-medium text-red-700">
                        {showReconnecting ? 'Connection Lost' : 'Disconnected'}
                    </span>
                </div>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="text-xs bg-red-600 text-white px-3 py-1 rounded-full hover:bg-red-700 transition-colors font-medium"
                    >
                        Retry
                    </button>
                )}
            </div>
        </div>
    );
};
