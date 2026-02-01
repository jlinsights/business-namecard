import React, { useState, useEffect } from 'react';
import { UserProfile, LinkItem } from './types';
import { GetIcon } from './components/Icons';
import QRCodeModal from './components/QRCodeModal';
import AvatarSelectionModal from './components/AvatarSelectionModal';
import AnalyticsModal from './components/AnalyticsModal';
import AuditLogModal from './components/AuditLogModal';
import { generateProfessionalBio, generateVCardData } from './services/geminiService';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

// --- DATA INITIALIZATION ---

const generateMockHistory = (count: number) => {
  const timestamps = [];
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    const randomTime = now - Math.floor(Math.random() * 604800000);
    timestamps.push(randomTime);
  }
  return timestamps;
};

const INITIAL_LINKS_1: LinkItem[] = [
  { 
    id: '101', title: '1:1 Strategy Call', url: 'https://calendly.com', type: 'commerce', iconName: 'Phone', 
    clicks: 12, clickTimestamps: generateMockHistory(12), price: '150', currency: '$', description: '30-min consultation for UX/UI review'
  },
  { 
    id: '1', title: 'Company Portfolio', url: 'https://tabnode.is', type: 'website', iconName: 'Globe', 
    clicks: 124, clickTimestamps: generateMockHistory(124)
  },
  { 
    id: '102', title: 'Q3 Design Proposal', url: 'https://dropbox.com', type: 'locked', iconName: 'Lock', 
    clicks: 5, clickTimestamps: generateMockHistory(5), isLocked: true, description: 'Confidential Client Access Only'
  },
  { 
    id: '3', title: 'LinkedIn', url: 'https://linkedin.com', type: 'social', iconName: 'Linkedin', 
    clicks: 156, clickTimestamps: generateMockHistory(156)
  },
];

const INITIAL_LINKS_2: LinkItem[] = [
  { id: '2', title: 'Instagram', url: 'https://instagram.com', type: 'social', iconName: 'Instagram', clicks: 215, clickTimestamps: generateMockHistory(215) },
  { 
    id: '201', title: 'Lightroom Presets Pack', url: 'https://gumroad.com', type: 'commerce', iconName: 'ShoppingBag', 
    clicks: 85, clickTimestamps: generateMockHistory(85), price: '29', currency: '$', description: 'The exact filters I use for my feed.'
  },
  { id: '7', title: 'Latest Video', url: 'https://youtube.com', type: 'social', iconName: 'Youtube', clicks: 85, clickTimestamps: generateMockHistory(85) },
];

const INITIAL_PROFILES: UserProfile[] = [
  {
    id: 'profile_1',
    type: 'business_card',
    organizationName: 'TabNode Corp.',
    isVerified: true,
    name: "Alex Sterling",
    role: "Senior Product Designer",
    company: "TabNode Creative",
    bio: "Crafting digital experiences that humanize technology. Passionate about minimalist design and accessibility.",
    avatarUrl: "https://picsum.photos/200/200",
    email: "alex@tabnode.is",
    phone: "+1 (555) 012-3456",
    location: "San Francisco, CA",
    websiteUrl: "https://tabnode.is",
    themeColor: "from-slate-800 to-slate-900",
    links: INITIAL_LINKS_1,
    privacySettings: {
        emailVisible: true,
        phoneVisible: true,
        locationVisible: true,
        maskSensitiveData: true
    }
  },
  {
    id: 'profile_2',
    type: 'personal',
    name: "Alex the Creator",
    role: "Content Creator",
    company: "Freelance",
    bio: "Sharing my journey in tech & design. New videos every Tuesday!",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
    email: "creator@tabnode.is",
    phone: "+1 (555) 999-8888",
    location: "Remote",
    websiteUrl: "https://youtube.com",
    themeColor: "from-pink-500 to-rose-500",
    links: INITIAL_LINKS_2,
    privacySettings: {
        emailVisible: true,
        phoneVisible: false, // Phone hidden on personal
        locationVisible: true,
        maskSensitiveData: false
    }
  }
];

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', icon: 'Instagram' },
  { id: 'tiktok', label: 'TikTok', icon: 'Music' },
  { id: 'youtube', label: 'YouTube', icon: 'Youtube' },
  { id: 'linkedin', label: 'LinkedIn', icon: 'Linkedin' },
  { id: 'threads', label: 'Threads', icon: 'AtSign' },
  { id: 'commerce', label: 'Sell Product', icon: 'ShoppingBag' }, 
  { id: 'paid_call', label: 'Book Call', icon: 'Phone' },
  { id: 'locked', label: 'Secret Link', icon: 'Lock' }, 
  { id: 'website', label: 'Website', icon: 'Globe' },
  { id: 'email', label: 'Email', icon: 'Mail' },
  { id: 'phone', label: 'Phone', icon: 'Phone' },
];

const PLATFORM_BASE_URLS: Record<string, string> = {
  instagram: 'https://instagram.com/',
  tiktok: 'https://tiktok.com/@',
  youtube: 'https://youtube.com/@',
  linkedin: 'https://linkedin.com/in/',
  threads: 'https://www.threads.net/@',
};

