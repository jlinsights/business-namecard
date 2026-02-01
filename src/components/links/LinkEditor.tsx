import React from 'react';
import { GetIcon } from '../Icons';
import { PLATFORMS } from '../../constants/data';

interface LinkEditorProps {
  activePlatformId: string;
  setActivePlatformId: (id: string) => void; // Using simplified version via hook's raw setter or proxy
  selectPlatform: (id: string) => void;
  newLinkTitle: string;
  setNewLinkTitle: (title: string) => void;
  newLinkUrl: string;
  setNewLinkUrl: (url: string) => void;
  linkError: string | null;
  setLinkError: (error: string | null) => void;
  handleAddLink: () => void;
  validateCurrentUrl: () => void;
}

export const LinkEditor: React.FC<LinkEditorProps> = ({
  activePlatformId,
  // setActivePlatformId, // selectPlatform wraps this logic
  selectPlatform,
  newLinkTitle,
  setNewLinkTitle,
  newLinkUrl,
  setNewLinkUrl,
  linkError,
  setLinkError,
  handleAddLink,
  validateCurrentUrl
}) => {

  const getPlaceholder = (platformId: string) => {
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

  const isUrlValid = newLinkUrl && !linkError; // Simplified visual check, actual check handled by parent mainly

  return (
    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-4 animate-fade-in mt-2">
        <h3 className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-wide flex items-center gap-2">
            <GetIcon name="Plus" className="w-4 h-4" />
            Add New Link
        </h3>
        
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar mb-2">
            {PLATFORMS.map(p => (
                <button 
                    key={p.id}
                    onClick={() => selectPlatform(p.id)}
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
                        onBlur={validateCurrentUrl}
                        className={`w-full bg-white border rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:outline-none transition-colors pr-10 ${linkError ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-400'}`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                        {linkError ? (
                            <GetIcon name="AlertCircle" className="w-5 h-5 text-red-500" />
                        ) : (
                            newLinkUrl && <GetIcon name="Check" className="w-5 h-5 text-green-500" />
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
  );
};
