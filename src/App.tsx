import React, { useState, useEffect } from 'react';
import { UserProfile, LinkItem } from './types';
import { GetIcon } from './components/Icons';
import QRCodeModal from './components/QRCodeModal';
import AvatarSelectionModal from './components/AvatarSelectionModal';
import AnalyticsModal from './components/AnalyticsModal';
import AndroidSaveGuideModal from './components/AndroidSaveGuideModal';
import { generateProfessionalBio, generateVCardData } from './services/geminiService';
import { INITIAL_PROFILE, INITIAL_LINKS, PLATFORMS, THEME_PRESETS, PLATFORM_BASE_URLS } from './constants/data';
import { validateAndFormatUrl } from './utils/validation';

export function App() {
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [links, setLinks] = useState<LinkItem[]>(INITIAL_LINKS);
  const [showQR, setShowQR] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const [bioTone, setBioTone] = useState<'professional' | 'creative' | 'friendly' | 'humorous' | 'inspirational'>('professional');
  const [copiedLink, setCopiedLink] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  
  // OS Detection State for Contact Saving
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);

  // Edit State for Profile
  const [editProfile, setEditProfile] = useState<UserProfile>(INITIAL_PROFILE);

  // Add Link State
  const [activePlatformId, setActivePlatformId] = useState(PLATFORMS[0].id);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkTitle, setNewLinkTitle] = useState(PLATFORMS[0].label);

  const activeProfile = isPreviewMode ? editProfile : profile;
  const showEditControls = isEditing && !isPreviewMode;
  const isUrlValid = newLinkUrl && !linkError && validateAndFormatUrl(newLinkUrl, activePlatformId).isValid;

  // Load analytics
  useEffect(() => {
    const savedClicks = localStorage.getItem('tabNode_clicks');
    if (savedClicks) {
        try {
            const clicksMap = JSON.parse(savedClicks);
            setLinks(currentLinks => currentLinks.map(link => ({
                ...link,
                clicks: clicksMap[link.id] !== undefined ? clicksMap[link.id] : link.clicks
            })));
        } catch (e) {
            console.error("Failed to load analytics", e);
        }
    }
  }, []);

  useEffect(() => {
    if (isEditing) {
      setEditProfile(profile);
    }
  }, [isEditing, profile]);

  const handleLinkClick = (id: string) => {
    if (showEditControls) return;
    const newLinks = links.map(link => {
        if (link.id === id) return { ...link, clicks: (link.clicks || 0) + 1 };
        return link;
    });
    setLinks(newLinks);
    const clicksMap = newLinks.reduce((acc, link) => ({ ...acc, [link.id]: link.clicks || 0 }), {} as Record<string, number>);
    localStorage.setItem('tabNode_clicks', JSON.stringify(clicksMap));
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${activeProfile.name} - Digital Card`,
          text: activeProfile.bio,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      handleCopyLink();
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

  const handleAIBioGen = async () => {
    if (!editProfile.bio) return;
    setIsGeneratingBio(true);
    const newBio = await generateProfessionalBio(editProfile.bio, editProfile.role, bioTone);
    setEditProfile(prev => ({ ...prev, bio: newBio }));
    setIsGeneratingBio(false);
  };

  const saveProfileChanges = () => {
    setProfile(editProfile);
    setIsEditing(false);
    setIsPreviewMode(false);
  };

  const handleBlurUrl = () => {
    if (!newLinkUrl) return;
    const validation = validateAndFormatUrl(newLinkUrl, activePlatformId);
    if (!validation.isValid) {
        setLinkError(validation.error || 'Invalid input');
    } else {
        setLinkError(null);
        setNewLinkUrl(validation.formattedUrl);
    }
  };

  const handleAddLink = () => {
    const validation = validateAndFormatUrl(newLinkUrl, activePlatformId);
    if (!validation.isValid) {
        setLinkError(validation.error || 'Invalid input');
        return;
    }
    const platform = PLATFORMS.find(p => p.id === activePlatformId) || PLATFORMS[0];
    let type: LinkItem['type'] = 'social';
    if (['phone', 'email', 'contact', 'whatsapp'].includes(platform.id)) {
        type = 'contact';
    } else if (['website', 'custom'].includes(platform.id)) {
        type = 'website';
    }

    const newLink: LinkItem = {
      id: Date.now().toString(),
      title: newLinkTitle || platform.label,
      url: validation.formattedUrl,
      type: type,
      iconName: platform.icon,
      clicks: 0
    };

    setLinks([...links, newLink]);
    if (activePlatformId === 'phone') setNewLinkUrl('tel:');
    else if (activePlatformId === 'email') setNewLinkUrl('mailto:');
    else setNewLinkUrl('');
    setNewLinkTitle(platform.label);
    setLinkError(null);
  };

  const handleDeleteLink = (id: string) => {
    setLinks(links.filter(l => l.id !== id));
  };

  const handleMoveLink = (index: number, direction: 'up' | 'down') => {
    const newLinks = [...links];
    if (direction === 'up' && index > 0) {
        [newLinks[index], newLinks[index - 1]] = [newLinks[index - 1], newLinks[index]];
    } else if (direction === 'down' && index < newLinks.length - 1) {
        [newLinks[index], newLinks[index + 1]] = [newLinks[index + 1], newLinks[index]];
    }
    setLinks(newLinks);
  };

  const handleAvatarUpdate = (newUrl: string) => {
    setEditProfile(prev => ({ ...prev, avatarUrl: newUrl }));
    setShowAvatarModal(false);
  };

  const getPlaceholder = (platformId: string) => {
    const platform = PLATFORMS.find(p => p.id === platformId);
    // Use the placeholder from data if we add it there in future, 
    // but for now relying on the switch logic or potentially moving it content data.ts
    // For this refactor, I'll keep the switch logic here or move it to a helper.
    // Given the previous monolithic file, I'll keep it simple here.
    switch (platformId) {
        case 'email': return 'hello@example.com';
        case 'phone': return '+1 234 567 8900';
        case 'whatsapp': return '+1 234 567 8900';
        case 'telegram': return 'username or https://t.me/user';
        case 'tiktok': return 'username or https://tiktok.com/@user';
        case 'youtube': return 'username or https://youtube.com/@channel';
        case 'instagram': return 'username or https://instagram.com/user';
        case 'threads': return 'username or https://threads.net/@user';
        case 'twitter': return 'username or https://twitter.com/user';
        case 'facebook': return 'https://facebook.com/user';
        case 'linkedin': return 'https://linkedin.com/in/user';
        case 'github': return 'username or https://github.com/user';
        case 'discord': return 'Invite Code or https://discord.gg/...';
        case 'pinterest': return 'username or https://pinterest.com/user';
        case 'website': return 'https://mysite.com';
        case 'custom': return 'https://your-link.com';
        default: return 'https://...';
    }
  };

  const isCustomTheme = activeProfile.themeColor.startsWith('#');
  const headerStyle = isCustomTheme ? { backgroundColor: activeProfile.themeColor } : {};
  const headerClass = `h-40 relative shrink-0 ${!isCustomTheme ? `bg-gradient-to-r ${activeProfile.themeColor}` : ''}`;

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center pb-safe">
      <div className="w-full max-w-md bg-white shadow-xl min-h-screen relative overflow-hidden flex flex-col pb-24">
        
        {/* === Header / Cover Area === */}
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
                onClick={() => setIsEditing(!isEditing)}
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

        {/* === Profile Section === */}
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
                    <label className="text-[10px] font-bold text-blue-400 uppercase tracking-wide ml-1 mb-1.5 block">AI Tone Style</label>
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

          <div className="px-6 py-8 flex flex-col gap-4 flex-grow">
            {links.map((link, index) => (
                <div key={link.id} className="relative group">
                    {/* Reorder Controls */}
                    {showEditControls && (
                        <div className="absolute -top-3 -left-3 flex flex-col gap-1 z-20">
                             <button
                                onClick={(e) => { e.stopPropagation(); handleMoveLink(index, 'up'); }}
                                disabled={index === 0}
                                className="p-1 bg-white border border-gray-200 rounded-full shadow-sm text-gray-500 hover:text-blue-600 hover:border-blue-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                             >
                                <GetIcon name="ChevronUp" className="w-3.5 h-3.5" />
                             </button>
                             <button
                                onClick={(e) => { e.stopPropagation(); handleMoveLink(index, 'down'); }}
                                disabled={index === links.length - 1}
                                className="p-1 bg-white border border-gray-200 rounded-full shadow-sm text-gray-500 hover:text-blue-600 hover:border-blue-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                             >
                                <GetIcon name="ChevronDown" className="w-3.5 h-3.5" />
                             </button>
                        </div>
                    )}

                    <a 
                        href={showEditControls ? undefined : link.url}
                        target={showEditControls ? undefined : "_blank"}
                        rel="noreferrer"
                        onClick={() => handleLinkClick(link.id)}
                        className={`bg-white border p-4 rounded-2xl flex items-center justify-between shadow-sm transition-all duration-200 
                            ${showEditControls ? 'border-gray-200 opacity-90' : 'border-gray-200 hover:shadow-md hover:border-blue-200 hover:-translate-y-0.5 cursor-pointer'}
                        `}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-2.5 rounded-xl ${link.type === 'social' ? 'bg-gray-50 text-gray-600' : 'bg-blue-50 text-blue-600'} transition-colors duration-300`}>
                                <GetIcon name={link.iconName} className="w-5 h-5" />
                            </div>
                            <span className="font-semibold text-gray-800">{link.title}</span>
                        </div>
                        {!showEditControls && (
                            <div className="text-gray-300 group-hover:translate-x-1 group-hover:text-blue-400 transition-all">
                                <GetIcon name="Send" className="w-4 h-4 rotate-[-45deg]" />
                            </div>
                        )}
                    </a>
                    
                    {showEditControls && (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteLink(link.id);
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md hover:bg-red-600 transition-colors z-10"
                        >
                            <GetIcon name="Trash2" className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ))}

            {showEditControls && (
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-4 animate-fade-in mt-2">
                    <h3 className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-wide flex items-center gap-2">
                        <GetIcon name="Plus" className="w-4 h-4" />
                        Add New Link
                    </h3>
                    
                    <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar mb-2">
                        {PLATFORMS.map(p => (
                            <button 
                                key={p.id}
                                onClick={() => {
                                    setActivePlatformId(p.id);
                                    setNewLinkTitle(p.label);
                                    setLinkError(null);
                                    if (p.id === 'phone') {
                                        setNewLinkUrl('tel:');
                                    } else if (p.id === 'email') {
                                        setNewLinkUrl('mailto:');
                                    } else {
                                        setNewLinkUrl('');
                                    }
                                }}
                                className={`flex flex-col items-center gap-2 min-w-[70px] p-3 rounded-xl border transition-all ${activePlatformId === p.id ? 'border-blue-500 bg-blue-50 text-blue-600 ring-2 ring-blue-100' : 'border-gray-200 bg-white text-gray-400 hover:bg-gray-50'}`}
                            >
                                <GetIcon name={p.icon} className="w-6 h-6" />
                                <span className="text-[10px] font-semibold">{p.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Title</label>
                            <input 
                                type="text" 
                                placeholder="Link Title"
                                value={newLinkTitle}
                                onChange={e => setNewLinkTitle(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">URL</label>
                            <div className="relative">
                                <input 
                                    type={(activePlatformId === 'phone' || activePlatformId === 'whatsapp') ? 'tel' : 'url'} 
                                    placeholder={getPlaceholder(activePlatformId)}
                                    value={newLinkUrl}
                                    onChange={e => {
                                        setNewLinkUrl(e.target.value);
                                        if (linkError) setLinkError(null);
                                    }}
                                    onBlur={handleBlurUrl}
                                    className={`w-full bg-white border rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:outline-none transition-colors pr-10 ${linkError ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-400'}`}
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                                    {linkError ? (
                                        <GetIcon name="AlertCircle" className="w-5 h-5 text-red-500" />
                                    ) : (
                                        isUrlValid && <GetIcon name="Check" className="w-5 h-5 text-green-500" />
                                    )}
                                </div>
                            </div>
                            {linkError && (
                                <p className="text-xs text-red-500 mt-1.5 font-medium ml-1 animate-fade-in">
                                    {linkError}
                                </p>
                            )}
                        </div>
                        <button 
                            onClick={handleAddLink} 
                            disabled={!newLinkUrl || !!linkError}
                            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <GetIcon name="Plus" className="w-4 h-4" />
                            Add Link
                        </button>
                    </div>
                </div>
            )}
            
            {/* Spacer for sticky bottom bar */}
             <div className="h-20"></div>
        </div>

        {/* === Sticky Bottom Action Bar (Thumb Zone) === */}
        {!showEditControls && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-gray-100 flex gap-3 z-40 pb-safe">
                <button 
                    onClick={handleSaveContact}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white py-4 rounded-2xl font-bold text-base shadow-lg shadow-gray-200 hover:scale-[1.02] active:scale-95 transition-all"
                >
                    <GetIcon name="Download" className="w-5 h-5" />
                    Save Contact
                </button>
                <button 
                    onClick={handleCopyLink}
                    className={`flex items-center justify-center w-14 rounded-2xl border font-bold text-sm transition-all hover:bg-gray-50 active:scale-95 ${copiedLink ? 'border-green-500 text-green-600 bg-green-50' : 'border-gray-200 text-gray-700 bg-white'}`}
                >
                    {copiedLink ? <GetIcon name="Check" className="w-6 h-6" /> : <GetIcon name="Copy" className="w-6 h-6" />}
                </button>
            </div>
        )}

        {isPreviewMode && (
            <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 animate-bounce-in">
                <button 
                    onClick={() => setIsPreviewMode(false)}
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
            isOpen={showQR} 
            onClose={() => setShowQR(false)} 
            url={window.location.href}
            avatarUrl={activeProfile.avatarUrl}
            username={activeProfile.name.replace(/\s+/g, '').toLowerCase()}
        />

        <AvatarSelectionModal 
            isOpen={showAvatarModal}
            onClose={() => setShowAvatarModal(false)}
            onSelect={handleAvatarUpdate}
        />
        
        <AnalyticsModal 
            isOpen={showAnalytics}
            onClose={() => setShowAnalytics(false)}
            links={links}
        />
        
        <AndroidSaveGuideModal 
            isOpen={showAndroidGuide}
            onClose={() => setShowAndroidGuide(false)}
        />

      </div>
    </div>
  );
}