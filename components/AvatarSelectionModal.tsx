import React, { useRef } from 'react';
import { GetIcon } from './Icons';

interface AvatarSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

const GALLERY_PRESETS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop', // Woman 1
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop', // Man 1
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop', // Woman 2
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop', // Man 2
  'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop', // Abstract Woman
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Felix', // Illustration
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Aneka', // Illustration
  'https://api.dicebear.com/9.x/shapes/svg?seed=TabNode', // Abstract Shapes
];

const AvatarSelectionModal: React.FC<AvatarSelectionModalProps> = ({ isOpen, onClose, onSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onSelect(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative animate-scale-up">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">Update Profile Photo</h3>
            <button 
                onClick={onClose}
                className="p-1.5 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
                <GetIcon name="X" className="w-4 h-4 text-gray-600" />
            </button>
        </div>

        <div className="p-6">
            {/* Upload Section */}
            <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-blue-200 bg-blue-50 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-100 transition-colors group mb-6"
            >
                <div className="p-3 bg-white rounded-full text-blue-500 mb-2 group-hover:scale-110 transition-transform shadow-sm">
                    <GetIcon name="Upload" className="w-6 h-6" />
                </div>
                <span className="text-sm font-semibold text-blue-600">Upload custom image</span>
                <span className="text-xs text-blue-400 mt-1">JPG, PNG up to 5MB</span>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileUpload}
                />
            </div>

            {/* Gallery Section */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <GetIcon name="ImageIcon" className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Choose from Gallery</span>
                </div>
                
                <div className="grid grid-cols-4 gap-3">
                    {GALLERY_PRESETS.map((url, index) => (
                        <button 
                            key={index}
                            onClick={() => onSelect(url)}
                            className="aspect-square rounded-xl overflow-hidden ring-2 ring-transparent hover:ring-blue-500 transition-all hover:opacity-90 relative"
                        >
                            <img src={url} alt={`Preset ${index}`} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarSelectionModal;