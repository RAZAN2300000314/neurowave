export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

// ──────────────────────────────────────────────────────────────
//  EEG Analysis types — attached to assistant messages
// ──────────────────────────────────────────────────────────────

export interface BandPowers {
  delta: number;
  theta: number;
  alpha: number;
  beta:  number;
  gamma: number;
}

export interface TopKPrediction {
  label: string;
  confidence: number;
}

export interface Classification {
  mode: 'binary' | 'multiclass';
  label: string;
  confidence: number;
  top_k: TopKPrediction[];
}

// ──────────────────────────────────────────────────────────────
//  Message (one chat bubble)
// ──────────────────────────────────────────────────────────────

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;

  // File upload info (for user messages)
  audioUrl?: string;
  spectrogramUrl?: string;
  inputUrl?: string;
  fileType?: 'audio' | 'image' | 'none';
  fileName?: string;

  // Analysis visuals (for assistant messages from the backend)
  waveformUrl?: string;
  bandPowers?: BandPowers;
  classification?: Classification;
  hasVisuals?: boolean;
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

// ──────────────────────────────────────────────────────────────
//  AI Response — what api.ts returns
// ──────────────────────────────────────────────────────────────

export interface AIResponse {
  text: string;
  audioUrl?: string;
  spectrogramUrl?: string;
  waveformUrl?: string;
  bandPowers?: BandPowers;
  classification?: Classification;
  hasVisuals?: boolean;
}

export interface UserSettings {
  theme: 'dark' | 'light';
  language: 'en' | 'tr' | 'ar';
  userId: string;
}

export type Language = 'en' | 'tr' | 'ar';
export type Theme = 'dark' | 'light';