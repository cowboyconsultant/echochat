export enum Sender {
  ME = 'me',
  THEM = 'them'
}

export interface Message {
  id: string;
  sender: Sender;
  text: string;
  timestamp: string;
}

export interface CommunicationStyle {
  formality: number; // 0-100
  warmth: number; // 0-100
  humor: number; // 0-100
  brevity: number; // 0-100 (100 is very brief)
  emojiUsage: number; // 0-100
  keywords: string[];
  description: string;
}

export interface Contact {
  id: string;
  name: string;
  avatarUrl: string;
  messages: Message[];
  analysis?: CommunicationStyle;
  lastAnalyzed?: number;
  draftResponse?: string;
  isAnalyzing?: boolean;
}

export interface AnalysisResponse {
  formality: number;
  warmth: number;
  humor: number;
  brevity: number;
  emojiUsage: number;
  keywords: string[];
  description: string;
}
