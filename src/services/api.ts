import type { AIResponse, FileUrls } from '../types';

// ──────────────────────────────────────────────────────────────
// API SERVICE
// Currently uses mock data. Replace BASE_URL with your backend.
// ──────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

// Mock delay to simulate network
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ─── MOCK RESPONSE ────────────────────────────

const MOCK_RESPONSE: AIResponse = {
  text: "Brain signal analysis complete. The EEG data shows elevated alpha wave activity (8–12 Hz) in the occipital region, suggesting a relaxed but alert mental state. Beta waves (13–30 Hz) are within normal range, indicating no significant stress markers. The uploaded spectrogram reveals clear frequency bands with minimal noise artifacts. No anomalous spike patterns detected.",
  audioUrl: "https://onedrive.live.com/download?id=MOCK_AUDIO_FILE_ID",
  spectrogramUrl: "https://onedrive.live.com/download?id=MOCK_SPECTROGRAM_ID",
};

// ─── SEND MESSAGE (text only) ─────────────────

export const sendMessage = async (
  message: string,
  chatHistory: Array<{ role: string; content: string }>
): Promise<AIResponse> => {
  // Replace with real API call:
  // const res = await fetch(`${BASE_URL}/api/chat`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ message, history: chatHistory }),
  // });
  // return res.json();

  await delay(1200 + Math.random() * 800);

  // Vary mock responses slightly
  const responses = [
    MOCK_RESPONSE,
    {
      text: "Signal processing analysis indicates theta wave dominance (4–7 Hz), commonly associated with drowsiness or deep meditation. The power spectral density plot shows a characteristic 1/f noise profile. Recommend increasing sample frequency for more precise delta wave isolation.",
      audioUrl: "https://onedrive.live.com/download?id=MOCK_AUDIO_FILE_ID_2",
      spectrogramUrl: "https://onedrive.live.com/download?id=MOCK_SPECTROGRAM_ID_2",
    },
    {
      text: "Artifact detection complete. The uploaded brain signal contains minor muscle (EMG) contamination around the 40–60 Hz range. After applying a notch filter at 50 Hz, the underlying neural patterns are preserved. Gamma oscillations (>30 Hz) suggest high cognitive load during the recording session.",
      audioUrl: "https://onedrive.live.com/download?id=MOCK_AUDIO_FILE_ID_3",
      spectrogramUrl: "https://onedrive.live.com/download?id=MOCK_SPECTROGRAM_ID_3",
    },
  ];

  const _ = chatHistory; // suppress lint warning
  const _2 = message;
  void _;
  void _2;

  return responses[Math.floor(Math.random() * responses.length)];
};

// ─── UPLOAD FILE (returns OneDrive URL) ───────

export const uploadFile = async (
  file: File,
  type: 'audio' | 'image'
): Promise<FileUrls> => {
  // Replace with actual backend upload endpoint that handles OneDrive:
  // const formData = new FormData();
  // formData.append('file', file);
  // formData.append('type', type);
  // const res = await fetch(`${BASE_URL}/api/upload`, { method: 'POST', body: formData });
  // return res.json();

  await delay(1500);

  const mockId = Math.random().toString(36).slice(2, 10).toUpperCase();

  if (type === 'audio') {
    return {
      audioUrl: `https://onedrive.live.com/download?id=AUDIO_${mockId}`,
      inputUrl: `https://onedrive.live.com/download?id=INPUT_${mockId}`,
    };
  }
  return {
    spectrogramUrl: `https://onedrive.live.com/download?id=SPEC_${mockId}`,
    inputUrl: `https://onedrive.live.com/download?id=INPUT_${mockId}`,
  };
};

// ─── ANALYZE BRAIN SIGNAL ─────────────────────

export const analyzeBrainSignal = async (
  fileUrls: FileUrls,
  prompt?: string
): Promise<AIResponse> => {
  // Replace with real endpoint:
  // const res = await fetch(`${BASE_URL}/api/analyze`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ ...fileUrls, prompt }),
  // });
  // return res.json();

  void fileUrls;
  void prompt;
  await delay(2000 + Math.random() * 1000);
  return MOCK_RESPONSE;
};

export const _ = BASE_URL; // export to avoid unused warning
