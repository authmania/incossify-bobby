"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { db } from "./firebase";
import {
  collection, doc, setDoc, updateDoc, getDocs, query, where, limit, runTransaction,
} from "firebase/firestore";
import {
  getUserByUid, getUserByEmailOrUsername, hashPassword, verifyPassword,
  createSession, destroySession, clearSessionCookie, setSessionCookie,
  genId,
} from "./auth";
import { loadConfig, MIN_WITHDRAWAL, PACKAGES } from "./config";
import { creditWithLedger, todayKey, TASK_CATALOG, SHARE_CLAIMS, SONG_REWARD, musicSongIds } from "./data";
import type { User, Withdrawal } from "./types";

// ─────────────────────────── Auth ───────────────────────────

export async function registerAction(_prev: unknown, formData: FormData): Promise<{ error?: string }> {
  const fullName = String(formData.get("fullName") || "").trim();
  const username = String(formData.get("username") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const country = String(formData.get("country") || "");
  const phone = String(formData.get("phone") || "").trim();
  const password = String(formData.get("password") || "");
  const chosenPkg = String(formData.get("package") || "").trim();
  const referral = String(formData.get("referral") || "").trim() || null;

  if (!fullName || !username || !email || !country || !phone || !password)
    return { error: "All fields are required." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email address." };
  if (username.length < 3) return { error: "Username must be at least 3 characters." };
  if (password.length < 4) return { error: "Password must be at least 4 characters." };
  if (phone.replace(/\D/g, "").length < 10) return { error: "Enter a valid phone number." };

  const existing = await getDocs(query(collection(db, "users"), where("email", "==", email), limit(1)));
  if (!existing.empty) return { error: "An account with this email already exists." };
  const uname = await getDocs(query(collection(db, "users"), where("usernameLower", "==", username.toLowerCase()), limit(1)));
  if (!uname.empty) return { error: "This username is already taken." };

  const uid = doc(collection(db, "users")).id;
  const user: User = {
    uid,
    fullName,
    username,
    email,
    country,
    phone,
    passwordHash: await hashPassword(password),
    pkg: "free",
    packageName: "Free",
    activatedAt: null,
    intendedPkg: chosenPkg === "starterkit" || chosenPkg === "apex" ? chosenPkg : null,
    paymentReference: genId("INCOS"),
    referralCode: username.toUpperCase(),
    referredBy: referral,
    wallets: { total: 0, shares: 0, rewards: 0, task: 0, sales: 0, referralEarnings: 0 },
    referrals: 0,
    bank: { bankName: "", accountName: "", accountNumber: "" },
    joinedAt: new Date(),
    ledger: {},
  };
  await setDoc(doc(db, "users", uid), { ...user, usernameLower: username.toLowerCase() });

  const token = await createSession(uid);
  await setSessionCookie(token);
  redirect("/dashboard");
}

export async function loginAction(_prev: unknown, formData: FormData): Promise<{ error?: string }> {
  const identifier = String(formData.get("identifier") || "").trim();
  const password = String(formData.get("password") || "");
  if (!identifier || !password) return { error: "Enter your email/username and password." };

  const user = await getUserByEmailOrUsername(identifier);
  if (!user) return { error: "No account found with that email or username." };
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return { error: "Incorrect password. Try again." };

  const token = await createSession(user.uid);
  await setSessionCookie(token);
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  const store = await cookies();
  const t = store.get("incossify_session")?.value;
  if (t) await destroySession(t);
  await clearSessionCookie();
  redirect("/login");
}

// ─────────────────────────── Profile ───────────────────────────

export async function saveBankAction(userUid: string, formData: FormData): Promise<{ error?: string; ok?: boolean }> {
  const bankName = String(formData.get("bankName") || "").trim();
  const accountName = String(formData.get("accountName") || "").trim();
  const accountNumber = String(formData.get("accountNumber") || "").replace(/\D/g, "").slice(0, 11);
  if (!bankName || !accountName || accountNumber.length < 10)
    return { error: "Fill in all bank details (account number: 10–11 digits)." };
  await updateDoc(doc(db, "users", userUid), { bank: { bankName, accountName, accountNumber } });
  return { ok: true };
}

// ─────────────────────────── Activation ───────────────────────────

export async function choosePackageAction(userUid: string, pkgId: string): Promise<{ error?: string; url?: string }> {
  const pkg = PACKAGES[pkgId as "starterkit" | "apex"];
  if (!pkg) return { error: "Unknown package." };

  await updateDoc(doc(db, "users", userUid), { pkg: pkg.id, packageName: pkg.name });

  const config = await loadConfig();
  if (config.usePaymentLink) {
    const link = pkgId === "apex" ? config.paymentLink2 : config.paymentLink1;
    if (link) return { url: link };
  }
  return { url: "/payment" };
}

/** Marks that a user reported paying (proof sent via social) — admin activates. */
export async function reportPaidAction(userUid: string): Promise<{ error?: string }> {
  await setDoc(doc(db, "users", userUid), { paymentReportedAt: new Date() }, { merge: true });
  return {};
}

// ─────────────────────────── Earning actions ───────────────────────────

export async function claimShareAction(uid: string, itemId: string): Promise<{ error?: string }> {
  const def = SHARE_CLAIMS.find((s) => s.id === itemId);
  if (!def) return { error: "Unknown share." };
  await creditWithLedger(uid, "shares", def.reward, todayKey(), itemId, "completed", "available");
  return {};
}

export async function claimSongAction(uid: string): Promise<{ error?: string; reward?: number }> {
  const day = todayKey();
  const songs = musicSongIds(day);
  const user = await getUserByUid(uid);
  if (!user) return { error: "Account not found." };
  const done = songs.filter((s) => (user.ledger?.[day]?.[s.id] || "available") === "completed").length;
  if (done >= songs.length) return { error: "All songs done for today." };
  const next = songs[done];
  await creditWithLedger(uid, "rewards", SONG_REWARD, day, next.id, "completed", "available");
  return { reward: SONG_REWARD };
}

export async function claimTaskAction(uid: string, taskId: string): Promise<{ error?: string }> {
  const def = TASK_CATALOG.find((t) => t.id === taskId);
  if (!def) return { error: "Unknown task." };
  await creditWithLedger(uid, "task", 0, todayKey(), taskId, "claimed", "available");
  return {};
}

export async function completeTaskAction(uid: string, taskId: string): Promise<{ error?: string }> {
  const def = TASK_CATALOG.find((t) => t.id === taskId);
  if (!def) return { error: "Unknown task." };
  await creditWithLedger(uid, "task", def.reward, todayKey(), taskId, "completed", "claimed");
  return {};
}

// ─────────────────────────── Withdrawals ───────────────────────────

export async function requestWithdrawalAction(uid: string, formData: FormData): Promise<{ error?: string }> {
  const amount = Number(formData.get("amount"));
  const bankName = String(formData.get("bankName") || "").trim();
  const accountName = String(formData.get("accountName") || "").trim();
  const accountNumber = String(formData.get("accountNumber") || "").trim();

  const user = await getUserByUid(uid);
  if (!user) return { error: "Account not found." };
  if (!user.activatedAt) return { error: "Your account is not activated yet." };
  if (!isFinite(amount) || amount < MIN_WITHDRAWAL)
    return { error: `Minimum withdrawal is ₦${MIN_WITHDRAWAL.toLocaleString()}.` };
  const total = Number(user.wallets.total) || 0;
  if (amount > total) return { error: "Amount exceeds your available balance." };

  const w: Withdrawal = {
    id: genId("INCW"),
    uid,
    amount,
    bankName: bankName || user.bank.bankName,
    accountName: accountName || user.bank.accountName,
    accountNumber: accountNumber || user.bank.accountNumber,
    status: "Pending",
    date: new Date(),
  };

  await runTransaction(db, async (tx) => {
    const ref = doc(db, "users", uid);
    const snap = await tx.get(ref);
    if (!snap.exists()) return;
    const wallets = snap.data()!.wallets || {};
    const cur = Number(wallets.total) || 0;
    if (cur < amount) throw new Error("Insufficient balance.");
    tx.update(ref, { "wallets.total": cur - amount });
    tx.set(doc(db, "withdrawals", w.id), { ...w, date: new Date() });
  });

  redirect("/withdraw/receipt");
}
