import { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { INITIAL_PROFILE } from '../constants/data';
import { generateProfessionalBio, generateVCardData } from '../services/geminiService';

export function useProfile(isPreviewMode: boolean) {
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [editProfile, setEditProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const [bioTone, setBioTone] = useState<'professional' | 'creative' | 'friendly' | 'humorous' | 'inspirational'>('professional');
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);

  // Sync editProfile with profile when not editing (or initial load)
  // Actually, better pattern: initialize editProfile with profile when entering edit mode?
  // For now preserving original logic: 
  // "useEffect(() => { if (isEditing) { setEditProfile(profile); } }, [isEditing, profile]);"
  // But since we are extracting, let's keep it simple. Accessing via prop or managing sync here.
  // In the original code, `activeProfile` derived from `isPreviewMode ? editProfile : profile`.
  
  const activeProfile = isPreviewMode ? editProfile : profile;

  const handleAIBioGen = async () => {
    if (!editProfile.bio) return;
    setIsGeneratingBio(true);
    try {
        const newBio = await generateProfessionalBio(editProfile.bio, editProfile.role, bioTone);
        setEditProfile(prev => ({ ...prev, bio: newBio }));
    } catch (error) {
        console.error("AI Bio Generation failed", error);
    } finally {
        setIsGeneratingBio(false);
    }
  };

  const handleSaveContact = () => {
    const vCardData = generateVCardData(
      activeProfile.name,
      activeProfile.phone,
      activeProfile.email,
      activeProfile.role,
      activeProfile.websiteUrl || window.location.href
    );
    const blob = new Blob([vCardData], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${activeProfile.name.replace(/\s+/g, "_")}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // OS Detection Logic
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    if (/android/i.test(userAgent)) {
        setShowAndroidGuide(true);
    }
  };

  const saveProfileChanges = () => {
    setProfile(editProfile);
  };

  const cancelProfileChanges = () => {
      setEditProfile(profile);
  };

  // Sync edit profile when real profile changes (e.g. initial load if we had it, or reset)
  // Or when entering edit mode (managed by parent or check existence)
  // For this refactor, let's expose setEditProfile and handle sync in effect if needed, 
  // or just initialize.
  
  return {
    profile,
    editProfile,
    activeProfile,
    setEditProfile,
    setProfile, // Exposed if needed
    isGeneratingBio,
    bioTone,
    setBioTone,
    handleAIBioGen,
    handleSaveContact,
    saveProfileChanges,
    cancelProfileChanges,
    showAndroidGuide,
    setShowAndroidGuide
  };
}
