# NeuroWave — AI Brain Signal Analysis App

A full-stack React application for AI-powered EEG and brain signal analysis, built with Vite + TypeScript + Tailwind CSS + Firebase.

---

## 🏗 Project Structure

```
src/
├── pages/
│   ├── LoginPage.tsx          # Email/password auth
│   ├── HomePage.tsx           # Dashboard with stats
│   ├── ChatPage.tsx           # Main chat + file upload
│   ├── HistoryPage.tsx        # Previous analyses
│   └── SettingsPage.tsx       # Theme, language, profile
├── components/
│   ├── layout/
│   │   └── AppLayout.tsx      # Sidebar + routing shell
│   └── chat/
│       ├── MessageBubble.tsx  # Chat message with audio/spectrogram
│       ├── AudioPlayer.tsx    # Custom audio player
│       ├── FileUpload.tsx     # Drag-and-drop file uploader
│       └── TypingIndicator.tsx
├── services/
│   ├── firebase.ts            # Auth + Firestore helpers
│   └── api.ts                 # AI API (mock → real)
├── contexts/
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
├── i18n/
│   └── index.ts               # EN / TR / AR translations
├── types/
│   └── index.ts
└── utils/
    └── nanoid.ts
```

---

## 🔥 Firebase Setup Guide

### Step 1 — Create a Firebase Project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"** → name it (e.g. `neurowave`)
3. Disable Google Analytics (optional) → **Create project**

### Step 2 — Enable Authentication

1. In the Firebase Console sidebar → **Build → Authentication**
2. Click **"Get started"**
3. Under **Sign-in method**, enable **Email/Password**
4. Save

### Step 3 — Create Firestore Database

1. Sidebar → **Build → Firestore Database**
2. Click **"Create database"**
3. Choose **Start in production mode** (we have rules below) or test mode
4. Select a region → **Done**

### Step 4 — Apply Firestore Security Rules

Copy the contents of `firestore.rules` into:
**Firestore → Rules tab → Replace → Publish**

### Step 5 — Get Your Firebase Config

1. Sidebar → **Project Settings** (gear icon)
2. Scroll to **"Your apps"** → click **Web** (`</>`)
3. Register app name → **Register app**
4. Copy the `firebaseConfig` object

### Step 6 — Add Config to the Project

**Option A — Direct (quick start):**
Open `src/services/firebase.ts` and replace the placeholder values:
```ts
const firebaseConfig = {
  apiKey:            "AIzaSy...",
  authDomain:        "your-project.firebaseapp.com",
  projectId:         "your-project",
  storageBucket:     "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abc123",
};
```

**Option B — Environment variables (recommended):**
1. Copy `.env.example` → `.env`
2. Fill in your values
3. Update `firebase.ts` to use `import.meta.env.VITE_FIREBASE_*`

---

## ☁️ OneDrive Integration

NeuroWave stores **file URLs** (not the files themselves) in Firestore. Files live on OneDrive.

### Firestore document shape (`fileUrls/{chatId}_{messageId}`):
```json
{
  "chatId": "abc123",
  "messageId": "xyz789",
  "audioUrl": "https://onedrive.live.com/download?id=...",
  "spectrogramUrl": "https://onedrive.live.com/download?id=...",
  "inputUrl": "https://onedrive.live.com/download?id=..."
}
```

### To enable real OneDrive uploads:
1. Build a backend endpoint (Python/FastAPI or Node/Express)
2. Use the [Microsoft Graph API](https://learn.microsoft.com/en-us/graph/api/driveitem-put-content) to upload files
3. Return the download URL
4. Replace the mock in `src/services/api.ts → uploadFile()`

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Copy env template
cp .env.example .env
# → Fill in your Firebase config

# Start dev server
npm run dev

# Build for production
npm run build
```

---

## 🌐 Multi-language Support

Supported: **English**, **Turkish**, **Arabic** (RTL auto-applied)

Change via Settings page. Language preference is persisted in Firestore per user.

---

## 🎨 Features

| Feature | Status |
|---|---|
| Firebase Email/Password Auth | ✅ |
| Firestore chat history | ✅ |
| Firestore user settings | ✅ |
| Dark / Light mode | ✅ |
| EN / TR / AR i18n | ✅ |
| File upload UI (audio + image) | ✅ |
| OneDrive URL storage in Firestore | ✅ |
| Audio player | ✅ |
| Spectrogram viewer | ✅ |
| Mock AI response | ✅ |
| Real AI backend | 🔧 Replace `api.ts` |
| Real OneDrive upload | 🔧 Replace `uploadFile()` |
