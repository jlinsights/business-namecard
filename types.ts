export interface LinkItem {
  id: string;
  title: string;
  url: string;
  type: 'social' | 'website' | 'contact' | 'video';
  iconName: string; // Storing icon name as string for dynamic lookup
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
  name: string;
  icon: any;
  placeholder: string;
}