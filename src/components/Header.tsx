import React from 'react';
import { GetIcon } from './Icons';

interface HeaderProps {
  isCustomTheme: boolean;
  activeProfile: { themeColor: string };
  isEditing: boolean;
  isPreviewMode: boolean;
  setIsPreviewMode: (val: boolean) => void;
  setShowAnalytics: (val: boolean) => void;
  toggleEdit: () => void;
  handleSaveContact: () => void;
  setShowQR: (val: boolean) => void;
  handleShare: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isCustomTheme,
  activeProfile,
  isEditing,
  isPreviewMode,
  setIsPreviewMode,
  setShowAnalytics,
  toggleEdit,
  handleSaveContact,
  setShowQR,
  handleShare
}) => {
  const headerStyle = isCustomTheme ? { backgroundColor: activeProfile.themeColor } : {};
  const headerClass = `h-40 relative shrink-0 ${!isCustomTheme ? `bg-gradient-to-r ${activeProfile.themeColor}` : ''}`;

  return (
    <div className={headerClass} style={headerStyle}>
      <div className="absolute top-4 right-4 flex gap-2">
        {isEditing && !isPreviewMode && (
            <button 
                onClick={() => setShowAnalytics(true)}
                className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition text-white"
                title="Analytics"
            >
                <GetIcon name="BarChart2" className="w-5 h-5" />
            </button>
        )}
        {isEditing && !isPreviewMode && (
          <button 
            onClick={() => setIsPreviewMode(true)}
            className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition text-white"
            title="Preview Mode"
          >
            <GetIcon name="Eye" className="w-5 h-5" />
          </button>
        )}
        {!isPreviewMode && (
          <button 
            onClick={toggleEdit}
            className={`p-2 backdrop-blur-md rounded-full transition text-white ${isEditing ? 'bg-white text-gray-900' : 'bg-white/20 hover:bg-white/30'}`}
          >
            <GetIcon name={isEditing ? "X" : "Edit2"} className="w-5 h-5" />
          </button>
        )}
        {(!isEditing || isPreviewMode) && (
          <>
            <button 
              onClick={handleSaveContact}
              className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition text-white"
              title="Save Contact"
            >
              <GetIcon name="Download" className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowQR(true)}
              className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition text-white"
            >
              <GetIcon name="QrCode" className="w-5 h-5" />
            </button>
            <button 
              onClick={handleShare}
              className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition text-white"
            >
              <GetIcon name="Share2" className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
