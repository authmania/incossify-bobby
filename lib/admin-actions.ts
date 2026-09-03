"use server";

import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { db } from "./firebase";
import { doc, updateDoc, deleteDoc, setDoc, getDoc } from "firebase/firestore";
import { saveConfig } from "./config";
import { getUserByUid } from "./auth";
import {
  adminPasswordHash, createAdminSession, destroyAdminSession, ADMIN_COOKIE,
} from "./admin";
import type { SiteConfig } from "./types";

export async function adminLoginAction(_prev: unknown, formData: FormData): Promise<{ error?: string }> {
  const pw = String(formData.get("password") || "");
  const hash = adminPasswordHash();
  if (!hash) return { error: "Admin is not configured. Set ADMIN_PASSWORD_HASH." };
  const ok = await bcrypt.compare(pw, hash).catch(() => false);
  if (!ok) return { error: "Incorrect password." };
  const token = randomBytes(32).toString("hex");
  await createAdminSession(token);
  const store = await cookies();
  store.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return {};
}

export async function adminLogoutAction(): Promise<void> {
  const store = await cookies();
  const t = store.get(ADMIN_COOKIE)?.value;
  if (t) await destroyAdminSession(t);
  store.delete(ADMIN_COOKIE);
}

export async function adminSaveConfigAction(patch: Partial<SiteConfig>): Promise<{ error?: string }> {
  const allowed = new Set([
    "bankName", "accountName", "accountNumber",
    "paymentLink1", "paymentLink2", "usePaymentLink",
    "telegramLink", "whatsappLink", "socialLink", "supportTelegram",
  ]);
  const clean: Partial<SiteConfig> = {};
  for (const [k, v] of Object.entries(patch)) {
    if (allowed.has(k)) (clean as Record<string, unknown>)[k] = v;
  }
  await saveConfig(clean);
  return {};
}

export async function adminActivateUserAction(uid: string): Promise<{ error?: string }> {
  const user = await getUserByUid(uid);
  if (!user) return { error: "User not found." };
  if (user.pkg === "free") return { error: "User has not selected a package." };
  const bonus = user.pkg === "apex" ? 15000 : user.pkg === "starterkit" ? 9500 : 0;
  const already = !!user.activatedAt;
  const update: Record<string, unknown> = {
    activatedAt: already ? user.activatedAt : new Date(),
    "wallets.total": (Number(user.wallets.total) || 0) + (already ? 0 : bonus),
  };
  if (!already) update.paymentReportedAt = new Date();
  await updateDoc(doc(db, "users", uid), update);
  return {};
}

export async function adminWithdrawalAction(id: string, action: "approve" | "reject"): Promise<{ error?: string }> {
  const ref = doc(db, "withdrawals", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return { error: "Not found." };
  const d = snap.data();

  if (action === "reject") {
    const userRef = doc(db, "users", d.uid);
    const userSnap = await getDoc(userRef);
    const curTotal = userSnap.exists() ? Number(userSnap.data()?.wallets?.total || 0) : 0;
    await updateDoc(userRef, { "wallets.total": curTotal + Number(d.amount || 0) });
    await updateDoc(ref, { status: "Rejected", note: "Rejected by admin" });
    return {};
  }

  await updateDoc(ref, { status: "Approved", note: "Paid out by admin" });
  return {};
}
