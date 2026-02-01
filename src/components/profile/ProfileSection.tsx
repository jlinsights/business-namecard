import React from 'react';
import { UserProfile } from '../../types';
import { GetIcon } from '../Icons';
import { THEME_PRESETS } from '../../constants/data';

interface ProfileSectionProps {
  activeProfile: UserProfile;
  editProfile: UserProfile;
  setEditProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  showEditControls: boolean;
  setShowAvatarModal: (show: boolean) => void;
  bioTone: 'professional' | 'creative' | 'friendly' | 'humorous' | 'inspirational';
  setBioTone: (tone: 'professional' | 'creative' | 'friendly' | 'humorous' | 'inspirational') => void;
  isGeneratingBio: boolean;
  handleAIBioGen: () => void;
  saveProfileChanges: () => void;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  activeProfile,
  editProfile,
  setEditProfile,
  showEditControls,
  setShowAvatarModal,
  bioTone,
  setBioTone,
  isGeneratingBio,
  handleAIBioGen,
  saveProfileChanges
}) => {
  return (
    <div className="px-6 -mt-16 flex flex-col items-center relative z-10 shrink-0">
      <div className="relative group">
        <div className="w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-200 relative">
          <img src={activeProfile.avatarUrl} alt={activeProfile.name} className="w-full h-full object-cover" />
          {showEditControls && (
            <button 
              onClick={() => setShowAvatarModal(true)}
              className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <GetIcon name="Camera" className="w-8 h-8" />
            </button>
          )}
        </div>
        {showEditControls && (
            <button 
                onClick={() => setShowAvatarModal(true)}
                className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white shadow-md border-2 border-white hover:bg-blue-700 transition-colors"
            >
                <GetIcon name="Edit2" className="w-3 h-3" />
            </button>
        )}
      </div>

      <div className="mt-4 text-center w-full">
        {showEditControls ? (
           <div className="w-full space-y-3 mb-4 animate-fade-in">
              <input 
                type="text" 
                value={editProfile.name}
                onChange={(e) => setEditProfile({...editProfile, name: e.target.value})}
                className="w-full text-center text-xl font-bold border-b border-gray-200 pb-1 focus:border-blue-500 focus:outline-none bg-transparent"
                placeholder="Your Name"
              />
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={editProfile.role}
                  onChange={(e) => setEditProfile({...editProfile, role: e.target.value})}
                  className="w-1/2 text-center text-sm font-medium text-gray-500 border-b border-gray-200 pb-1 focus:border-blue-500 focus:outline-none bg-transparent"
                  placeholder="Role"
                />
                 <input 
                  type="text" 
                  value={editProfile.company}
                  onChange={(e) => setEditProfile({...editProfile, company: e.target.value})}
                  className="w-1/2 text-center text-sm font-medium text-gray-500 border-b border-gray-200 pb-1 focus:border-blue-500 focus:outline-none bg-transparent"
                  placeholder="Company"
                />
              </div>
              <div className="flex gap-2">
                <input 
                    type="text" 
                    value={editProfile.location}
                    onChange={(e) => setEditProfile({...editProfile, location: e.target.value})}
                    className="w-1/2 text-center text-xs text-gray-400 border-b border-gray-200 pb-1 focus:border-blue-500 focus:outline-none bg-transparent"
                    placeholder="Location"
                />
                 <input 
                    type="text" 
                    value={editProfile.websiteUrl || ''}
                    onChange={(e) => setEditProfile({...editProfile, websiteUrl: e.target.value})}
                    className="w-1/2 text-center text-xs text-gray-400 border-b border-gray-200 pb-1 focus:border-blue-500 focus:outline-none bg-transparent"
                    placeholder="Website URL"
                />
              </div>
           </div>
        ) : (
            <>
                <h1 className="text-2xl font-bold text-gray-900">{activeProfile.name}</h1>
                <p className="text-sm font-medium text-gray-500 mt-1">{activeProfile.role} @ {activeProfile.company}</p>
                
                <div className="flex items-center justify-center gap-3 mt-2 text-gray-400 text-sm">
                    <span className="flex items-center gap-1"><GetIcon name="MapPin" className="w-3 h-3" /> {activeProfile.location}</span>
                    {activeProfile.websiteUrl && (
                         <a href={activeProfile.websiteUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-500 hover:underline">
                            <GetIcon name="Link" className="w-3 h-3" /> 
                            {activeProfile.websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                         </a>
                    )}
                </div>
            </>
        )}

        {showEditControls ? (
          <div className="mt-4 w-full bg-blue-50 p-4 rounded-xl border border-blue-100 text-left animate-fade-in">
             <label className="text-xs font-bold text-blue-600 uppercase mb-2 block tracking-wide">Bio</label>
             <textarea 
                className="w-full bg-white border border-blue-200 rounded-lg p-3 text-sm text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none"
                rows={3}
                value={editProfile.bio}
                onChange={(e) => setEditProfile({...editProfile, bio: e.target.value})}
             />

             <div className="mt-3">
                <label className="text-[10px] font-bold text-blue-400 uppercase tracking-wide ml-1 mb-1.5 flex">AI Tone Style</label>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {(['professional', 'creative', 'friendly', 'humorous', 'inspirational'] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setBioTone(t)}
                            className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all whitespace-nowrap flex-shrink-0 ${
                                bioTone === t
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-blue-400 hover:text-blue-600 bg-blue-200/30'
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
             </div>

             <div className="flex gap-2 mt-3 mb-2">
                <button 
                    onClick={handleAIBioGen}
                    disabled={isGeneratingBio}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                    {isGeneratingBio ? (
                        <span className="animate-pulse">Generating...</span>
                    ) : (
                        <>
                            <GetIcon name="Sparkles" className="w-3 h-3" />
                            AI Polish
                        </>
                    )}
                </button>
             </div>
          </div>
        ) : (
            <p className="mt-4 text-gray-600 text-sm leading-relaxed max-w-xs mx-auto">
            {activeProfile.bio}
            </p>
        )}

        {showEditControls && (
            <div className="mt-4 w-full bg-gray-50 p-4 rounded-xl border border-gray-200 text-left animate-fade-in">
                <label className="text-xs font-bold text-gray-500 uppercase mb-3 block tracking-wide flex items-center gap-2">
                    <GetIcon name="Palette" className="w-3 h-3" />
                    Theme & Appearance
                </label>
                <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pb-1">
                    {THEME_PRESETS.map((theme) => (
                        <button
                            key={theme.id}
                            onClick={() => setEditProfile({ ...editProfile, themeColor: theme.value })}
                            className={`w-8 h-8 rounded-full shadow-sm ring-2 ring-offset-1 transition-all ${editProfile.themeColor === theme.value ? 'ring-blue-500 scale-110' : 'ring-transparent hover:ring-gray-300'}`}
                        >
                            <div className={`w-full h-full rounded-full ${theme.preview}`}></div>
                        </button>
                    ))}
                    <div className="w-px h-6 bg-gray-300 mx-1"></div>
                    <div className="relative group flex items-center">
                        <input 
                            type="color"
                            value={editProfile.themeColor.startsWith('#') ? editProfile.themeColor : '#ffffff'}
                            onChange={(e) => setEditProfile({ ...editProfile, themeColor: e.target.value })}
                            className="w-8 h-8 p-0 border-0 rounded-full overflow-hidden cursor-pointer shadow-sm ring-2 ring-offset-1 ring-transparent hover:ring-gray-300"
                        />
                         <span className="text-[10px] text-gray-400 ml-2 font-mono">
                            {editProfile.themeColor.startsWith('#') ? editProfile.themeColor.toUpperCase() : 'Custom'}
                         </span>
                    </div>
                </div>
            </div>
        )}
        
        {showEditControls && (
           <button 
              onClick={saveProfileChanges}
              className="w-full mt-4 bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition flex items-center justify-center gap-2"
            >
              <GetIcon name="Check" className="w-4 h-4" />
              Save All Changes
            </button>
        )}
      </div>
    </div>
  );
};
