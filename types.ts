export interface LinkItem {
  id: string;
  title: string;
  url: string;
  type: 'social' | 'website' | 'contact' | 'video' | 'commerce' | 'locked';
  iconName: string; 
  clicks?: number;
  clickTimestamps?: number[]; 
  price?: string; 
  currency?: string;
  description?: string;
  isLocked?: boolean;
}

export interface PrivacySettings {
  emailVisible: boolean;
  phoneVisible: boolean;
  locationVisible: boolean;
  maskSensitiveData: boolean; // If true, data is masked (e.g. +1 555-***-****) until clicked
}

export interface AuditLogEntry {
  id: string;
  action: string;
  timestamp: number;
  ipAddress: string;
  device: string;
  status: 'success' | 'warning' | 'failed';
}

export interface UserProfile {
  id: string; 
  type: 'business' | 'personal'; // Contextual Identity
  organizationName?: string; // For business profiles
  isVerified?: boolean;
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
  links: LinkItem[]; 
  privacySettings: PrivacySettings;
}

export interface SocialPlatform {
  id: string;
  name: string;
  icon: any;
  placeholder: string;
}