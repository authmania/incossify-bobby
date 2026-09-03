// Server-side Firestore client that reuses the same web SDK + project
// credentials as the existing Incossify/Nextel apps ("what princess uses").
// No service account required — the Firestore rules for this project already
// permit these operations (the legacy apps wrote directly from the browser).
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

export const FIREBASE_CONFIG = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyDrnmtx0LkfMKytzTKQZwXCg1JKZXiJmtU",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "glamour-28049.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "glamour-28049",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "glamour-28049.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "22177815395",
  appId: process.env.FIREBASE_APP_ID || "1:22177815395:web:2ca7caa2b1626299675156",
};

export const app = initializeApp(FIREBASE_CONFIG);
export const db = getFirestore(app, "(default)");
