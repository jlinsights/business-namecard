import React, { useEffect } from 'react';
import { GetIcon } from './components/Icons';
import QRCodeModal from './components/QRCodeModal';
import AvatarSelectionModal from './components/AvatarSelectionModal';
import AnalyticsModal from './components/AnalyticsModal';
import AndroidSaveGuideModal from './components/AndroidSaveGuideModal';

import { useProfile } from './hooks/useProfile';
import { useLinks } from './hooks/useLinks';
import { useAppUI } from './hooks/useAppUI';

import { Header } from './components/Header';
import { ProfileSection } from './components/profile/ProfileSection';
import { LinkList } from './components/links/LinkList';
import { LinkEditor } from './components/links/LinkEditor';

export function App() {
  const ui = useAppUI();
  const profileHook = useProfile(ui.isPreviewMode);
  const linksHook = useLinks();

  // Sync isEditing with profile hook if needed, or handle save/cancel sync
  // Actually, checking original code, "saveProfileChanges" did setEditProfile and closed edit mode.
  // My extracted hook has saveProfileChanges but doesn't control isEditing.
  // I need to wrap it.
  
  const handleSaveAll = () => {
      profileHook.saveProfileChanges();
      ui.setIsEditing(false);
      ui.setIsPreviewMode(false);
  };
  
  // Also sync initial profile to editProfile when entering edit mode?
  // Original code: useEffect(() => { if (isEditing) { setEditProfile(profile); } }, [isEditing, profile]);
  useEffect(() => {
      if (ui.isEditing) {
          profileHook.setEditProfile(profileHook.profile);
      }
  }, [ui.isEditing, profileHook.profile]); // Adding profileHook.profile to dep array might cause loop if not careful, but profile isn't changing during edit usually.
  // Actually, wait. "editProfile" is local state in hook. "profile" is "committed" state in hook.
  // The hook exposes setEditProfile.
  // This effect needs to be here or inside the hook. 
  // Inside the hook I didn't pass isEditing.
  // So keeping it here is fine.

  // Handle Share Wrapper
  const onShare = () => {
    ui.handleShare(
        `${profileHook.activeProfile.name} - Digital Card`, 
        profileHook.activeProfile.bio
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center pb-safe">
      <div className="w-full max-w-md bg-white shadow-xl min-h-screen relative overflow-hidden flex flex-col pb-24">
        
        {/* === Header / Cover Area === */}
        <Header 
            isCustomTheme={profileHook.activeProfile.themeColor.startsWith('#')}
            activeProfile={{ themeColor: profileHook.activeProfile.themeColor }}
            isEditing={ui.isEditing}
            isPreviewMode={ui.isPreviewMode}
            setIsPreviewMode={ui.setIsPreviewMode}
            setShowAnalytics={ui.setShowAnalytics}
            toggleEdit={ui.toggleEdit}
            handleSaveContact={profileHook.handleSaveContact}
            setShowQR={ui.setShowQR}
            handleShare={onShare}
        />

        {/* === Profile Section === */}
        <ProfileSection 
            activeProfile={profileHook.activeProfile}
            editProfile={profileHook.editProfile}
            setEditProfile={profileHook.setEditProfile}
            showEditControls={ui.showEditControls}
            setShowAvatarModal={ui.setShowAvatarModal}
            bioTone={profileHook.bioTone}
            setBioTone={profileHook.setBioTone}
            isGeneratingBio={profileHook.isGeneratingBio}
            handleAIBioGen={profileHook.handleAIBioGen}
            saveProfileChanges={handleSaveAll}
        />

        <div className="px-6 py-8 flex flex-col gap-4 flex-grow">
            <LinkList 
                links={linksHook.links}
                showEditControls={ui.showEditControls}
                handleLinkClick={linksHook.trackClick}
                handleMoveLink={linksHook.handleMoveLink}
                handleDeleteLink={linksHook.handleDeleteLink}
            />

            {ui.showEditControls && (
                <LinkEditor 
                     activePlatformId={linksHook.activePlatformId}
                     setActivePlatformId={(id) => linksHook.selectPlatform(id)} // selectPlatform takes id
                     selectPlatform={linksHook.selectPlatform}
                     newLinkTitle={linksHook.newLinkTitle}
                     setNewLinkTitle={linksHook.setNewLinkTitle}
                     newLinkUrl={linksHook.newLinkUrl}
                     setNewLinkUrl={linksHook.setNewLinkUrl}
                     linkError={linksHook.linkError}
                     setLinkError={linksHook.setLinkError}
                     handleAddLink={linksHook.handleAddLink}
                     validateCurrentUrl={linksHook.validateCurrentUrl}
                />
            )}
            
            {/* Spacer for sticky bottom bar */}
             <div className="h-20"></div>
        </div>

        {/* === Sticky Bottom Action Bar (Thumb Zone) === */}
        {!ui.showEditControls && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-gray-100 flex gap-3 z-40 pb-safe">
                <button 
                    onClick={profileHook.handleSaveContact}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white py-4 rounded-2xl font-bold text-base shadow-lg shadow-gray-200 hover:scale-[1.02] active:scale-95 transition-all"
                >
                    <GetIcon name="Download" className="w-5 h-5" />
                    Save Contact
                </button>
                <button 
                    onClick={ui.handleCopyLink}
                    className={`flex items-center justify-center w-14 rounded-2xl border font-bold text-sm transition-all hover:bg-gray-50 active:scale-95 ${ui.copiedLink ? 'border-green-500 text-green-600 bg-green-50' : 'border-gray-200 text-gray-700 bg-white'}`}
                >
                    {ui.copiedLink ? <GetIcon name="Check" className="w-6 h-6" /> : <GetIcon name="Copy" className="w-6 h-6" />}
                </button>
            </div>
        )}

        {ui.isPreviewMode && (
            <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 animate-bounce-in">
                <button 
                    onClick={() => ui.setIsPreviewMode(false)}
                    className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-xl hover:scale-105 transition font-medium ring-2 ring-white"
                >
                    <GetIcon name="EyeOff" className="w-4 h-4" />
                    Exit Preview
                </button>
            </div>
        )}
        
        {/* Footer Branding */}
        <div className="w-full text-center pb-8 shrink-0 bg-white">
             <div className="flex items-center justify-center gap-2 text-gray-300 text-xs font-medium">
                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                <span>TabNode</span>
             </div>
        </div>

        <QRCodeModal 
            isOpen={ui.showQR} 
            onClose={() => ui.setShowQR(false)} 
            url={window.location.href}
            avatarUrl={profileHook.activeProfile.avatarUrl}
            username={profileHook.activeProfile.name.replace(/\s+/g, '').toLowerCase()}
        />

        <AvatarSelectionModal 
            isOpen={ui.showAvatarModal}
            onClose={() => ui.setShowAvatarModal(false)}
            onSelect={(url) => { 
                profileHook.setEditProfile(prev => ({ ...prev, avatarUrl: url }));
                ui.setShowAvatarModal(false);
            }}
        />
        
        <AnalyticsModal 
            isOpen={ui.showAnalytics}
            onClose={() => ui.setShowAnalytics(false)}
            links={linksHook.links}
        />
        
        <AndroidSaveGuideModal 
            isOpen={profileHook.showAndroidGuide}
            onClose={() => profileHook.setShowAndroidGuide(false)}
        />

      </div>
    </div>
  );
}