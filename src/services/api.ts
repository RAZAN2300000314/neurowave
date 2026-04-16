import type { AIResponse, FileUrls } from '../types';

// ══════════════════════════════════════════════════════════════
//  NeuroWave — Dual AI Service
//
//  • Dosya yüklendiyse  → Kendi EEG modeliniz  (VITE_API_URL)
//  • Normal sohbetse    → Groq / Llama 3.3 70B (VITE_GROQ_API_KEY)
//
//  Groq ücretsiz key: https://console.groq.com
// ══════════════════════════════════════════════════════════════

const GROQ_API_KEY    = import.meta.env.VITE_GROQ_API_KEY ?? '';
const EEG_BACKEND_URL = import.meta.env.VITE_API_URL ?? '';
const GROQ_MODEL      = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `You are NeuroWave AI, a dual-purpose intelligent assistant.

PRIMARY ROLE — Brain Signal & EEG Analysis:
- Analyze EEG signals, spectrograms, and neural audio recordings
- Identify frequency bands: delta (0.5–4 Hz), theta (4–8 Hz), alpha (8–12 Hz), beta (13–30 Hz), gamma (>30 Hz)
- Detect artifacts, noise, and abnormal patterns
- Interpret mental states and cognitive load
- Provide clinical/research observations and actionable recommendations

SECONDARY ROLE — General Assistant:
- Answer any question on any topic helpfully and accurately
- Maintain conversation context across messages
- Be concise for simple questions, detailed for complex ones

LANGUAGE RULE: Always reply in the exact language the user wrote in.
- Kullanıcı Türkçe yazarsa → Türkçe cevap ver
- If user writes English → reply in English
- إذا كتب المستخدم بالعربية → رد بالعربية

When analyzing brain signals, structure your response with these sections:
1. 📊 Signal Overview
2. 🔬 Frequency Band Analysis
3. 🧠 Observations
4. ✅ Recommendations`;

// ══════════════════════════════════════════════════════════════
//  1. GENEL SOHBET — Groq API (ücretsiz)
// ══════════════════════════════════════════════════════════════

export const sendMessage = async (
  message: string,
  chatHistory: Array<{ role: string; content: string }>
): Promise<AIResponse> => {

  if (!GROQ_API_KEY) {
    throw new Error(
      'Groq API key eksik!\n' +
      '.env dosyasına şunu ekleyin: VITE_GROQ_API_KEY=gsk_...\n' +
      'Ücretsiz key: https://console.groq.com'
    );
  }

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...chatHistory.slice(-20).map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user', content: message },
  ];

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({})) as {
      error?: { message?: string };
    };
    throw new Error(err.error?.message ?? `Groq API hatası: ${response.status}`);
  }

  const data = await response.json() as {
    choices: Array<{ message: { content: string } }>;
  };

  const text = data.choices[0]?.message?.content ?? '';

  return { text, audioUrl: '', spectrogramUrl: '' };
};

// ══════════════════════════════════════════════════════════════
//  2. EEG/BEYİN SİNYALİ ANALİZİ — Kendi modeliniz
//    Backend hazır olduğunda VITE_API_URL'yi .env'e ekleyin
//    Endpoint: POST /api/analyze
//    Body:     { audioUrl?, spectrogramUrl?, inputUrl?, prompt? }
//    Response: { text, audioUrl, spectrogramUrl }
// ══════════════════════════════════════════════════════════════

export const analyzeBrainSignal = async (
  fileUrls: FileUrls,
  prompt?: string
): Promise<AIResponse> => {

  // Kendi backend'iniz hazırsa burası devreye girer
  if (EEG_BACKEND_URL) {
    try {
      const res = await fetch(`${EEG_BACKEND_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fileUrls, prompt }),
      });
      if (!res.ok) throw new Error(`Backend hatası: ${res.status}`);
      return res.json() as Promise<AIResponse>;
    } catch (err) {
      console.warn('EEG backend ulaşılamadı, Groq\'a yönlendiriliyor:', err);
    }
  }

  // Backend yoksa Groq ile analiz et
  const contextMessage = [
    prompt ?? 'Bu beyin sinyali kaydını detaylı analiz et.',
    fileUrls.audioUrl       ? `🔊 Ses dosyası URL: ${fileUrls.audioUrl}` : '',
    fileUrls.spectrogramUrl ? `📊 Spektrogram URL: ${fileUrls.spectrogramUrl}` : '',
    fileUrls.inputUrl       ? `📁 Kaynak dosya URL: ${fileUrls.inputUrl}` : '',
  ].filter(Boolean).join('\n');

  return sendMessage(contextMessage, []);
};

// ══════════════════════════════════════════════════════════════
//  3. DOSYA YÜKLEME — OneDrive backend
//    Backend hazır olduğunda otomatik devreye girer
// ══════════════════════════════════════════════════════════════

export const uploadFile = async (
  file: File,
  type: 'audio' | 'image'
): Promise<FileUrls> => {

  if (EEG_BACKEND_URL) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    const res = await fetch(`${EEG_BACKEND_URL}/api/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Dosya yükleme başarısız');
    return res.json() as Promise<FileUrls>;
  }

  // Mock — backend hazır olunca silinecek
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