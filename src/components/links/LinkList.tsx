import React from 'react';
import { LinkItem } from '../../types';
import { GetIcon } from '../Icons';

interface LinkListProps {
  links: LinkItem[];
  showEditControls: boolean;
  handleLinkClick: (id: string) => void;
  handleMoveLink: (index: number, direction: 'up' | 'down') => void;
  handleDeleteLink: (id: string) => void;
}

export const LinkList: React.FC<LinkListProps> = ({
  links,
  showEditControls,
  handleLinkClick,
  handleMoveLink,
  handleDeleteLink
}) => {
  return (
    <>
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
    </>
  );
};
