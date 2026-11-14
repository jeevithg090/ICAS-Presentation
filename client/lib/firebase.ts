import { initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// Firebase web configuration comes from Vite env vars (see .env.example).
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

/** True when enough Firebase config is present to talk to Firestore. */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId,
);

// Only initialise Firebase when it is configured, so the rest of the site
// still renders in local/demo setups without a Firebase project.
const app: FirebaseApp | null = isFirebaseConfigured
  ? initializeApp(firebaseConfig)
  : null;

if (!app && import.meta.env.DEV) {
  console.warn(
    "Firebase is not configured (VITE_FIREBASE_* env vars missing); Firestore-backed features are disabled.",
  );
}

// Consumers must handle rejected promises when Firebase is not configured:
// Firestore helpers throw when given a null instance.
export const db = (app ? getFirestore(app) : null) as Firestore;
export const storage = (app ? getStorage(app) : null) as FirebaseStorage;

export default app;
