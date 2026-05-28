import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  browserLocalPersistence,
  setPersistence,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseEnabled = !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

let _auth: ReturnType<typeof getAuth> | null = null;
let _db: ReturnType<typeof getFirestore> | null = null;

if (firebaseEnabled) {
  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  _auth = getAuth(app);
  _db = getFirestore(app);
  // Keep the user logged in across browser sessions
  setPersistence(_auth, browserLocalPersistence).catch(() => {});
}

export const auth = _auth;
export const db = _db;

// ── Auth helpers ────────────────────────────────────────────
export const signUp = async (email: string, password: string) => {
  if (!_auth) throw new Error('Firebase not configured');
  return createUserWithEmailAndPassword(_auth, email, password);
};

export const signIn = async (email: string, password: string) => {
  if (!_auth) throw new Error('Firebase not configured');
  return signInWithEmailAndPassword(_auth, email, password);
};

export const logout = async () => {
  if (!_auth) return;
  return signOut(_auth);
};

export const onAuthChange = (cb: (user: User | null) => void) => {
  if (!_auth) { cb(null); return () => {}; }
  return onAuthStateChanged(_auth, cb);
};

// ── Firestore data sync ─────────────────────────────────────
const ALL_KEYS = [
  'prayer_notifications',
  'dhikr_counts',
  'daily_checks',
  'quran_juz',
  'streak',
  'last_open',
];

export const uploadDataToCloud = async (userId: string) => {
  if (!_db) return;
  const snapshot: Record<string, any> = {};
  const allKeys = await AsyncStorage.getAllKeys();
  for (const key of allKeys) {
    const val = await AsyncStorage.getItem(key);
    if (val !== null) snapshot[key] = val;
  }
  await setDoc(doc(_db, 'users', userId), { snapshot, updatedAt: Date.now() }, { merge: true });
};

export const downloadDataFromCloud = async (userId: string) => {
  if (!_db) return;
  const snap = await getDoc(doc(_db, 'users', userId));
  if (!snap.exists()) return;
  const { snapshot } = snap.data() as { snapshot: Record<string, string> };
  if (!snapshot) return;
  for (const [key, val] of Object.entries(snapshot)) {
    await AsyncStorage.setItem(key, val);
  }
};
