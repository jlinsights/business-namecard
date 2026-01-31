import React, { useState } from 'react';
import { UserProfile, LinkItem } from './types';
import { GetIcon } from './components/Icons';
import QRCodeModal from './components/QRCodeModal';
import { generateProfessionalBio, generateVCardData } from './services/geminiService';

// Initial Mock Data
const INITIAL_PROFILE: UserProfile = {
  name: "Alex Sterling",
  role: "Senior Product Designer",
  company: "Slice Creative",
  bio: "Crafting digital experiences that humanize technology. Passionate about minimalist design and accessibility.",
  avatarUrl: "https://picsum.photos/200/200",
  email: "alex@myslice.is",
  phone: "+1 (555) 012-3456",
  location: "San Francisco, CA",
  websiteUrl: "https://myslice.is",
  themeColor: "from-indigo-500 to-purple-600"
};

const INITIAL_LINKS: LinkItem[] = [
  { id: '1', title: 'My Portfolio', url: 'https://myslice.is', type: 'website', iconName: 'Globe' },
  { id: '7', title: 'Latest Video', url: 'https://youtube.com', type: 'social', iconName: 'Youtube' },
  { id: '6', title: 'GitHub', url: 'https://github.com', type: 'social', iconName: 'Github' },
  { id: '2', title: 'Instagram', url: 'https://instagram.com', type: 'social', iconName: 'Instagram' },
  { id: '3', title: 'LinkedIn', url: 'https://linkedin.com', type: 'social', iconName: 'Linkedin' },
  { id: '4', title: 'Twitter / X', url: 'https://twitter.com', type: 'social', iconName: 'Twitter' },
  { id: '5', title: 'Book a Call', url: 'https://calendly.com', type: 'contact', iconName: 'Phone' },
];

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', icon: 'Instagram' },
  { id: 'youtube', label: 'YouTube', icon: 'Youtube' },
  { id: 'linkedin', label: 'LinkedIn', icon: 'Linkedin' },
  { id: 'twitter', label: 'Twitter', icon: 'Twitter' },
  { id: 'github', label: 'GitHub', icon: 'Github' },
  { id: 'website', label: 'Website', icon: 'Globe' },
  { id: 'custom', label: 'Custom Link', icon: 'Link' },
  { id: 'email', label: 'Email', icon: 'Mail' },
  { id: 'phone', label: 'Phone', icon: 'Phone' },
];

const THEME_PRESETS = [
  { id: 'indigo', value: 'from-indigo-500 to-purple-600', preview: 'bg-gradient-to-r from-indigo-500 to-purple-600' },
  { id: 'pink', value: 'from-pink-500 to-rose-500', preview: 'bg-gradient-to-r from-pink-500 to-rose-500' },
  { id: 'emerald', value: 'from-emerald-400 to-cyan-500', preview: 'bg-gradient-to-r from-emerald-400 to-cyan-500' },
  { id: 'amber', value: 'from-orange-400 to-amber-400', preview: 'bg-gradient-to-r from-orange-400 to-amber-400' },
  { id: 'slate', value: 'from-slate-700 to-slate-900', preview: 'bg-gradient-to-r from-slate-700 to-slate-900' },
  { id: 'blue', value: 'from-blue-400 to-blue-600', preview: 'bg-gradient-to-r from-blue-400 to-blue-600' },
];

