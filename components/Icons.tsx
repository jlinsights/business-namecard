import React from 'react';
import { 
  Instagram, 
  Linkedin, 
  Twitter, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  Share2, 
  Download, 
  QrCode, 
  Edit2, 
  Sparkles, 
  X, 
  Copy,
  Check,
  Github,
  Youtube,
  Send,
  Trash2,
  Plus,
  Link,
  Eye,
  EyeOff,
  Palette
} from 'lucide-react';

export const IconMap: Record<string, React.FC<any>> = {
  Instagram,
  Linkedin,
  Twitter,
  Globe,
  Mail,
  Phone,
  MapPin,
  Share2,
  Download, 
  QrCode,
  Edit2,
  Sparkles,
  X,
  Copy,
  Check,
  Github,
  Youtube,
  Send,
  Trash2,
  Plus,
  Link,
  Eye,
  EyeOff,
  Palette
};

export const GetIcon = ({ name, className = "w-5 h-5" }: { name: string, className?: string }) => {
  const Icon = IconMap[name] || Globe;
  return <Icon className={className} />;
};