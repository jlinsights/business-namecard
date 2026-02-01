import { LinkItem, UserProfile, ThemePreset } from '../types';

export const INITIAL_PROFILE: UserProfile = {
  name: "Alex Sterling",
  role: "Senior Product Designer",
  company: "TabNode Creative",
  bio: "Crafting digital experiences that humanize technology. Passionate about minimalist design and accessibility.",
  avatarUrl: "https://picsum.photos/200/200",
  email: "alex@tabnode.is",
  phone: "+1 (555) 012-3456",
  location: "San Francisco, CA",
  websiteUrl: "https://tabnode.is",
  themeColor: "from-indigo-500 to-purple-600"
};

export const INITIAL_LINKS: LinkItem[] = [
  { id: '1', title: 'My Portfolio', url: 'https://tabnode.is', type: 'website', iconName: 'Globe', clicks: 124 },
  { id: '7', title: 'Latest Video', url: 'https://youtube.com', type: 'social', iconName: 'Youtube', clicks: 85 },
  { id: '6', title: 'GitHub', url: 'https://github.com', type: 'social', iconName: 'Github', clicks: 42 },
  { id: '2', title: 'Instagram', url: 'https://instagram.com', type: 'social', iconName: 'Instagram', clicks: 215 },
  { id: '3', title: 'LinkedIn', url: 'https://linkedin.com', type: 'social', iconName: 'Linkedin', clicks: 156 },
  { id: '4', title: 'Twitter / X', url: 'https://twitter.com', type: 'social', iconName: 'Twitter', clicks: 98 },
  { id: '5', title: 'Book a Call', url: 'https://calendly.com', type: 'contact', iconName: 'Phone', clicks: 34 },
];

export const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', icon: 'Instagram' },
  { id: 'tiktok', label: 'TikTok', icon: 'Music' },
  { id: 'youtube', label: 'YouTube', icon: 'Youtube' },
  { id: 'threads', label: 'Threads', icon: 'AtSign' },
  { id: 'whatsapp', label: 'WhatsApp', icon: 'MessageCircle' },
  { id: 'telegram', label: 'Telegram', icon: 'Send' },
  { id: 'discord', label: 'Discord', icon: 'Gamepad2' },
  { id: 'linkedin', label: 'LinkedIn', icon: 'Linkedin' },
  { id: 'twitter', label: 'Twitter', icon: 'Twitter' },
  { id: 'website', label: 'Website', icon: 'Globe' },
  { id: 'email', label: 'Email', icon: 'Mail' },
  { id: 'phone', label: 'Phone', icon: 'Phone' },
  { id: 'facebook', label: 'Facebook', icon: 'Facebook' },
  { id: 'pinterest', label: 'Pinterest', icon: 'Pin' },
  { id: 'github', label: 'GitHub', icon: 'Github' },
  { id: 'custom', label: 'Custom Link', icon: 'Link' },
];

export const PLATFORM_BASE_URLS: Record<string, string> = {
  instagram: 'https://instagram.com/',
  tiktok: 'https://tiktok.com/@',
  youtube: 'https://youtube.com/@',
  threads: 'https://www.threads.net/@',
  linkedin: 'https://linkedin.com/in/',
  twitter: 'https://twitter.com/',
  facebook: 'https://facebook.com/',
  github: 'https://github.com/',
  pinterest: 'https://pinterest.com/',
  discord: 'https://discord.gg/',
  whatsapp: 'https://wa.me/',
  telegram: 'https://t.me/',
};

export const THEME_PRESETS: ThemePreset[] = [
  { id: 'indigo', value: 'from-indigo-500 to-purple-600', preview: 'bg-gradient-to-r from-indigo-500 to-purple-600' },
  { id: 'pink', value: 'from-pink-500 to-rose-500', preview: 'bg-gradient-to-r from-pink-500 to-rose-500' },
  { id: 'emerald', value: 'from-emerald-400 to-cyan-500', preview: 'bg-gradient-to-r from-emerald-400 to-cyan-500' },
  { id: 'amber', value: 'from-orange-400 to-amber-400', preview: 'bg-gradient-to-r from-orange-400 to-amber-400' },
  { id: 'slate', value: 'from-slate-700 to-slate-900', preview: 'bg-gradient-to-r from-slate-700 to-slate-900' },
  { id: 'blue', value: 'from-blue-400 to-blue-600', preview: 'bg-gradient-to-r from-blue-400 to-blue-600' },
];
