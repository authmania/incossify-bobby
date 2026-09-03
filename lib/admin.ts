// Server-only admin helpers.
import { cookies } from "next/headers";
import { db } from "./firebase-admin";
import type { User, Withdrawal } from "./types";
import type { DocumentData } from "firebase-admin/firestore";

export const ADMIN_COOKIE = "incossify_admin";

export function adminPasswordHash(): string {
  return process.env.ADMIN_PASSWORD_HASH || "";
}

export async function adminAuthed(): Promise<boolean> {
  try {
    const store = await cookies();
    const token = store.get(ADMIN_COOKIE)?.value;
    if (!token) return false;
    const snap = await db.doc(`admin_sessions/${token}`).get();
    if (!snap.exists) return false;
    const d = snap.data()!;
    if (d.expiresAt && toMs(d.expiresAt) < Date.now()) {
      await snap.ref.delete();
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function createAdminSession(token: string): Promise<void> {
  await db.doc(`admin_sessions/${token}`).set({
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 12),
  });
}

export async function destroyAdminSession(token: string): Promise<void> {
  try {
    await db.doc(`admin_sessions/${token}`).delete();
  } catch {
    /* noop */
  }
}

function toMs(v: unknown): number {
  const o = v as { toMillis?: () => number } | Date | string | number;
  if (o && typeof (o as { toMillis?: () => number }).toMillis === "function") return (o as { toMillis: () => number }).toMillis();
  if (o instanceof Date) return o.getTime();
  if (typeof o === "number") return o;
  return new Date(o as Date | string).getTime();
}

export async function listUsers(limitN = 300): Promise<User[]> {
  const snap = await db.collection("users").orderBy("joinedAt", "desc").limit(limitN).get();
  const out: User[] = [];
  snap.forEach((d) => {
    const raw = d.data()!;
    out.push({
      uid: raw.uid || d.id,
      fullName: raw.fullName || "",
      username: raw.username || "",
      email: raw.email || "",
      country: raw.country || "",
      phone: raw.phone || "",
      passwordHash: "",
      pkg: raw.pkg || "free",
      packageName: raw.packageName || "Free",
      activatedAt: raw.activatedAt ? new Date(toMs(raw.activatedAt)) : null,
      paymentReference: raw.paymentReference || "",
      referralCode: raw.referralCode || "",
      referredBy: raw.referredBy || null,
      wallets: raw.wallets || {},
      referrals: raw.referrals || 0,
      bank: raw.bank || { bankName: "", accountName: "", accountNumber: "" },
      joinedAt: new Date(toMs(raw.joinedAt)),
      ledger: raw.ledger || {},
    });
  });
  return out;
}

export async function listWithdrawals(limitN = 200): Promise<Withdrawal[]> {
  const snap = await db.collection("withdrawals").orderBy("date", "desc").limit(limitN).get();
  const out: Withdrawal[] = [];
  snap.forEach((d) => {
    const r = d.data()!;
    out.push({
      id: r.id || d.id,
      uid: r.uid || "",
      amount: r.amount || 0,
      bankName: r.bankName || "",
      accountName: r.accountName || "",
      accountNumber: r.accountNumber || "",
      status: r.status || "Pending",
      date: new Date(toMs(r.date)),
      note: r.note || "",
    });
  });
  return out;
}