function App() {
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [links, setLinks] = useState<LinkItem[]>(INITIAL_LINKS);
  const [showQR, setShowQR] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Edit State for Profile
  const [editProfile, setEditProfile] = useState<UserProfile>(INITIAL_PROFILE);

  // Add Link State
  const [activePlatformId, setActivePlatformId] = useState(PLATFORMS[0].id);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkTitle, setNewLinkTitle] = useState(PLATFORMS[0].label);

  // Derived state for rendering
  const activeProfile = isPreviewMode ? editProfile : profile;
  const showEditControls = isEditing && !isPreviewMode;

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
    const blob = new Blob([vCardData], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${activeProfile.name.replace(" ", "_")}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAIBioGen = async () => {
    if (!editProfile.bio) return;
    setIsGeneratingBio(true);
    const newBio = await generateProfessionalBio(editProfile.bio, editProfile.role, 'professional');
    setEditProfile(prev => ({ ...prev, bio: newBio }));
    setIsGeneratingBio(false);
  };

  const saveProfileChanges = () => {
    setProfile(editProfile);
    setIsEditing(false);
    setIsPreviewMode(false);
  };

  const handleAddLink = () => {
    if (!newLinkUrl) return;

    const platform = PLATFORMS.find(p => p.id === activePlatformId) || PLATFORMS[0];
    const newLink: LinkItem = {
      id: Date.now().toString(),
      title: newLinkTitle || platform.label,
      url: newLinkUrl,
      type: 'social',
      iconName: platform.icon
    };

    setLinks([...links, newLink]);
    setNewLinkUrl('');
    setNewLinkTitle(platform.label);
  };

  const handleDeleteLink = (id: string) => {
    setLinks(links.filter(l => l.id !== id));
  };

  // Sync edit state when entering edit mode
  React.useEffect(() => {
    if (isEditing) {
      setEditProfile(profile);
    }
  }, [isEditing, profile]);

  // Determine header style (Gradient class vs Custom Hex)
  const isCustomTheme = activeProfile.themeColor.startsWith('#');
  const headerStyle = isCustomTheme ? { backgroundColor: activeProfile.themeColor } : {};
  const headerClass = `h-40 relative shrink-0 ${!isCustomTheme ? `bg-gradient-to-r ${activeProfile.themeColor}` : ''}`;

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-md bg-white shadow-xl min-h-screen relative overflow-hidden flex flex-col">
        
        {/* === Header / Cover Area === */}
        <div className={headerClass} style={headerStyle}>
          <div className="absolute top-4 right-4 flex gap-2">
            
            {/* Preview Toggle (Only in Edit Mode) */}
            {isEditing && !isPreviewMode && (
              <button 
                onClick={() => setIsPreviewMode(true)}
                className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition text-white"
                title="Preview Mode"
              >
                <GetIcon name="Eye" className="w-5 h-5" />
              </button>
            )}

            {/* Edit / Close Toggle (Hidden in Preview Mode) */}
            {!isPreviewMode && (
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className={`p-2 backdrop-blur-md rounded-full transition text-white ${isEditing ? 'bg-white text-gray-900' : 'bg-white/20 hover:bg-white/30'}`}
              >
                <GetIcon name={isEditing ? "X" : "Edit2"} className="w-5 h-5" />
              </button>
            )}

            {/* Public Tools (Visible when NOT editing OR in Preview Mode) */}
            {(!isEditing || isPreviewMode) && (
              <>
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
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-200">
              <img src={activeProfile.avatarUrl} alt={activeProfile.name} className="w-full h-full object-cover" />
            </div>
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

            {/* Bio Section with AI Edit Mode */}
            {showEditControls ? (
              <div className="mt-4 w-full bg-blue-50 p-4 rounded-xl border border-blue-100 text-left animate-fade-in">
                 <label className="text-xs font-bold text-blue-600 uppercase mb-2 block tracking-wide">Bio</label>
                 <textarea 
                    className="w-full bg-white border border-blue-200 rounded-lg p-3 text-sm text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none"
                    rows={3}
                    value={editProfile.bio}
                    onChange={(e) => setEditProfile({...editProfile, bio: e.target.value})}
                 />
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

            {/* === Theme Customization (Edit Mode) === */}
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
            
            {/* Save Button */}
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

          {/* === Main Actions === */}
          {!showEditControls && (
            <div className="grid grid-cols-2 gap-3 w-full mt-8">
                <button 
                    onClick={handleSaveContact}
                    className="flex items-center justify-center gap-2 bg-gray-900 text-white py-3.5 rounded-xl font-semibold text-sm shadow-lg shadow-gray-200 hover:scale-[1.02] active:scale-95 transition-all"
                >
                    <GetIcon name="Download" className="w-4 h-4" />
                    Save Contact
                </button>
                <button 
                    onClick={handleCopyLink}
                    className={`flex items-center justify-center gap-2 border py-3.5 rounded-xl font-semibold text-sm transition-all hover:bg-gray-50 active:scale-95 ${copiedLink ? 'border-green-500 text-green-600 bg-green-50' : 'border-gray-200 text-gray-700 bg-white'}`}
                >
                    {copiedLink ? <GetIcon name="Check" className="w-4 h-4" /> : <GetIcon name="Copy" className="w-4 h-4" />}
                    {copiedLink ? 'Copied!' : 'Copy Link'}
                </button>
            </div>
          )}
        </div>

        {/* === Links List === */}
        <div className="px-6 py-8 flex flex-col gap-4 pb-20 flex-grow">
            {links.map((link) => (
                <div key={link.id} className="relative group">
                    <a 
                        href={showEditControls ? undefined : link.url}
                        target={showEditControls ? undefined : "_blank"}
                        rel="noreferrer"
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
                    
                    {/* Delete Button in Edit Mode */}
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

            {/* === Add Link Form (Edit Mode) === */}
            {showEditControls && (
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-4 animate-fade-in mt-2">
                    <h3 className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-wide flex items-center gap-2">
                        <GetIcon name="Plus" className="w-4 h-4" />
                        Add New Link
                    </h3>
                    
                    {/* Platform Selector */}
                    <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar mb-2">
                        {PLATFORMS.map(p => (
                            <button 
                                key={p.id}
                                onClick={() => {
                                    setActivePlatformId(p.id);
                                    setNewLinkTitle(p.label);
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
                            <input 
                                type="url" 
                                placeholder="https://..."
                                value={newLinkUrl}
                                onChange={e => setNewLinkUrl(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                            />
                        </div>
                        <button 
                            onClick={handleAddLink} 
                            disabled={!newLinkUrl}
                            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <GetIcon name="Plus" className="w-4 h-4" />
                            Add Link
                        </button>
                    </div>
                </div>
            )}
        </div>

        {/* === Preview Mode Exit Button === */}
        {isPreviewMode && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-bounce-in">
                <button 
                    onClick={() => setIsPreviewMode(false)}
                    className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-xl hover:scale-105 transition font-medium ring-2 ring-white"
                >
                    <GetIcon name="EyeOff" className="w-4 h-4" />
                    Exit Preview
                </button>
            </div>
        )}

        {/* === Footer === */}
        <div className="w-full text-center py-6 shrink-0 bg-gray-50">
             <div className="flex items-center justify-center gap-2 text-gray-300 text-xs font-medium">
                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                <span>SliceLink</span>
             </div>
        </div>

        {/* === Modals === */}
        <QRCodeModal 
            isOpen={showQR} 
            onClose={() => setShowQR(false)} 
            url={window.location.href}
            avatarUrl={activeProfile.avatarUrl}
            username={activeProfile.name.replace(/\s+/g, '').toLowerCase()}
        />

      </div>
    </div>
  );
}

export default App;