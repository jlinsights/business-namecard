import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

/**
 * Generates a professional bio based on raw user input or keywords.
 */
export const generateProfessionalBio = async (
  currentBio: string,
  role: string,
  tone: 'professional' | 'creative' | 'friendly' | 'humorous' | 'inspirational'
): Promise<string> => {
  if (!apiKey) {
    console.warn("Gemini API Key is missing.");
    return "API Key missing. Please configure your environment.";
  }

  try {
    const prompt = `
      You are an expert copywriter for digital business cards.
      Rewrite the following bio information into a concise, engaging, and ${tone} bio suitable for a mobile landing page.
      
      Role: ${role}
      Current Input/Keywords: ${currentBio}
      
      Constraints:
      - Keep it under 280 characters.
      - No hashtags.
      - Return ONLY the raw text string.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text?.trim() || currentBio;
  } catch (error) {
    console.error("Error generating bio:", error);
    return currentBio;
  }
};

/**
 * Generates a vCard format string for the user with comprehensive details.
 */
export const generateVCardData = (
  profile: UserProfile,
  currentUrl: string
): string => {
  const parts = profile.name.trim().split(/\s+/);
  const firstName = parts[0] || "";
  const lastName = parts.slice(1).join(" ") || "";
  const org = profile.company || profile.organizationName || "";
  // Ensure bio newlines are handled for vCard format (escaped \n)
  const escapedBio = (profile.bio || "").replace(/\n/g, "\\n").replace(/,/g, "\\,"); 
  const escapedLoc = (profile.location || "").replace(/,/g, "\\,");

  return `BEGIN:VCARD
VERSION:3.0
FN:${profile.name}
N:${lastName};${firstName};;;
ORG:${org}
TITLE:${profile.role}
TEL;TYPE=CELL,VOICE:${profile.phone}
EMAIL;TYPE=WORK,INTERNET:${profile.email}
URL:${profile.websiteUrl || currentUrl}
ADR;TYPE=WORK:;;${escapedLoc};;;;
NOTE:${escapedBio}
END:VCARD`;
};
