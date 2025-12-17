import { GoogleGenAI, Type } from "@google/genai";
import { Message, Sender, AnalysisResponse, Contact } from '../types';

// Mock Data for "Demo Mode" when API is unavailable
const getMockAnalysis = (name: string): AnalysisResponse => {
  const isProfessional = name.toLowerCase().includes('boss') || name.toLowerCase().includes('mr') || name.toLowerCase().includes('mrs');
  const isFamily = name.toLowerCase().includes('mom') || name.toLowerCase().includes('dad');

  if (isProfessional) {
    return {
      formality: 85,
      warmth: 30,
      humor: 15,
      brevity: 70,
      emojiUsage: 5,
      keywords: ["Certainly", "Will do", "Thanks", "Report", "Meeting"],
      description: "Professional, concise, and respectful. You avoid slang and keep messages work-focused."
    };
  } else if (isFamily) {
    return {
      formality: 20,
      warmth: 95,
      humor: 60,
      brevity: 40,
      emojiUsage: 60,
      keywords: ["Love you", "Ok", "Call me", "Home", "Soon"],
      description: "Warm and affectionate. You prioritize connection and frequent updates."
    };
  }
  
  // Default/Friend
  return {
    formality: 15,
    warmth: 80,
    humor: 85,
    brevity: 30,
    emojiUsage: 90,
    keywords: ["Omg", "Literally", "Dead", "Rn", "Lmao"],
    description: "Highly casual and expressive. You use internet slang, lots of emojis, and an energetic tone."
  };
};

const getMockReply = (incoming: string, style?: AnalysisResponse): string => {
  const text = incoming.toLowerCase();
  if (text.includes('?')) {
    return style?.formality && style.formality > 50 
      ? "I will look into that and get back to you shortly." 
      : "Idk tbh, lemme check! 🤔";
  }
  if (text.includes('lol') || text.includes('haha')) {
    return "LMAO right?? 💀";
  }
  if (text.includes('call') || text.includes('meet')) {
    return style?.formality && style.formality > 50 
      ? "I am available at 2 PM." 
      : "Yeah sure! I'm free whenever.";
  }
  return style?.formality && style.formality > 50 
    ? "Acknowledged. Thank you." 
    : "Sounds good!";
};

const getClient = () => {
  const apiKey = process.env.API_KEY;
  // If no key, return null to trigger fallback
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const analyzeContactStyle = async (contactName: string, messages: Message[]): Promise<AnalysisResponse> => {
  const ai = getClient();
  
  // FALLBACK: If no API key is set, use Mock Data (Demo Mode)
  if (!ai) {
    console.warn("Demo Mode: API_KEY not set. Returning simulated analysis.");
    return new Promise(resolve => setTimeout(() => resolve(getMockAnalysis(contactName)), 1500));
  }
  
  const myMessages = messages.filter(m => m.sender === Sender.ME).map(m => m.text).join('\n');
  
  if (!myMessages) {
    return {
      formality: 50,
      warmth: 50,
      humor: 50,
      brevity: 50,
      emojiUsage: 0,
      keywords: [],
      description: "Insufficient data to analyze style."
    };
  }

  const prompt = `
    Analyze the following messages sent by a user to their contact named "${contactName}". 
    Determine the user's communication style specifically for this relationship.
    
    Messages:
    ${myMessages}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            formality: { type: Type.NUMBER, description: "0-100 score (100 is very formal)" },
            warmth: { type: Type.NUMBER, description: "0-100 score (100 is very warm)" },
            humor: { type: Type.NUMBER, description: "0-100 score (100 is very humorous)" },
            brevity: { type: Type.NUMBER, description: "0-100 score (100 is very brief/short messages)" },
            emojiUsage: { type: Type.NUMBER, description: "0-100 score for frequency of emoji use" },
            keywords: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of 3-5 frequent characteristic words or phrases"
            },
            description: { type: Type.STRING, description: "A concise qualitative description of the communication persona." }
          },
          required: ["formality", "warmth", "humor", "brevity", "emojiUsage", "keywords", "description"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResponse;
    }
    throw new Error("No response text");
  } catch (error) {
    console.error("Analysis failed, falling back to demo mode", error);
    // FALLBACK on error (e.g. quota exceeded or network issue)
    return getMockAnalysis(contactName);
  }
};

export const generateContextualReply = async (contact: Contact, incomingMessage: string): Promise<string> => {
  const ai = getClient();

  // FALLBACK: If no API key is set, use Mock Data
  if (!ai) {
    console.warn("Demo Mode: API_KEY not set. Returning simulated reply.");
    return new Promise(resolve => setTimeout(() => resolve(getMockReply(incomingMessage, contact.analysis)), 1000));
  }

  // Construct context
  const recentHistory = contact.messages.slice(-10).map(m => `${m.sender === Sender.ME ? 'Me' : contact.name}: ${m.text}`).join('\n');
  const style = contact.analysis;
  
  const styleDescription = style ? 
    `My usual style with ${contact.name} is: ${style.description}. 
     Stats - Formality: ${style.formality}, Humor: ${style.humor}, Emoji Usage: ${style.emojiUsage}, Brevity: ${style.brevity}.` 
    : "Respond naturally based on the conversation history.";

  const prompt = `
    You are acting as 'Me'. You need to reply to a text from ${contact.name}.
    
    History of conversation:
    ${recentHistory}
    
    New Incoming Message from ${contact.name}:
    "${incomingMessage}"
    
    Directives:
    1. ${styleDescription}
    2. Maintain the established tone (e.g., if I usually use lowercase or specific slang, do that).
    3. If brevity is high, keep it short.
    4. Provide ONLY the text of the reply, no quotes or explanations.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text?.trim() || "";
  } catch (error) {
    console.error("Generation failed, falling back to demo mode", error);
    return getMockReply(incomingMessage, contact.analysis);
  }
};