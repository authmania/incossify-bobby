// Server-only admin helpers.
import { cookies } from "next/headers";
import { db } from "./firebase";
import {
  collection, getDocs, query, orderBy, limit, doc, getDoc, setDoc, deleteDoc,
} from "firebase/firestore";
import type { User, Withdrawal } from "./types";
import { toDate } from "./auth";

export const ADMIN_COOKIE = "incossify_admin";

export function adminPasswordHash(): string {
  return process.env.ADMIN_PASSWORD_HASH || "";
}

export async function adminAuthed(): Promise<boolean> {
  try {
    const store = await cookies();
    const token = store.get(ADMIN_COOKIE)?.value;
    if (!token) return false;
    const snap = await getDoc(doc(db, "admin_sessions", token));
    if (!snap.exists()) return false;
    const d = snap.data();
    if (d.expiresAt && toDate(d.expiresAt).getTime() < Date.now()) {
      await deleteDoc(snap.ref);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function createAdminSession(token: string): Promise<void> {
  await setDoc(doc(db, "admin_sessions", token), {
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 12),
  });
}

export async function destroyAdminSession(token: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "admin_sessions", token));
  } catch {
    /* noop */
  }
}

export async function listUsers(limitN = 300): Promise<User[]> {
  const snap = await getDocs(query(collection(db, "users"), orderBy("joinedAt", "desc"), limit(limitN)));
  const out: User[] = [];
  snap.forEach((d) => {
    const raw = d.data();
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
      activatedAt: raw.activatedAt ? toDate(raw.activatedAt) : null,
      paymentReference: raw.paymentReference || "",
      referralCode: raw.referralCode || "",
      referredBy: raw.referredBy || null,
      wallets: raw.wallets || {},
      referrals: raw.referrals || 0,
      bank: raw.bank || { bankName: "", accountName: "", accountNumber: "" },
      joinedAt: toDate(raw.joinedAt),
      ledger: raw.ledger || {},
    });
  });
  return out;
}

export async function listWithdrawals(limitN = 200): Promise<Withdrawal[]> {
  const snap = await getDocs(query(collection(db, "withdrawals"), orderBy("date", "desc"), limit(limitN)));
  const out: Withdrawal[] = [];
  snap.forEach((d) => {
    const r = d.data();
    out.push({
      id: r.id || d.id,
      uid: r.uid || "",
      amount: r.amount || 0,
      bankName: r.bankName || "",
      accountName: r.accountName || "",
      accountNumber: r.accountNumber || "",
      status: r.status || "Pending",
      date: toDate(r.date),
      note: r.note || "",
    });
  });
  return out;
}

/** Links the mobile app (incossify-app) reads from apps/incossify. */
export async function loadAppLinks(): Promise<{ cta: string; telegramLink: string; telegramGroupLink: string }> {
  try {
    const snap = await getDoc(doc(db, "apps", "incossify"));
    const d = snap.exists() ? snap.data() : {};
    return {
      cta: typeof d.cta === "string" ? d.cta : "",
      telegramLink: typeof d.telegramLink === "string" ? d.telegramLink : "",
      telegramGroupLink: typeof d.telegramGroupLink === "string" ? d.telegramGroupLink : "",
    };
  } catch {
    return { cta: "", telegramLink: "", telegramGroupLink: "" };
  }
}
