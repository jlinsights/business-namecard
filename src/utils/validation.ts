import { PLATFORM_BASE_URLS } from '../constants/data';

export const validateAndFormatUrl = (input: string, platformId: string): { isValid: boolean; formattedUrl: string; error?: string } => {
  const trimmed = input.trim();
  if (!trimmed) return { isValid: false, formattedUrl: input, error: 'This field cannot be empty.' };

  // 1. Phone Validation
  if (platformId === 'phone') {
    const cleanNumber = trimmed.replace(/^tel:/i, '');
    const hasInvalidChars = /[^0-9+\-\s().]/.test(cleanNumber);
    const digitCount = cleanNumber.replace(/\D/g, '').length;
    
    if (hasInvalidChars) return { isValid: false, formattedUrl: input, error: 'Phone number contains invalid characters.' };
    if (digitCount < 3) return { isValid: false, formattedUrl: input, error: 'Phone number is too short.' };
    
    return { isValid: true, formattedUrl: trimmed.toLowerCase().startsWith('tel:') ? trimmed : `tel:${trimmed}` };
  }

  // 2. WhatsApp Validation
  if (platformId === 'whatsapp') {
    let number = trimmed;
    if (trimmed.startsWith('https://wa.me/')) {
        number = trimmed.replace('https://wa.me/', '');
    } else if (trimmed.startsWith('whatsapp://')) {
        number = trimmed.replace('whatsapp://', '');
    }

    // Strip everything but numbers. WhatsApp API format requires country code but no '+'
    const cleanNumber = number.replace(/[^0-9]/g, '');
    
    if (cleanNumber.length < 7) {
        return { isValid: false, formattedUrl: input, error: 'Invalid WhatsApp number. Please enter digits including country code.' };
    }
    return { isValid: true, formattedUrl: `https://wa.me/${cleanNumber}` };
  }

  // 3. Email Validation
  if (platformId === 'email') {
    const cleanEmail = trimmed.replace(/^mailto:/i, '');
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail);
    
    if (!isEmail) {
       if (!cleanEmail.includes('@')) return { isValid: false, formattedUrl: input, error: 'Email is missing "@".' };
       if (cleanEmail.includes('@') && !cleanEmail.split('@')[1].includes('.')) return { isValid: false, formattedUrl: input, error: 'Email domain is incomplete.' };
       return { isValid: false, formattedUrl: input, error: 'Invalid email format.' };
    }
    return { isValid: true, formattedUrl: trimmed.toLowerCase().startsWith('mailto:') ? trimmed : `mailto:${trimmed}` };
  }

  // 4. TikTok Validation
  if (platformId === 'tiktok') {
    let handle = trimmed;
    if (trimmed.includes('tiktok.com/')) {
        const parts = trimmed.split('tiktok.com/');
        if (parts[1]) {
            handle = parts[1].replace('@', '').split('?')[0]; 
        }
    } else {
        handle = trimmed.replace(/^@/, '');
    }

    if (/[^a-zA-Z0-9_.]/.test(handle)) {
        return { isValid: false, formattedUrl: input, error: 'TikTok usernames can only contain letters, numbers, underscores, and periods.' };
    }
    return { isValid: true, formattedUrl: `https://tiktok.com/@${handle}` };
  }

  // 5. Telegram Validation
  if (platformId === 'telegram') {
    let cleanInput = trimmed;
    if (cleanInput.includes('t.me/')) {
        cleanInput = cleanInput.split('t.me/')[1];
    } else if (cleanInput.includes('telegram.me/')) {
        cleanInput = cleanInput.split('telegram.me/')[1];
    }
    
    if (cleanInput.startsWith('@')) {
        cleanInput = cleanInput.substring(1);
    }

    if (cleanInput.startsWith('+')) {
         return { isValid: true, formattedUrl: `https://t.me/${cleanInput}` };
    }

    cleanInput = cleanInput.split('?')[0];

    const handle = cleanInput.replace(/[^a-zA-Z0-9_]/g, '');
    
    if (!handle) return { isValid: false, formattedUrl: input, error: 'Invalid username.' };
    
    return { isValid: true, formattedUrl: `https://t.me/${handle}` };
  }

  // 6. Discord Validation
  if (platformId === 'discord') {
    let inputUrl = trimmed;
    
    if (!inputUrl.includes('/') && !inputUrl.includes('.')) {
        return { isValid: true, formattedUrl: `https://discord.gg/${inputUrl}` };
    }

    if (inputUrl.includes('discord.gg/')) {
        const code = inputUrl.split('discord.gg/')[1].split('?')[0];
        if (code) return { isValid: true, formattedUrl: `https://discord.gg/${code}` };
    }
    
    if (inputUrl.includes('discord.com/invite/')) {
        const code = inputUrl.split('discord.com/invite/')[1].split('?')[0];
        if (code) return { isValid: true, formattedUrl: `https://discord.gg/${code}` };
    }
  }

  // 7. Threads Validation
  if (platformId === 'threads') {
    let handle = trimmed;
    if (trimmed.includes('threads.net/')) {
        const parts = trimmed.split('threads.net/');
        if (parts[1]) {
            handle = parts[1].replace('@', '').split('?')[0];
        }
    } else {
        handle = trimmed.replace(/^@/, '');
    }

    if (/[^a-zA-Z0-9_.]/.test(handle)) {
        return { isValid: false, formattedUrl: input, error: 'Invalid username characters.' };
    }
    return { isValid: true, formattedUrl: `https://www.threads.net/@${handle}` };
  }

  // 8. Social Username Handling
  const baseUrl = PLATFORM_BASE_URLS[platformId];
  const hasProtocol = /^[a-zA-Z]+:\/\//.test(trimmed); 
  const hasSlashes = trimmed.includes('/');
  
  if (baseUrl && !hasProtocol && !hasSlashes) {
    const cleanHandle = trimmed.replace(/^@/, '');
    if (/\s/.test(cleanHandle)) return { isValid: false, formattedUrl: input, error: 'Usernames cannot contain spaces.' };
    return { isValid: true, formattedUrl: `${baseUrl}${cleanHandle}` };
  }

  // 9. General URL Validation
  let urlToCheck = trimmed;

  if (/\s/.test(trimmed)) {
      return { isValid: false, formattedUrl: input, error: 'URL cannot contain spaces.' };
  }
  
  if (/^[a-zA-Z]+:\/\//.test(trimmed)) {
      if (!/^https?:\/\//i.test(trimmed)) {
          return { isValid: false, formattedUrl: input, error: 'Only http/https protocols are supported.' };
      }
      urlToCheck = trimmed;
  } else {
    urlToCheck = `https://${trimmed}`;
  }

  try {
    const urlObj = new URL(urlToCheck);
    if (!urlObj.hostname.includes('.') && !urlObj.protocol.startsWith('localhost')) {
       return { isValid: false, formattedUrl: input, error: 'Domain name is incomplete (e.g., .com missing).' };
    }
    
    const hostnameParts = urlObj.hostname.split('.');
    const tld = hostnameParts[hostnameParts.length - 1];
    if (tld.length < 2 || /\d/.test(tld)) {
         return { isValid: false, formattedUrl: input, error: 'Invalid domain extension.' };
    }

    return { isValid: true, formattedUrl: urlToCheck };
  } catch (e) {
    return { isValid: false, formattedUrl: input, error: 'Malformed URL structure.' };
  }
};
