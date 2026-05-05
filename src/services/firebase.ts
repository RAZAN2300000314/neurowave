// ============================================================
// FIREBASE CONFIGURATION — reads from .env file
// ============================================================

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import type { Chat, Message, UserSettings, FileUrls } from '../types';

// ──────────────────────────────────────────────────────────────
// 🔧 Firebase config — values come from your .env file
// ──────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// ─── AUTH ────────────────────────────────────

export const loginWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const registerWithEmail = async (
  email: string,
  password: string,
  displayName: string
) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });
  await setDoc(doc(db, 'settings', cred.user.uid), {
    theme: 'dark',
    language: 'en',
    userId: cred.user.uid,
  });
  return cred;
};

export const logout = () => signOut(auth);

export const onAuthChange = (callback: (user: User | null) => void) =>
  onAuthStateChanged(auth, callback);

// ─── USER SETTINGS ───────────────────────────

export const getUserSettings = async (userId: string): Promise<UserSettings | null> => {
  const snap = await getDoc(doc(db, 'settings', userId));
  return snap.exists() ? (snap.data() as UserSettings) : null;
};

export const saveUserSettings = async (userId: string, settings: Partial<UserSettings>) => {
  await setDoc(doc(db, 'settings', userId), { ...settings, userId }, { merge: true });
};

// ─── CHATS ───────────────────────────────────

export const createChat = async (userId: string, firstMessage: string): Promise<string> => {
  const ref = await addDoc(collection(db, 'chats'), {
    title: firstMessage.slice(0, 50) || 'New Chat',
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    previewText: firstMessage.slice(0, 100),
    messages: [],
  });
  return ref.id;
};

export const getUserChats = async (userId: string): Promise<Chat[]> => {
  const q = query(
    collection(db, 'chats'),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      createdAt: (data.createdAt as Timestamp)?.toMillis?.() ?? Date.now(),
      updatedAt: (data.updatedAt as Timestamp)?.toMillis?.() ?? Date.now(),
    } as Chat;
  });
};

export const getChatById = async (chatId: string): Promise<Chat | null> => {
  const snap = await getDoc(doc(db, 'chats', chatId));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    id: snap.id,
    ...data,
    createdAt: (data.createdAt as Timestamp)?.toMillis?.() ?? Date.now(),
    updatedAt: (data.updatedAt as Timestamp)?.toMillis?.() ?? Date.now(),
  } as Chat;
};

export const addMessageToChat = async (
  chatId: string,
  messages: Message[]
): Promise<void> => {
  await updateDoc(doc(db, 'chats', chatId), {
    messages,
    updatedAt: serverTimestamp(),
    previewText: messages[messages.length - 1]?.content?.slice(0, 100) ?? '',
  });
};

export const deleteChat = async (chatId: string): Promise<void> => {
  await deleteDoc(doc(db, 'chats', chatId));
};

// ─── FILE URLS (OneDrive references) ─────────

export const saveFileUrls = async (
  chatId: string,
  messageId: string,
  urls: FileUrls
): Promise<void> => {
  await setDoc(
    doc(db, 'fileUrls', `${chatId}_${messageId}`),
    { chatId, messageId, ...urls },
    { merge: true }
  );
};

export const getFileUrls = async (
  chatId: string,
  messageId: string
): Promise<FileUrls | null> => {
  const snap = await getDoc(doc(db, 'fileUrls', `${chatId}_${messageId}`));
  return snap.exists() ? (snap.data() as FileUrls) : null;
};

