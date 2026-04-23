import type { AIResponse, FileUrls } from '../types';

// ══════════════════════════════════════════════════════════════
//  NeuroWave API Client
//
//  All chat traffic goes through our FastAPI backend (VITE_API_URL).
//  The backend talks to Groq and generates demo EEG visuals.
//
//  Old direct-to-Groq path is commented out below for reference.
// ══════════════════════════════════════════════════════════════

const EEG_BACKEND_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

// Small helper: convert absolute /static/... URLs from the backend into
// whatever the frontend will actually request. Since the backend already
// returns absolute URLs (http://localhost:8000/static/...), we pass them
// through untouched.
const passthroughUrl = (u?: string): string | undefined => u || undefined;

// ══════════════════════════════════════════════════════════════
//  1. TEXT CHAT — goes to FastAPI backend
// ══════════════════════════════════════════════════════════════

export const sendMessage = async (
  message: string,
  chatHistory: Array<{ role: string; content: string }>,
  dataset: 'ieeg' | 'eeg' = 'ieeg'
): Promise<AIResponse> => {

  const history = chatHistory.slice(-20).map((m) => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content,
  }));

  const res = await fetch(`${EEG_BACKEND_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input_type: 'text',
      text: message,
      history,
      mode: 'binary',
      dataset,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    throw new Error(`Backend error ${res.status}: ${errBody || res.statusText}`);
  }

  const data = await res.json() as {
    aiText: string;
    audioUrl?: string;
    spectrogramUrl?: string;
    waveformUrl?: string;
    bandPowers?: AIResponse['bandPowers'];
    classification?: AIResponse['classification'];
    hasVisuals?: boolean;
  };

  return {
    text: data.aiText,
    audioUrl: passthroughUrl(data.audioUrl),
    spectrogramUrl: passthroughUrl(data.spectrogramUrl),
    waveformUrl: passthroughUrl(data.waveformUrl),
    bandPowers: data.bandPowers,
    classification: data.classification,
    hasVisuals: data.hasVisuals,
  };
};

// ══════════════════════════════════════════════════════════════
//  2. EEG FILE ANALYSIS — also goes to FastAPI /chat
//     (backend decides input_type based on what we send)
// ══════════════════════════════════════════════════════════════

export const analyzeBrainSignal = async (
  fileUrls: FileUrls,
  prompt?: string,
  dataset: 'ieeg' | 'eeg' = 'ieeg'
): Promise<AIResponse> => {

  // Pick a file_url + input_type. Prefer audio if both exist.
  const fileUrl =
    fileUrls.audioUrl ||
    fileUrls.spectrogramUrl ||
    fileUrls.inputUrl ||
    '';

  const inputType: 'audio' | 'image' =
    fileUrls.audioUrl ? 'audio' : 'image';

  const res = await fetch(`${EEG_BACKEND_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input_type: inputType,
      text: prompt ?? 'Please analyze this brain signal recording in detail.',
      file_url: fileUrl,
      history: [],
      mode: 'binary',
      dataset,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    throw new Error(`Backend error ${res.status}: ${errBody || res.statusText}`);
  }

  const data = await res.json() as {
    aiText: string;
    audioUrl?: string;
    spectrogramUrl?: string;
    waveformUrl?: string;
    bandPowers?: AIResponse['bandPowers'];
    classification?: AIResponse['classification'];
    hasVisuals?: boolean;
  };

  return {
    text: data.aiText,
    audioUrl: passthroughUrl(data.audioUrl),
    spectrogramUrl: passthroughUrl(data.spectrogramUrl),
    waveformUrl: passthroughUrl(data.waveformUrl),
    bandPowers: data.bandPowers,
    classification: data.classification,
    hasVisuals: data.hasVisuals,
  };
};

// ══════════════════════════════════════════════════════════════
//  3. FILE UPLOAD — mock for demo (backend /upload exists but
//     we don't have real OneDrive yet). Left as-is.
// ══════════════════════════════════════════════════════════════

export const uploadFile = async (
  file: File,
  type: 'audio' | 'image'
): Promise<FileUrls> => {

  // Try real backend upload first
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    const res = await fetch(`${EEG_BACKEND_URL}/upload`, {
      method: 'POST',
      body: formData,
    });
    if (res.ok) {
      return await res.json() as FileUrls;
    }
  } catch {
    // fall through to mock
  }

  // Mock fallback
  await new Promise((r) => setTimeout(r, 600));
  const mockId = Math.random().toString(36).slice(2, 10).toUpperCase();

  if (type === 'audio') {
    return {
      audioUrl: `https://onedrive.live.com/download?id=AUDIO_${mockId}`,
      inputUrl: `https://onedrive.live.com/download?id=INPUT_${mockId}`,
    };
  }
  return {
    spectrogramUrl: `https://onedrive.live.com/download?id=SPEC_${mockId}`,
    inputUrl:       `https://onedrive.live.com/download?id=INPUT_${mockId}`,
  };
};