import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

function loadCredential(): { projectId: string; clientEmail: string; privateKey: string } {
  const sa = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (sa) {
    const parsed = JSON.parse(sa);
    return {
      projectId: parsed.project_id,
      clientEmail: parsed.client_email,
      privateKey: parsed.private_key,
    };
  }
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (projectId && clientEmail && privateKey) {
    return {
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, "\n"),
    };
  }
  throw new Error(
    "Firebase Admin credentials missing. Set FIREBASE_SERVICE_ACCOUNT (or FIREBASE_PROJECT_ID/CLIENT_EMAIL/PRIVATE_KEY) in .env.local, or GOOGLE_APPLICATION_CREDENTIALS to a service-account json path."
  );
}

function getApp() {
  if (getApps().length) return getApps()[0];
  const cred = loadCredential();
  return initializeApp({
    credential: cert({
      projectId: cred.projectId,
      clientEmail: cred.clientEmail,
      privateKey: cred.privateKey,
    }),
  });
}

let _db: Firestore | null = null;

/** Lazy singleton so importing this module never throws before credentials exist. */
function realDb(): Firestore {
  if (!_db) _db = getFirestore(getApp());
  return _db;
}

// Proxy defers all access until the first real DB call.
export const db = new Proxy({} as Firestore, {
  get(_t, prop, receiver) {
    if (prop === "then") return undefined; // keep async-safe
    const r = realDb() as unknown as Record<string | symbol, unknown>;
    const val = r[prop];
    if (typeof val === "function") return (val as (...a: unknown[]) => unknown).bind(realDb());
    return val;
  },
});