// --- HELPERS & SUB-COMPONENTS ---

const validateAndFormatUrl = (input: string, platformId: string): { isValid: boolean; formattedUrl: string; error?: string } => {
  const trimmed = input.trim();
  if (!trimmed) return { isValid: false, formattedUrl: input, error: 'This field cannot be empty.' };
  
  if (platformId === 'commerce' || platformId === 'locked' || platformId === 'paid_call') {
       if (!/^https?:\/\//i.test(trimmed)) return { isValid: true, formattedUrl: `https://${trimmed}` };
       return { isValid: true, formattedUrl: trimmed };
  }
  if (platformId === 'phone') {
    return { isValid: true, formattedUrl: trimmed.toLowerCase().startsWith('tel:') ? trimmed : `tel:${trimmed}` };
  }
  if (platformId === 'email') {
    return { isValid: true, formattedUrl: trimmed.toLowerCase().startsWith('mailto:') ? trimmed : `mailto:${trimmed}` };
  }
  const baseUrl = PLATFORM_BASE_URLS[platformId];
  if (baseUrl && !trimmed.includes('/')) {
    return { isValid: true, formattedUrl: `${baseUrl}${trimmed.replace(/^@/, '')}` };
  }
  let urlToCheck = trimmed;
  if (!/^https?:\/\//i.test(trimmed)) urlToCheck = `https://${trimmed}`;
  try {
    new URL(urlToCheck);
    return { isValid: true, formattedUrl: urlToCheck };
  } catch (e) {
    return { isValid: false, formattedUrl: input, error: 'Invalid URL.' };
  }
};

const PrivacyMaskedField = ({ value, label, iconName, isMasked, isEditing }: { value: string, label: string, iconName: string, isMasked: boolean, isEditing: boolean }) => {
    const [revealed, setRevealed] = useState(false);
    
    if (!value) return null;

    const displayValue = (isMasked && !revealed && !isEditing) 
        ? value.replace(/.(?=.{4})/g, '*') // Simple mask showing last 4 chars
        : value;

    return (
        <div 
            onClick={() => !isEditing && isMasked && setRevealed(true)}
            className={`flex items-center gap-2 text-sm ${isEditing ? 'text-gray-400' : 'text-gray-600'} ${isMasked && !revealed && !isEditing ? 'cursor-pointer hover:bg-gray-100 rounded px-2 py-1 -ml-2 transition-colors' : 'py-1'}`}
        >
            <GetIcon name={iconName} className="w-4 h-4 shrink-0" />
            <span className={`truncate ${isMasked && !revealed && !isEditing ? 'font-mono tracking-widest text-gray-400' : ''}`}>
                {displayValue}
            </span>
            {isMasked && !revealed && !isEditing && (
                <span className="text-[10px] bg-gray-200 text-gray-500 px-1 rounded">Click to Reveal</span>
            )}
        </div>
    );
};

const PinEntryModal = ({ isOpen, onClose, onSuccess, title }: { isOpen: boolean; onClose: () => void; onSuccess: () => void; title: string }) => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);
    if (!isOpen) return null;
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (pin === '1234') { onSuccess(); setPin(''); setError(false); } else { setError(true); setPin(''); }
    };
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
             <div className="bg-white rounded-2xl w-full max-w-xs p-6 shadow-2xl relative animate-scale-up">
                <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100"><GetIcon name="X" className="w-5 h-5 text-gray-500" /></button>
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-600"><GetIcon name="Lock" className="w-6 h-6" /></div>
                    <h3 className="text-lg font-bold text-gray-900 text-center mb-1">Restricted Access</h3>
                    <p className="text-xs text-gray-500 text-center mb-6 max-w-[200px]">Enter PIN to view <span className="font-semibold text-gray-700">"{title}"</span></p>
                    <form onSubmit={handleSubmit} className="w-full">
                        <input autoFocus type="password" maxLength={4} value={pin} onChange={(e) => { setPin(e.target.value); setError(false); }} className={`w-full text-center text-3xl tracking-[0.5em] font-mono p-3 border-b-2 bg-transparent focus:outline-none transition-colors ${error ? 'border-red-500 text-red-600 placeholder-red-300' : 'border-gray-300 focus:border-blue-500'}`} placeholder="••••" />
                        {error && <p className="text-xs text-red-500 text-center mt-2 font-medium">Incorrect PIN</p>}
                        <button type="submit" className="w-full mt-6 bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition">Unlock Content</button>
                    </form>
                    <p className="text-[10px] text-gray-400 mt-4">Hint: Try 1234</p>
                </div>
             </div>
        </div>
    );
};

const SaveConfirmationModal = ({ isOpen, onClose, onConfirm }: { isOpen: boolean; onClose: () => void; onConfirm: () => void }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
             <div className="bg-white rounded-2xl w-full max-w-xs p-6 shadow-2xl relative animate-scale-up">
                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-900"><GetIcon name="Download" className="w-6 h-6" /></div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Save Contact?</h3>
                    <p className="text-sm text-gray-500 mb-6">This will download a .vcf file to your device contacts.</p>
                    <div className="flex gap-3 w-full">
                        <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
                        <button onClick={onConfirm} className="flex-1 py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-gray-800">Save</button>
                    </div>
                </div>
             </div>
        </div>
    );
};

const AndroidSaveGuideModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-sm p-6 pb-10 sm:pb-6 relative animate-slide-up-mobile">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full"><GetIcon name="X" className="w-5 h-5 text-gray-600" /></button>
                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600"><GetIcon name="Download" className="w-6 h-6" /></div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">File Downloaded</h3>
                    <p className="text-sm text-gray-600 mb-6">Pull down notification shade to open .vcf</p>
                    <button onClick={onClose} className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl">Got it</button>
                </div>
            </div>
        </div>
    );
};

const ProfileDrawer = ({ isOpen, onClose, profiles, activeId, onSwitch, onAdd, onDelete }: any) => {
    return (
        <>
            {isOpen && <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity" onClick={onClose} />}
            <div className={`fixed top-0 bottom-0 left-0 w-80 bg-white z-50 shadow-2xl transition-transform duration-300 ease-in-out transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900"><GetIcon name="Layers" className="w-6 h-6 text-blue-600" />Identity Manager</h2>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><GetIcon name="X" className="w-5 h-5" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 no-scrollbar">
                        {profiles.map((profile: UserProfile) => (
                            <div key={profile.id} className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer group ${activeId === profile.id ? 'border-blue-500 bg-blue-50/50 shadow-sm' : 'border-transparent hover:bg-gray-50'}`} onClick={() => { onSwitch(profile.id); onClose(); }}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full border-2 ${activeId === profile.id ? 'border-blue-500' : 'border-gray-200'} overflow-hidden shrink-0`}>
                                        <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5">
                                            <h3 className={`font-bold truncate ${activeId === profile.id ? 'text-blue-700' : 'text-gray-900'}`}>{profile.name}</h3>
                                            {(profile.type === 'business' || profile.type === 'business_card') && <GetIcon name="Briefcase" className="w-3 h-3 text-blue-500" />}
                                        </div>
                                        <p className="text-xs text-gray-500 truncate">{profile.role}</p>
                                    </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={(e) => { e.stopPropagation(); onAdd(profile.id); }} className="text-xs flex items-center gap-1 text-gray-500 hover:text-blue-600 px-2 py-1 hover:bg-white rounded-md"><GetIcon name="Copy" className="w-3 h-3" /> Clone</button>
                                </div>
                                {activeId === profile.id && <div className="absolute top-4 right-4 text-blue-500"><GetIcon name="Check" className="w-5 h-5" /></div>}
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <button onClick={() => { onAdd(); onClose(); }} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center gap-2 text-gray-500 font-semibold hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all"><GetIcon name="Plus" className="w-5 h-5" />Create New Identity</button>
                    </div>
                </div>
            </div>
        </>
    );
};


export function App() {
  // --- STATE MANAGEMENT ---
  const [profiles, setProfiles] = useState<UserProfile[]>(INITIAL_PROFILES);
  const [activeProfileId, setActiveProfileId] = useState<string>(INITIAL_PROFILES[0].id);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // UI States
  const [showQR, setShowQR] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showAuditLog, setShowAuditLog] = useState(false); // New Audit Log state
  const [isEditing, setIsEditing] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const [bioTone, setBioTone] = useState<'professional' | 'creative' | 'friendly' | 'humorous' | 'inspirational'>('professional');
  const [copiedLink, setCopiedLink] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  
  // Locked Link State
  const [lockedLinkTarget, setLockedLinkTarget] = useState<LinkItem | null>(null);

  // Link Form State
  const [activePlatformId, setActivePlatformId] = useState(PLATFORMS[0].id);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkTitle, setNewLinkTitle] = useState(PLATFORMS[0].label);
  
  // Extra fields for Commerce
  const [newLinkPrice, setNewLinkPrice] = useState('');
  const [newLinkDesc, setNewLinkDesc] = useState('');

  // --- DERIVED STATE ---
  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];
  const activeLinks = activeProfile.links;
  const isUrlValid = newLinkUrl && !linkError && validateAndFormatUrl(newLinkUrl, activePlatformId).isValid;
  const showEditControls = isEditing && !isPreviewMode;

  // --- ACTIONS ---

  const handleUpdateProfile = (updates: Partial<UserProfile>) => {
    setProfiles(profiles.map(p => p.id === activeProfileId ? { ...p, ...updates } : p));
  };

  const handleUpdatePrivacy = (updates: Partial<UserProfile['privacySettings']>) => {
      handleUpdateProfile({
          privacySettings: { ...activeProfile.privacySettings, ...updates }
      });
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(activeLinks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    handleUpdateProfile({ links: items });
  };

  const handleCreateProfile = (cloneId?: string) => {
    const newId = `profile_${Date.now()}`;
    let newProfile: UserProfile;
    if (cloneId) {
        const source = profiles.find(p => p.id === cloneId);
        // Deep copy needed for links
        newProfile = source ? { ...source, id: newId, name: `${source.name} (Copy)`, links: source.links.map(l => ({ ...l, id: Date.now().toString() + Math.random() })) } : { ...INITIAL_PROFILES[0], id: newId };
    } else {
        newProfile = { 
            ...INITIAL_PROFILES[0], 
            id: newId, 
            name: "New Business Card", 
            role: "Founder",
            company: "My Company",
            links: [], 
            type: 'business_card', // Default type
            isVerified: false 
        };
    }
    setProfiles([...profiles, newProfile]);
    setActiveProfileId(newId);
    setIsEditing(true);
  };

  const handleDeleteProfile = (id: string) => {
    if (profiles.length <= 1) return;
    const newProfiles = profiles.filter(p => p.id !== id);
    setProfiles(newProfiles);
    if (activeProfileId === id) setActiveProfileId(newProfiles[0].id);
  };

  const handleLinkClick = (link: LinkItem) => {
    if (showEditControls) return;

    if (link.isLocked) {
        setLockedLinkTarget(link);
        return;
    }
    
    // Register Click with Timestamp
    const updatedProfiles = profiles.map(profile => {
        if (profile.id !== activeProfileId) return profile;
        return {
            ...profile,
            links: profile.links.map(l => l.id === link.id ? { 
                ...l, 
                clicks: (l.clicks || 0) + 1,
                clickTimestamps: [...(l.clickTimestamps || []), Date.now()]
            } : l)
        };
    });
    setProfiles(updatedProfiles);
  };

  const handleUnlockSuccess = () => {
      if (lockedLinkTarget) {
          window.open(lockedLinkTarget.url, '_blank');
          
           // Register Click for locked link
            const updatedProfiles = profiles.map(profile => {
                if (profile.id !== activeProfileId) return profile;
                return {
                    ...profile,
                    links: profile.links.map(l => l.id === lockedLinkTarget.id ? { 
                        ...l, 
                        clicks: (l.clicks || 0) + 1,
                        clickTimestamps: [...(l.clickTimestamps || []), Date.now()]
                    } : l)
                };
            });
            setProfiles(updatedProfiles);
          setLockedLinkTarget(null);
      }
  };

  const handleAddLink = () => {
    const validation = validateAndFormatUrl(newLinkUrl, activePlatformId);
    if (!validation.isValid) { setLinkError(validation.error || 'Invalid input'); return; }
    
    const platform = PLATFORMS.find(p => p.id === activePlatformId) || PLATFORMS[0];
    let type: LinkItem['type'] = 'social';
    
    // Map 'paid_call' to 'commerce' type but keep the Phone icon from platform definition
    if (activePlatformId === 'paid_call') {
        type = 'commerce';
    } else if (['phone', 'email', 'commerce', 'locked'].includes(platform.id)) {
        type = platform.id as LinkItem['type'];
    } else if (platform.id === 'website') type = 'website';

    const newLink: LinkItem = {
      id: Date.now().toString(),
      title: newLinkTitle || platform.label,
      url: validation.formattedUrl,
      type: type,
      iconName: platform.icon,
      clicks: 0,
      clickTimestamps: [],
      price: (activePlatformId === 'commerce' || activePlatformId === 'paid_call') ? newLinkPrice : undefined,
      currency: (activePlatformId === 'commerce' || activePlatformId === 'paid_call') ? '$' : undefined,
      description: (activePlatformId === 'commerce' || activePlatformId === 'locked' || activePlatformId === 'paid_call') ? newLinkDesc : undefined,
      isLocked: activePlatformId === 'locked'
    };

    handleUpdateProfile({ links: [...activeLinks, newLink] });
    
    // Reset
    setNewLinkUrl(''); setNewLinkTitle(platform.label); setNewLinkPrice(''); setNewLinkDesc(''); setLinkError(null);
  };

  // ... (Other handlers like handleShare, handleSaveContact same as before)
  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: `${activeProfile.name}`, url: window.location.href }); } catch (err) { console.log('Error sharing', err); }
    } else {
       navigator.clipboard.writeText(window.location.href).then(() => { setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000); });
    }
  };

   const executeSaveContact = () => {
    setShowSaveConfirmation(false);
    const vCardData = generateVCardData(activeProfile, window.location.href);
    const blob = new Blob([vCardData], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${activeProfile.name.replace(/\s+/g, "_")}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (/android/i.test(navigator.userAgent)) setShowAndroidGuide(true);
  };

   const handleSaveContact = () => {
       setShowSaveConfirmation(true);
   };

   const handleAIBioGen = async () => {
    if (!activeProfile.bio) return;
    setIsGeneratingBio(true);
    const newBio = await generateProfessionalBio(activeProfile.bio, activeProfile.role, bioTone);
    handleUpdateProfile({ bio: newBio });
    setIsGeneratingBio(false);
  };

  const isCustomTheme = activeProfile.themeColor.startsWith('#');
  const headerStyle = isCustomTheme ? { backgroundColor: activeProfile.themeColor } : {};
  const headerClass = `h-44 relative shrink-0 transition-colors duration-500 ease-in-out ${!isCustomTheme ? `bg-gradient-to-r ${activeProfile.themeColor}` : ''}`;

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center pb-safe">
      <div className="w-full max-w-md bg-white shadow-xl min-h-screen relative overflow-hidden flex flex-col pb-24 transition-colors duration-300">
        
        {/* HEADER */}
        <div className={headerClass} style={headerStyle}>
          {/* Security Context Badge (Enterprise/Personal) */}
          <div className="absolute top-0 left-0 right-0 h-8 bg-black/10 backdrop-blur-sm flex items-center justify-center gap-1.5 z-30">
             {(activeProfile.type === 'business' || activeProfile.type === 'business_card') ? (
                 <span className="flex items-center gap-1 text-[10px] font-bold text-white uppercase tracking-widest">
                     <GetIcon name="ShieldCheck" className="w-3 h-3 text-blue-300" /> {activeProfile.type === 'business' ? 'Enterprise Managed' : 'Digital Business Card'}
                 </span>
             ) : (
                 <span className="flex items-center gap-1 text-[10px] font-bold text-white uppercase tracking-widest opacity-80">
                     <GetIcon name="User" className="w-3 h-3" /> Personal Space
                 </span>
             )}
          </div>

          <div className="absolute top-10 left-4 z-20">
             <button onClick={() => setIsDrawerOpen(true)} className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition text-white shadow-sm ring-1 ring-white/20">
                <GetIcon name="Layers" className="w-5 h-5" />
             </button>
          </div>
          <div className="absolute top-10 right-4 flex gap-2 z-20">
            {isEditing && !isPreviewMode && (
                <>
                <button onClick={() => setShowAuditLog(true)} className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition text-white" title="Security Logs"><GetIcon name="Activity" className="w-5 h-5" /></button>
                <button onClick={() => setShowAnalytics(true)} className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition text-white"><GetIcon name="BarChart2" className="w-5 h-5" /></button>
                </>
            )}
            {isEditing && !isPreviewMode && (
              <button onClick={() => setIsPreviewMode(true)} className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition text-white"><GetIcon name="Eye" className="w-5 h-5" /></button>
            )}
            {!isPreviewMode && (
              <button onClick={() => setIsEditing(!isEditing)} className={`p-2 backdrop-blur-md rounded-full transition text-white ${isEditing ? 'bg-white text-gray-900' : 'bg-white/20 hover:bg-white/30'}`}><GetIcon name={isEditing ? "X" : "Edit2"} className="w-5 h-5" /></button>
            )}
            {(!isEditing || isPreviewMode) && (
              <>
                <button onClick={handleSaveContact} className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition text-white"><GetIcon name="Download" className="w-5 h-5" /></button>
                <button onClick={() => setShowQR(true)} className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition text-white"><GetIcon name="QrCode" className="w-5 h-5" /></button>
                <button onClick={handleShare} className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition text-white"><GetIcon name="Share2" className="w-5 h-5" /></button>
              </>
            )}
          </div>
        </div>

        {/* PROFILE CONTENT */}
        <main key={activeProfileId} className="flex flex-col flex-grow w-full animate-enter">
            <div className="px-6 -mt-16 flex flex-col items-center relative z-10 shrink-0">
                <div className="relative group">
                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-200 relative">
                        <img src={activeProfile.avatarUrl} alt={activeProfile.name} className="w-full h-full object-cover transition-opacity duration-300" />
                        {showEditControls && <button onClick={() => setShowAvatarModal(true)} className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"><GetIcon name="Camera" className="w-8 h-8" /></button>}
                    </div>
                    {/* Verified Badge */}
                    {activeProfile.isVerified && !isEditing && (
                        <div className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full border-2 border-white shadow-sm" title="Enterprise Verified">
                            <GetIcon name="ShieldCheck" className="w-4 h-4" />
                        </div>
                    )}
                </div>

                <div className="mt-4 text-center w-full">
                    {showEditControls ? (
                        <div className="w-full space-y-3 mb-4 animate-fade-in">
                           <input type="text" value={activeProfile.name} onChange={(e) => handleUpdateProfile({ name: e.target.value })} className="w-full text-center text-xl font-bold border-b border-gray-200 pb-1 focus:border-blue-500 focus:outline-none bg-transparent" placeholder="Name" />
                           <input type="text" value={activeProfile.role} onChange={(e) => handleUpdateProfile({ role: e.target.value })} className="w-full text-center text-sm text-gray-500 border-b border-gray-200 pb-1 focus:border-blue-500 focus:outline-none bg-transparent" placeholder="Role" />
                           {(activeProfile.type === 'business_card' || activeProfile.type === 'business') && (
                               <>
                                   <input type="text" value={activeProfile.company} onChange={(e) => handleUpdateProfile({ company: e.target.value })} className="w-full text-center text-sm text-gray-500 border-b border-gray-200 pb-1 focus:border-blue-500 focus:outline-none bg-transparent" placeholder="Company Display Name" />
                                   <input type="text" value={activeProfile.organizationName || ''} onChange={(e) => handleUpdateProfile({ organizationName: e.target.value })} className="w-full text-center text-xs text-gray-400 border-b border-gray-200 pb-1 focus:border-blue-500 focus:outline-none bg-transparent" placeholder="Legal Organization Name" />
                               </>
                           )}
                        </div>
                    ) : (
                        <>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
                                {activeProfile.name}
                            </h1>
                            <p className="text-sm font-medium text-gray-500 mt-1">{activeProfile.role} @ {activeProfile.company}</p>
                            
                            {/* Masked Contact Info with Privacy Controls */}
                            <div className="flex flex-col items-center gap-1 mt-3 mb-2">
                                {activeProfile.privacySettings.emailVisible && (
                                    <PrivacyMaskedField 
                                        value={activeProfile.email} 
                                        label="Email" 
                                        iconName="Mail" 
                                        isMasked={activeProfile.privacySettings.maskSensitiveData}
                                        isEditing={false} 
                                    />
                                )}
                                {activeProfile.privacySettings.phoneVisible && (
                                    <PrivacyMaskedField 
                                        value={activeProfile.phone} 
                                        label="Phone" 
                                        iconName="Phone" 
                                        isMasked={activeProfile.privacySettings.maskSensitiveData}
                                        isEditing={false} 
                                    />
                                )}
                            </div>
                            
                            <p className="mt-2 text-gray-600 text-sm leading-relaxed max-w-xs mx-auto">{activeProfile.bio}</p>
                        </>
                    )}
                    
                    {showEditControls && (
                        <div className="mt-4 w-full bg-blue-50 p-4 rounded-xl border border-blue-100 text-left animate-fade-in space-y-3">
                            <label className="text-xs font-bold text-blue-600 uppercase block">Bio</label>
                            <textarea className="w-full bg-white border rounded-lg p-3 text-sm mb-2" rows={3} value={activeProfile.bio} onChange={(e) => handleUpdateProfile({ bio: e.target.value })} />
                            <div className="flex gap-2">
                                <button onClick={handleAIBioGen} disabled={isGeneratingBio} className="flex-1 bg-blue-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2">
                                    {isGeneratingBio ? "Thinking..." : <><GetIcon name="Sparkles" className="w-3 h-3" /> AI Polish</>}
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {/* Privacy Controls (Edit Mode) */}
                    {showEditControls && (
                        <div className="mt-4 w-full bg-gray-50 p-4 rounded-xl border border-gray-200 text-left animate-fade-in">
                            <h4 className="text-xs font-bold text-gray-600 uppercase mb-3 flex items-center gap-2">
                                <GetIcon name="Lock" className="w-3 h-3" /> Privacy Settings
                            </h4>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-700">Show Email</span>
                                    <button onClick={() => handleUpdatePrivacy({ emailVisible: !activeProfile.privacySettings.emailVisible })} className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${activeProfile.privacySettings.emailVisible ? 'bg-green-500 justify-end' : 'bg-gray-300 justify-start'}`}>
                                        <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-700">Show Phone</span>
                                    <button onClick={() => handleUpdatePrivacy({ phoneVisible: !activeProfile.privacySettings.phoneVisible })} className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${activeProfile.privacySettings.phoneVisible ? 'bg-green-500 justify-end' : 'bg-gray-300 justify-start'}`}>
                                        <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between border-t border-gray-200 pt-3 mt-2">
                                    <div className="flex flex-col">
                                        <span className="text-sm text-gray-700 font-medium">Data Masking</span>
                                        <span className="text-[10px] text-gray-500">Hide details until clicked (Anti-scraping)</span>
                                    </div>
                                    <button onClick={() => handleUpdatePrivacy({ maskSensitiveData: !activeProfile.privacySettings.maskSensitiveData })} className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${activeProfile.privacySettings.maskSensitiveData ? 'bg-blue-500 justify-end' : 'bg-gray-300 justify-start'}`}>
                                        <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Verified Badge Toggle for Business Card */}
                    {showEditControls && (activeProfile.type === 'business_card' || activeProfile.type === 'business') && (
                        <div className="mt-4 w-full bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-left animate-fade-in flex items-center justify-between">
                             <div className="flex items-center gap-2">
                                <GetIcon name="ShieldCheck" className="w-5 h-5 text-blue-600" />
                                <span className="text-sm font-bold text-gray-700">Verified Badge</span>
                             </div>
                             <button onClick={() => handleUpdateProfile({ isVerified: !activeProfile.isVerified })} className={`w-12 h-7 rounded-full transition-colors flex items-center px-1 ${activeProfile.isVerified ? 'bg-blue-600 justify-end' : 'bg-gray-300 justify-start'}`}>
                                <div className="w-5 h-5 rounded-full bg-white shadow-md" />
                             </button>
                        </div>
                    )}

                    {showEditControls && <button onClick={() => setIsEditing(false)} className="w-full mt-4 bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition flex items-center justify-center gap-2"><GetIcon name="Check" className="w-4 h-4" /> Finish Editing</button>}
                </div>
            </div>

            {/* LINKS LIST */}
            <div className="px-6 py-8 flex flex-col flex-grow">
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="links-list">
                  {(provided) => (
                    <div 
                        {...provided.droppableProps} 
                        ref={provided.innerRef}
                    >
                        {activeLinks.map((link, index) => (
                            <Draggable key={link.id} draggableId={link.id} index={index} isDragDisabled={!showEditControls}>
                                {(provided, snapshot) => (
                                    <div 
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        style={{ 
                                            ...provided.draggableProps.style, 
                                            marginBottom: '1rem',
                                            transform: snapshot.isDragging ? provided.draggableProps.style?.transform : 'translate(0px, 0px)',
                                        }}
                                        className={`relative group transition-all duration-200 ${snapshot.isDragging ? 'z-50 scale-[1.02] shadow-2xl ring-2 ring-blue-500/50 bg-white rounded-2xl rotate-1 opacity-95' : 'animate-fade-in'}`}
                                    >
                                        {/* Drag Handle */}
                                        {showEditControls && (
                                            <div 
                                                {...provided.dragHandleProps} 
                                                className={`absolute -top-3 -left-3 z-20 p-2.5 rounded-full shadow-lg border transition-all duration-200 cursor-grab active:cursor-grabbing flex items-center justify-center ${snapshot.isDragging ? 'bg-blue-600 text-white border-blue-600 scale-110' : 'bg-white text-gray-400 hover:text-blue-500 border-gray-200 hover:border-blue-200'}`}
                                            >
                                                <GetIcon name="GripVertical" className="w-4 h-4" />
                                            </div>
                                        )}

                                        {/* Content Logic */}
                                        {(() => {
                                            if (link.type === 'commerce') {
                                                return (
                                                    <div className="relative">
                                                        <a 
                                                            href={showEditControls ? undefined : link.url} 
                                                            target={showEditControls ? undefined : "_blank"} 
                                                            rel="noreferrer" 
                                                            onClick={() => handleLinkClick(link)}
                                                            className={`block bg-white border border-blue-100 p-5 rounded-2xl shadow-lg shadow-blue-50 hover:shadow-xl hover:border-blue-200 transition-all duration-200 relative overflow-hidden ${showEditControls ? 'opacity-90' : 'cursor-pointer'}`}
                                                        >
                                                            <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-bl-xl z-10">
                                                                {link.currency}{link.price}
                                                            </div>
                                                            <div className="flex items-start gap-4">
                                                                <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                                                                    <GetIcon name={link.iconName} className="w-6 h-6" />
                                                                </div>
                                                                <div className="flex-1 pr-12">
                                                                    <h3 className="font-bold text-gray-900 leading-tight mb-1">{link.title}</h3>
                                                                    <p className="text-xs text-gray-500 leading-relaxed">{link.description}</p>
                                                                </div>
                                                            </div>
                                                            <div className="mt-4 pt-3 border-t border-blue-50 flex items-center justify-between text-blue-600 text-xs font-bold uppercase tracking-wide">
                                                                <span>Instant Book</span>
                                                                <GetIcon name="ChevronUp" className="w-4 h-4 rotate-90" />
                                                            </div>
                                                        </a>
                                                    </div>
                                                );
                                            }
                                            if (link.type === 'locked') {
                                                return (
                                                    <div className="relative">
                                                        <button 
                                                            onClick={() => handleLinkClick(link)}
                                                            className={`w-full bg-gray-900 border border-gray-800 p-4 rounded-2xl flex items-center justify-between shadow-md text-white hover:bg-gray-800 transition-all duration-200 ${showEditControls ? 'opacity-90' : 'cursor-pointer'}`}
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className="p-2.5 rounded-xl bg-gray-800 text-yellow-400">
                                                                    <GetIcon name="Lock" className="w-5 h-5" />
                                                                </div>
                                                                <div className="text-left">
                                                                    <span className="font-semibold block">{link.title}</span>
                                                                    {link.description && <span className="text-xs text-gray-400">{link.description}</span>}
                                                                </div>
                                                            </div>
                                                            <div className="text-gray-500">
                                                                <GetIcon name="Key" className="w-4 h-4" />
                                                            </div>
                                                        </button>
                                                    </div>
                                                );
                                            }
                                            return (
                                                <div className="relative">
                                                    <a 
                                                        href={showEditControls ? undefined : link.url} 
                                                        target={showEditControls ? undefined : "_blank"} 
                                                        rel="noreferrer" 
                                                        onClick={() => handleLinkClick(link)}
                                                        className={`bg-white border p-4 rounded-2xl flex items-center justify-between shadow-sm transition-all duration-200 ${showEditControls ? 'border-gray-200 opacity-90' : 'border-gray-200 hover:shadow-md hover:border-blue-200 hover:-translate-y-0.5 cursor-pointer'}`}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className={`p-2.5 rounded-xl ${link.type === 'social' ? 'bg-gray-50 text-gray-600' : 'bg-blue-50 text-blue-600'}`}>
                                                                <GetIcon name={link.iconName} className="w-5 h-5" />
                                                            </div>
                                                            <span className="font-semibold text-gray-800">{link.title}</span>
                                                        </div>
                                                        {!showEditControls && <div className="text-gray-300 group-hover:translate-x-1 group-hover:text-blue-400 transition-all"><GetIcon name="Send" className="w-4 h-4 rotate-[-45deg]" /></div>}
                                                    </a>
                                                </div>
                                            );
                                        })()}

                                        {showEditControls && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleUpdateProfile({ links: activeLinks.filter(l => l.id !== link.id) }); }}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md z-20 hover:bg-red-600 transition-colors"
                                            >
                                                <GetIcon name="Trash2" className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

                {showEditControls && (
                    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-4 animate-fade-in mt-2">
                        <h3 className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-wide flex items-center gap-2"><GetIcon name="Plus" className="w-4 h-4" /> Add Block</h3>
                        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar mb-2">
                            {PLATFORMS.map(p => (
                                <button key={p.id} onClick={() => { setActivePlatformId(p.id); setNewLinkTitle(p.label); setNewLinkUrl(''); }} className={`flex flex-col items-center gap-2 min-w-[70px] p-3 rounded-xl border transition-all ${activePlatformId === p.id ? 'border-blue-500 bg-blue-50 text-blue-600 ring-2 ring-blue-100' : 'border-gray-200 bg-white text-gray-400 hover:bg-gray-50'}`}>
                                    <GetIcon name={p.icon} className="w-6 h-6" />
                                    <span className="text-[10px] font-semibold text-center leading-tight">{p.label}</span>
                                </button>
                            ))}
                        </div>
                        <div className="space-y-3">
                            <input type="text" placeholder="Title" value={newLinkTitle} onChange={e => setNewLinkTitle(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" />
                            <input type={(activePlatformId === 'phone') ? 'tel' : 'url'} placeholder="URL" value={newLinkUrl} onChange={e => setNewLinkUrl(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" />
                            
                            {(activePlatformId === 'commerce' || activePlatformId === 'locked' || activePlatformId === 'paid_call') && (
                                <div className="animate-fade-in space-y-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                                    {(activePlatformId === 'commerce' || activePlatformId === 'paid_call') && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-500 font-bold">$</span>
                                            <input type="number" placeholder="Price" value={newLinkPrice} onChange={e => setNewLinkPrice(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-400" />
                                        </div>
                                    )}
                                    <textarea placeholder="Description (Optional)" value={newLinkDesc} onChange={e => setNewLinkDesc(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-400" rows={2} />
                                </div>
                            )}

                            <button onClick={handleAddLink} disabled={!newLinkUrl} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"><GetIcon name="Plus" className="w-4 h-4" /> Add to Profile</button>
                        </div>
                    </div>
                )}
                <div className="h-20"></div>
            </div>
            
            <div className="w-full text-center pb-8 shrink-0 bg-white">
                <div className="flex items-center justify-center gap-2 text-gray-300 text-xs font-medium">
                    <div className="w-2 h-2 rounded-full bg-gray-300"></div><span>TabNode</span>
                </div>
            </div>
        </main>

        {/* BOTTOM NAV */}
        {!showEditControls && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-gray-100 flex gap-3 z-40 pb-safe">
                <button onClick={handleSaveContact} className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white py-4 rounded-2xl font-bold text-base shadow-lg shadow-gray-200 hover:scale-[1.02] active:scale-95 transition-all"><GetIcon name="Download" className="w-5 h-5" /> Save Contact</button>
                <button onClick={() => { navigator.clipboard.writeText(window.location.href).then(() => { setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000); }) }} className={`flex items-center justify-center w-14 rounded-2xl border font-bold text-sm transition-all hover:bg-gray-50 active:scale-95 ${copiedLink ? 'border-green-500 text-green-600 bg-green-50' : 'border-gray-200 text-gray-700 bg-white'}`}>{copiedLink ? <GetIcon name="Check" className="w-6 h-6" /> : <GetIcon name="Copy" className="w-6 h-6" />}</button>
            </div>
        )}

        {/* MODALS */}
        <PinEntryModal isOpen={!!lockedLinkTarget} onClose={() => setLockedLinkTarget(null)} onSuccess={handleUnlockSuccess} title={lockedLinkTarget?.title || ''} />
        <ProfileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} profiles={profiles} activeId={activeProfileId} onSwitch={(id:string) => { setActiveProfileId(id); setIsEditing(false); }} onAdd={handleCreateProfile} onDelete={handleDeleteProfile} />
        <QRCodeModal isOpen={showQR} onClose={() => setShowQR(false)} url={window.location.href} avatarUrl={activeProfile.avatarUrl} username={activeProfile.name.replace(/\s+/g, '').toLowerCase()} />
        <AvatarSelectionModal isOpen={showAvatarModal} onClose={() => setShowAvatarModal(false)} onSelect={(url) => { handleUpdateProfile({ avatarUrl: url }); setShowAvatarModal(false); }} />
        <AnalyticsModal isOpen={showAnalytics} onClose={() => setShowAnalytics(false)} links={activeLinks} />
        <AuditLogModal isOpen={showAuditLog} onClose={() => setShowAuditLog(false)} />
        <AndroidSaveGuideModal isOpen={showAndroidGuide} onClose={() => setShowAndroidGuide(false)} />
        <SaveConfirmationModal isOpen={showSaveConfirmation} onClose={() => setShowSaveConfirmation(false)} onConfirm={executeSaveContact} />

      </div>
    </div>
  );
}