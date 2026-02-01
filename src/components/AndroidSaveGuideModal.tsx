import React from 'react';
import { GetIcon } from './Icons';

interface AndroidSaveGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AndroidSaveGuideModal: React.FC<AndroidSaveGuideModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-sm p-6 pb-10 sm:pb-6 relative animate-slide-up-mobile">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full">
                    <GetIcon name="X" className="w-5 h-5 text-gray-600" />
                </button>
                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                        <GetIcon name="Download" className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">File Downloaded</h3>
                    <p className="text-sm text-gray-600 mb-6">
                        To save the contact, please pull down your notification shade and tap the 
                        <span className="font-bold text-gray-800"> .vcf file</span> that just finished downloading.
                    </p>
                    <button onClick={onClose} className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl">
                        Got it
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AndroidSaveGuideModal;
