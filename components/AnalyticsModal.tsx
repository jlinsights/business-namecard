import React from 'react';
import { GetIcon } from './Icons';
import { LinkItem } from '../types';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  links: LinkItem[];
}

const AnalyticsModal: React.FC<AnalyticsModalProps> = ({ isOpen, onClose, links }) => {
  if (!isOpen) return null;

  // Calculate stats
  const totalClicks = links.reduce((sum, link) => sum + (link.clicks || 0), 0);
  const sortedLinks = [...links].sort((a, b) => (b.clicks || 0) - (a.clicks || 0));
  const maxClicks = sortedLinks[0]?.clicks || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative animate-scale-up flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center shrink-0">
            <div>
                <h3 className="font-bold text-gray-900 text-lg">Analytics</h3>
                <p className="text-xs text-gray-500">Link performance & engagement</p>
            </div>
            <button 
                onClick={onClose}
                className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors"
            >
                <GetIcon name="X" className="w-5 h-5 text-gray-600" />
            </button>
        </div>

        {/* Overview Card */}
        <div className="p-5 pb-2 shrink-0">
             <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 text-white shadow-lg">
                <div className="flex items-center gap-2 text-gray-300 mb-1">
                    <GetIcon name="BarChart2" className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Total Clicks</span>
                </div>
                <div className="text-4xl font-bold tracking-tight">{totalClicks}</div>
             </div>
        </div>

        {/* Links List */}
        <div className="flex-1 overflow-y-auto p-5 pt-2 no-scrollbar">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Top Performing Links</h4>
            
            <div className="space-y-4">
                {sortedLinks.map((link) => {
                    const percentage = maxClicks > 0 ? ((link.clicks || 0) / maxClicks) * 100 : 0;
                    
                    return (
                        <div key={link.id} className="relative">
                            <div className="flex justify-between items-center mb-1.5 relative z-10">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <GetIcon name={link.iconName} className="w-4 h-4 text-gray-400 shrink-0" />
                                    <span className="text-sm font-medium text-gray-700 truncate">{link.title}</span>
                                </div>
                                <span className="text-sm font-bold text-gray-900">{link.clicks || 0}</span>
                            </div>
                            
                            {/* Progress Bar Background */}
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                        </div>
                    );
                })}

                {sortedLinks.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                        No links available to track.
                    </div>
                )}
            </div>
        </div>
        
        {/* Footer info */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 text-center shrink-0">
             <p className="text-[10px] text-gray-400">
                Stats are stored locally on your device for this demo.
             </p>
        </div>

      </div>
    </div>
  );
};

export default AnalyticsModal;