/**
 * Firebase Configuration & Initialization
 * S.M. Khalilur Rahman Properties Ltd. Construction ERP
 */
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import appletConfig from '../../firebase-applet-config.json';

export interface FirebaseCustomConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  firestoreDatabaseId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
}

const STORAGE_KEY = 'skrp_firebase_custom_config';

export const DEFAULT_FIREBASE_CONFIG: FirebaseCustomConfig = {
  apiKey: 'AIzaSyBVEedQywZuYuyX20Qt1XnefeUW46zqUU0',
  authDomain: 'tokyosquareconventionerp.firebaseapp.com',
  projectId: 'tokyosquareconventionerp',
  storageBucket: 'tokyosquareconventionerp.firebasestorage.app',
  messagingSenderId: '79137558366',
  appId: '1:79137558366:web:5a3060b8a60cfd34c709cf',
  measurementId: 'G-P8C3YLJV5J'
};

export const getStoredFirebaseConfig = (): FirebaseCustomConfig | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error parsing stored firebase config:', e);
  }
  return null;
};

export const saveStoredFirebaseConfig = (config: FirebaseCustomConfig) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    window.location.reload(); // Reload to reinitialize Firebase instances cleanly
  } catch (e) {
    console.error('Error saving firebase config:', e);
  }
};

export const clearStoredFirebaseConfig = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  } catch (e) {
    console.error('Error clearing firebase config:', e);
  }
};

const storedConfig = getStoredFirebaseConfig();

// Configuration prioritized: 1. LocalStorage Custom Config -> 2. Vite Environment Variables -> 3. Default Applet Project
export const firebaseConfig: FirebaseCustomConfig = {
  apiKey: storedConfig?.apiKey || import.meta.env.VITE_FIREBASE_API_KEY || DEFAULT_FIREBASE_CONFIG.apiKey,
  authDomain: storedConfig?.authDomain || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || DEFAULT_FIREBASE_CONFIG.authDomain,
  projectId: storedConfig?.projectId || import.meta.env.VITE_FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_CONFIG.projectId,
  firestoreDatabaseId: storedConfig?.firestoreDatabaseId || import.meta.env.VITE_FIREBASE_DATABASE_ID || DEFAULT_FIREBASE_CONFIG.firestoreDatabaseId,
  storageBucket: storedConfig?.storageBucket || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || DEFAULT_FIREBASE_CONFIG.storageBucket,
  messagingSenderId: storedConfig?.messagingSenderId || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
  appId: storedConfig?.appId || import.meta.env.VITE_FIREBASE_APP_ID || DEFAULT_FIREBASE_CONFIG.appId,
  measurementId: storedConfig?.measurementId || import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || DEFAULT_FIREBASE_CONFIG.measurementId,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.projectId &&
  !firebaseConfig.apiKey.includes('FakeKey')
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

try {
  if (isFirebaseConfigured) {
    app = getApps().length > 0 ? getApp() : initializeApp({
      apiKey: firebaseConfig.apiKey,
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket,
      messagingSenderId: firebaseConfig.messagingSenderId,
      appId: firebaseConfig.appId,
      measurementId: firebaseConfig.measurementId,
    });
    auth = getAuth(app);
    db = (firebaseConfig.firestoreDatabaseId && firebaseConfig.projectId !== 'tokyosquareconventionerp')
      ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
      : getFirestore(app);
  } else {
    // Non-blocking fallback for offline/demo environment
    const dummyConfig = {
      apiKey: "AIzaSyFakeKeyForPreviewValidation-SKRP",
      authDomain: "skrp-construction-erp.firebaseapp.com",
      projectId: "skrp-construction-erp",
      storageBucket: "skrp-construction-erp.appspot.com",
      messagingSenderId: "123456789012",
      appId: "1:123456789012:web:abcdef1234567890",
    };
    app = getApps().length > 0 ? getApp() : initializeApp(dummyConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  }
} catch (error) {
  console.warn('Firebase initialization notice:', error);
}

export { app, auth, db };
export default firebaseConfig;

