import { GoogleGenAI, Type } from "@google/genai";

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
 * Generates a vCard format string for the user (AI not strictly needed but good for formatting)
 * We will stick to a simple template function here for reliability, but use AI if we wanted to extract details from text.
 */
export const generateVCardData = (
  name: string,
  phone: string,
  email: string,
  role: string,
  url: string
): string => {
  return `BEGIN:VCARD
VERSION:3.0
FN:${name}
TITLE:${role}
TEL;TYPE=CELL:${phone}
EMAIL;TYPE=WORK:${email}
URL:${url}
END:VCARD`;
};