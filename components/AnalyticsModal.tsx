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

  // --- CHART LOGIC ---
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en-US', { weekday: 'short' });
    return { date: dateStr, label, count: 0 };
  });

  // Aggregate clicks
  links.forEach(link => {
    if (link.clickTimestamps) {
      link.clickTimestamps.forEach(ts => {
        const dateStr = new Date(ts).toISOString().split('T')[0];
        const day = last7Days.find(d => d.date === dateStr);
        if (day) day.count++;
      });
    }
  });

  const maxDaily = Math.max(...last7Days.map(d => d.count)) || 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative animate-scale-up flex flex-col max-h-[90vh]">
        
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
             <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 text-white shadow-lg flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2 text-gray-300 mb-1">
                      <GetIcon name="BarChart2" className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase tracking-wider">Total Clicks</span>
                  </div>
                  <div className="text-4xl font-bold tracking-tight">{totalClicks}</div>
                </div>
                <div className="text-right">
                   <span className="text-xs text-green-400 font-bold bg-green-500/20 px-2 py-1 rounded-lg">+12% vs last week</span>
                </div>
             </div>
        </div>

        {/* Trend Chart (Last 7 Days) */}
        <div className="p-5 pb-0 shrink-0">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Last 7 Days</h4>
            <div className="flex items-end justify-between h-24 gap-2">
                {last7Days.map((day, i) => {
                    const height = (day.count / maxDaily) * 100;
                    return (
                        <div key={i} className="flex flex-col items-center flex-1 gap-1 group cursor-default">
                             <div className="w-full relative flex items-end h-full">
                                <div 
                                  className="w-full bg-blue-100 rounded-t-md relative group-hover:bg-blue-200 transition-colors"
                                  style={{ height: `${height}%`, minHeight: '4px' }}
                                >
                                   {/* Tooltip */}
                                   <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 font-bold">
                                      {day.count} clicks
                                   </div>
                                </div>
                             </div>
                             <span className="text-[10px] text-gray-400 font-medium">{day.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Links List */}
        <div className="flex-1 overflow-y-auto p-5 no-scrollbar">
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