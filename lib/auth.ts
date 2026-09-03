// Server-only auth. Never import this from a client component.
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { db } from "./firebase-admin";
import type { DocumentData } from "firebase-admin/firestore";
import type { PublicUser, User } from "./types";

export const SESSION_COOKIE = "incossify_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
const DAY = 1000 * 60 * 60 * 24;

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
  const emailQ = await db.collection("users").where("email", "==", id).limit(1).get();
  if (!emailQ.empty) return toUser(emailQ.docs[0]);
  const unameQ = await db.collection("users").where("usernameLower", "==", id).limit(1).get();
  if (!unameQ.empty) return toUser(unameQ.docs[0]);
  return null;
}

export async function getUserByUid(uid: string): Promise<User | null> {
  const snap = await db.doc(`users/${uid}`).get();
  if (!snap.exists) return null;
  return toUser(snap);
}

export async function getUserByPaymentReference(ref: string): Promise<User | null> {
  const q = await db.collection("users").where("paymentReference", "==", ref).limit(1).get();
  if (q.empty) return null;
  return toUser(q.docs[0]);
}

function toUser(snap: { exists: boolean; id?: string; data: () => DocumentData | undefined }): User | null {
  if (!snap.exists) return null;
  const d = snap.data()!;
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
    paymentReference: d.paymentReference || "",
    referralCode: d.referralCode || "",
    referredBy: d.referredBy || null,
    intendedPkg: d.intendedPkg || null,
    wallets: d.wallets || {},
    referrals: d.referrals || 0,
    bank: d.bank || { bankName: "", accountName: "", accountNumber: "" },
    joinedAt: toDate(d.joinedAt || Date.now()),
    ledger: d.ledger || {},
  };
}

function toDate(v: unknown): Date {
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
  await db.doc(`sessions/${token}`).set({
    uid,
    createdAt: new Date(now),
    expiresAt: new Date(now + SESSION_TTL_MS),
  });
  return token;
}

export async function destroySession(token: string): Promise<void> {
  try {
    await db.doc(`sessions/${token}`).delete();
  } catch {
    /* already gone */
  }
}

export async function destroyAllSessionsForUser(uid: string): Promise<void> {
  const q = await db.collection("sessions").where("uid", "==", uid).get();
  await Promise.all(q.docs.map((d) => d.ref.delete()));
}

async function getSessionUserRaw(token?: string): Promise<User | null> {
  if (!token) return null;
  try {
    const snap = await db.doc(`sessions/${token}`).get();
    if (!snap.exists) return null;
    const s = snap.data()!;
    if (!s.uid) return null;
    if (s.expiresAt && toDate(s.expiresAt).getTime() < Date.now()) {
      await snap.ref.delete();
      return null;
    }
    return await getUserByUid(s.uid);
  } catch {
    return null;
  }
}

/** Read the session cookie (async in Next 15). */
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

export const DAY_MS = DAY;

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
