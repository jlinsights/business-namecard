import { useState } from 'react';

export function useAppUI() {
  const [showQR, setShowQR] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const showEditControls = isEditing && !isPreviewMode;

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  const handleShare = async (title: string, text: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      handleCopyLink();
    }
  };

  const toggleEdit = () => setIsEditing(prev => !prev);

  return {
    showQR, setShowQR,
    showAvatarModal, setShowAvatarModal,
    showAnalytics, setShowAnalytics,
    isEditing, setIsEditing,
    isPreviewMode, setIsPreviewMode,
    copiedLink,
    showEditControls,
    handleCopyLink,
    handleShare,
    toggleEdit
  };
}
