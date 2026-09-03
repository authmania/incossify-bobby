// Server-only auth helpers (firebase web SDK used on the server).
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { db } from "./firebase";
import {
  collection, doc, getDoc, setDoc, deleteDoc, query, where, limit, getDocs,
} from "firebase/firestore";
import type { PublicUser, User } from "./types";

export const SESSION_COOKIE = "incossify_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;

export async function hashPassword(pw: string): Promise<string> {
  return bcrypt.hash(pw, 12);
}
export async function verifyPassword(pw: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(pw, hash);
  } catch {
    return false;
  }
}

export function toPublic(u: User): PublicUser {
  const { passwordHash: _ph, ...pub } = u;
  return pub;
}

export async function getUserByEmailOrUsername(identifier: string): Promise<User | null> {
  const id = String(identifier || "").trim().toLowerCase();
  if (!id) return null;
  const emailQ = await getDocs(query(collection(db, "users"), where("email", "==", id), limit(1)));
  if (!emailQ.empty) return toUser(emailQ.docs[0]);
  const unameQ = await getDocs(query(collection(db, "users"), where("usernameLower", "==", id), limit(1)));
  if (!unameQ.empty) return toUser(unameQ.docs[0]);
  return null;
}

export async function getUserByUid(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return toUser(snap);
}

export async function getUserByPaymentReference(ref: string): Promise<User | null> {
  const q = await getDocs(query(collection(db, "users"), where("paymentReference", "==", ref), limit(1)));
  if (q.empty) return null;
  return toUser(q.docs[0]);
}

function toUser(snap: { exists(): boolean; id: string; data(): any }): User | null {
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    uid: d.uid || snap.id,
    fullName: d.fullName || "",
    username: d.username || "",
    email: d.email || "",
    country: d.country || "",
    phone: d.phone || "",
    passwordHash: d.passwordHash || "",
    pkg: d.pkg || "free",
    packageName: d.packageName || "Free",
    activatedAt: d.activatedAt ? toDate(d.activatedAt) : null,
    intendedPkg: d.intendedPkg || null,
    paymentReference: d.paymentReference || "",
    referralCode: d.referralCode || "",
    referredBy: d.referredBy || null,
    wallets: d.wallets || {},
    referrals: d.referrals || 0,
    bank: d.bank || { bankName: "", accountName: "", accountNumber: "" },
    joinedAt: toDate(d.joinedAt || Date.now()),
    ledger: d.ledger || {},
  };
}

export function toDate(v: unknown): Date {
  const o = v as { toDate?: () => Date } | Date | string | number;
  if (o && typeof (o as { toDate?: () => Date }).toDate === "function") return (o as { toDate: () => Date }).toDate();
  if (o instanceof Date) return o;
  if (typeof o === "string" || typeof o === "number") return new Date(o);
  return new Date();
}

// ── Sessions ──
export async function createSession(uid: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const now = Date.now();
  await setDoc(doc(db, "sessions", token), {
    uid,
    createdAt: new Date(now),
    expiresAt: new Date(now + SESSION_TTL_MS),
  });
  return token;
}

export async function destroySession(token: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "sessions", token));
  } catch {
    /* already gone */
  }
}

export async function destroyAllSessionsForUser(uid: string): Promise<void> {
  const q = await getDocs(query(collection(db, "sessions"), where("uid", "==", uid)));
  await Promise.all(q.docs.map((d) => deleteDoc(d.ref)));
}

async function getSessionUserRaw(token?: string): Promise<User | null> {
  if (!token) return null;
  try {
    const snap = await getDoc(doc(db, "sessions", token));
    if (!snap.exists()) return null;
    const s = snap.data();
    if (!s.uid) return null;
    if (s.expiresAt && toDate(s.expiresAt).getTime() < Date.now()) {
      await deleteDoc(snap.ref);
      return null;
    }
    return await getUserByUid(s.uid);
  } catch {
    return null;
  }
}

async function readCookie(): Promise<string | undefined> {
  try {
    const store = await cookies();
    return store.get(SESSION_COOKIE)?.value;
  } catch {
    return undefined;
  }
}

/** Returns the signed-in user or null. Safe to call from Server Components / actions. */
export async function getSessionUser(): Promise<User | null> {
  const token = await readCookie();
  return getSessionUserRaw(token);
}

export async function sessionToken(): Promise<string | undefined> {
  return readCookie();
}

export async function isActive(u: User | null): Promise<boolean> {
  return !!u && !!u.activatedAt;
}

// ── Cookie helpers (callable from Server Actions / Route Handlers) ──
export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export function genId(prefix: string): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${ts}${rand}`;
}
