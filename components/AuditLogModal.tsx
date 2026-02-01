import React from 'react';
import { GetIcon } from './Icons';
import { AuditLogEntry } from '../types';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock Data for demonstration
const MOCK_LOGS: AuditLogEntry[] = [
  { id: '1', action: 'Profile View (Public)', timestamp: Date.now() - 120000, ipAddress: '192.168.1.10', device: 'Mobile (iOS)', status: 'success' },
  { id: '2', action: 'Contact Info Revealed', timestamp: Date.now() - 3600000, ipAddress: '45.32.11.23', device: 'Desktop (Chrome)', status: 'warning' },
  { id: '3', action: 'Login (Biometric)', timestamp: Date.now() - 86400000, ipAddress: '10.0.0.5', device: 'Mobile (iOS)', status: 'success' },
  { id: '4', action: 'Sensitive Link Access', timestamp: Date.now() - 172800000, ipAddress: '210.11.44.12', device: 'Unknown', status: 'failed' },
  { id: '5', action: 'Profile Updated', timestamp: Date.now() - 250000000, ipAddress: '10.0.0.5', device: 'Mobile (iOS)', status: 'success' },
];

const AuditLogModal: React.FC<AuditLogModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative animate-scale-up flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <GetIcon name="ShieldCheck" className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900">Security Audit Log</h3>
                    <p className="text-xs text-gray-500">Immutable Record (WORM Compliant)</p>
                </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500">
                <GetIcon name="X" className="w-5 h-5" />
            </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-0">
            {MOCK_LOGS.map((log, index) => (
                <div key={log.id} className={`p-4 border-b border-gray-50 flex items-start gap-3 hover:bg-gray-50 transition-colors ${index === MOCK_LOGS.length - 1 ? 'border-none' : ''}`}>
                    <div className="mt-1">
                        {log.status === 'success' && <GetIcon name="Check" className="w-4 h-4 text-green-500" />}
                        {log.status === 'warning' && <GetIcon name="Eye" className="w-4 h-4 text-orange-500" />}
                        {log.status === 'failed' && <GetIcon name="ShieldAlert" className="w-4 h-4 text-red-500" />}
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-semibold text-gray-800">{log.action}</span>
                            <span className="text-[10px] text-gray-400">{new Date(log.timestamp).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-mono">{log.ipAddress}</span>
                            <span>•</span>
                            <span>{log.device}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
            <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1">
                <GetIcon name="Lock" className="w-3 h-3" />
                Logged by Enterprise Security Monitor
            </p>
        </div>
      </div>
    </div>
  );
};

export default AuditLogModal;