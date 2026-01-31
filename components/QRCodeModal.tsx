import React from 'react';
import { GetIcon } from './Icons';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  avatarUrl: string;
  username: string;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, url, avatarUrl, username }) => {
  if (!isOpen) return null;

  // Using a reliable public API for QR generation to avoid heavy local libraries in this environment
  // In a production app, we would use 'qrcode.react' or similar.
  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}&color=2563EB&bgcolor=FFFFFF&margin=10`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <style>{`
        @keyframes gentle-pulse {
          0%, 100% { transform: scale(1); filter: brightness(100%); }
          50% { transform: scale(1.03); filter: brightness(102%); }
        }
        .qr-animation {
          animation: gentle-pulse 4s infinite ease-in-out;
        }
      `}</style>
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative animate-scale-up">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors z-20"
        >
          <GetIcon name="X" className="w-5 h-5 text-gray-600" />
        </button>

        <div className="p-8 flex flex-col items-center text-center">
          <div className="relative mb-6">
             <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden relative z-10">
                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
             </div>
             <div className="absolute -inset-1 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full blur opacity-50"></div>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-1">@{username}</h3>
          <p className="text-sm text-gray-500 mb-6">Scan to view profile</p>

          <div className="bg-white p-3 rounded-2xl border border-blue-100 shadow-xl shadow-blue-50/50 mb-6 relative overflow-hidden group">
            <img 
              src={qrCodeApiUrl} 
              alt="QR Code" 
              className="w-48 h-48 object-contain rounded-xl qr-animation"
            />
          </div>

          <p className="text-xs text-gray-400">Share this code with others directly</p>
        </div>

        {/* Action Footer */}
        <div className="bg-gray-50 p-4 flex gap-3">
          <button 
             onClick={() => {
                // Determine download approach (simple link open for this demo)
                window.open(qrCodeApiUrl, '_blank');
             }}
             className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition hover:shadow-sm"
          >
            <GetIcon name="Download" className="w-4 h-4" />
            Save Image
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;