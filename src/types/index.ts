export interface LinkItem {
  id: string;
  title: string;
  url: string;
  type: 'social' | 'website' | 'contact' | 'video';
  iconName: string;
  clicks?: number;
}

export interface UserProfile {
  name: string;
  role: string;
  company: string;
  bio: string;
  avatarUrl: string;
  email: string;
  phone: string;
  location: string;
  websiteUrl?: string;
  themeColor: string;
}

export interface SocialPlatform {
  id: string;
  label: string;
  icon: string;
  placeholder?: string;
  // properties found in usage:
  // PLATFORMS array has id, label, icon.
  // PLATFORM_BASE_URLS is separate.
}

export interface ThemePreset {
  id: string;
  value: string;
  preview: string;
}
