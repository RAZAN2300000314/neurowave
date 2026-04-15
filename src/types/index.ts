export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  audioUrl?: string;
  spectrogramUrl?: string;
  inputUrl?: string;
  fileType?: 'audio' | 'image' | 'none';
  fileName?: string;
}

export interface Chat {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  userId: string;
  messages: Message[];
  previewText?: string;
}

export interface FileUrls {
  audioUrl?: string;
  spectrogramUrl?: string;
  inputUrl?: string;
}

export interface AIResponse {
  text: string;
  audioUrl: string;
  spectrogramUrl: string;
}

export interface UserSettings {
  theme: 'dark' | 'light';
  language: 'en' | 'tr' | 'ar';
  userId: string;
}

export type Language = 'en' | 'tr' | 'ar';
export type Theme = 'dark' | 'light';
