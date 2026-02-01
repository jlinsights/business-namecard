import { useState, useEffect } from 'react';
import { LinkItem } from '../types';
import { INITIAL_LINKS, PLATFORMS } from '../constants/data';
import { validateAndFormatUrl } from '../utils/validation';

export function useLinks() {
  const [links, setLinks] = useState<LinkItem[]>(INITIAL_LINKS);
  
  // New Link State
  const [activePlatformId, setActivePlatformId] = useState(PLATFORMS[0].id);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkTitle, setNewLinkTitle] = useState(PLATFORMS[0].label);
  const [linkError, setLinkError] = useState<string | null>(null);

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

  const trackClick = (id: string) => {
    const newLinks = links.map(link => {
        if (link.id === id) return { ...link, clicks: (link.clicks || 0) + 1 };
        return link;
    });
    setLinks(newLinks);
    const clicksMap = newLinks.reduce((acc, link) => ({ ...acc, [link.id]: link.clicks || 0 }), {} as Record<string, number>);
    localStorage.setItem('tabNode_clicks', JSON.stringify(clicksMap));
  };

  const resetNewLinkForm = () => {
      // Helper to reset form based on current platform or default
      const platform = PLATFORMS.find(p => p.id === activePlatformId) || PLATFORMS[0];
      setNewLinkTitle(platform.label);
      if (activePlatformId === 'phone') setNewLinkUrl('tel:');
      else if (activePlatformId === 'email') setNewLinkUrl('mailto:');
      else setNewLinkUrl('');
      setLinkError(null);
  };

  const handleAddLink = () => {
    const validation = validateAndFormatUrl(newLinkUrl, activePlatformId);
    if (!validation.isValid) {
        setLinkError(validation.error || 'Invalid input');
        return false;
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
    resetNewLinkForm();
    return true;
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

  const validateCurrentUrl = () => {
      if (!newLinkUrl) return;
      const validation = validateAndFormatUrl(newLinkUrl, activePlatformId);
      if (!validation.isValid) {
          setLinkError(validation.error || 'Invalid input');
      } else {
          setLinkError(null);
          setNewLinkUrl(validation.formattedUrl);
      }
  };

  const selectPlatform = (id: string) => {
      setActivePlatformId(id);
      const platform = PLATFORMS.find(p => p.id === id);
      if (platform) {
          setNewLinkTitle(platform.label);
          setLinkError(null);
          if (id === 'phone') setNewLinkUrl('tel:');
          else if (id === 'email') setNewLinkUrl('mailto:');
          else setNewLinkUrl('');
      }
  };

  return {
    links,
    activePlatformId,
    newLinkUrl,
    newLinkTitle,
    linkError,
    setNewLinkUrl,
    setNewLinkTitle,
    setLinkError,
    trackClick,
    handleAddLink,
    handleDeleteLink,
    handleMoveLink,
    validateCurrentUrl,
    selectPlatform
  };
}
