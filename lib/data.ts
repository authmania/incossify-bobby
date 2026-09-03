import { db } from "./firebase";
import { doc, getDoc, runTransaction } from "firebase/firestore";
import { getUserByUid } from "./auth";
import type { User } from "./types";
import { TASK_CATALOG, SHARE_CLAIMS, SONG_REWARD, musicSongIds } from "./catalog";

// Re-exports so server code has a single home
export { TASK_CATALOG, SHARE_CLAIMS, SONG_REWARD, musicSongIds };

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

// ── Ledger helpers ──
type Ledger = Record<string, Record<string, string>>;

export function taskState(ledger: Ledger | undefined, day: string, id: string): string {
  return ledger?.[day]?.[id] || "available";
}

// ── Wallet ops (single transaction each) ──

interface LedgerWallets {
  total: number;
  shares: number;
  rewards: number;
  task: number;
  sales: number;
  referralEarnings: number;
}

const ZERO: LedgerWallets = { total: 0, shares: 0, rewards: 0, task: 0, sales: 0, referralEarnings: 0 };

export function zeroWallets(): LedgerWallets {
  return { ...ZERO };
}

/** Credit a wallet + total and write a ledger state, all atomically. */
export async function creditWithLedger(
  uid: string,
  wallet: keyof Omit<LedgerWallets, "total">,
  amount: number,
  day: string,
  itemId: string,
  newState: string,
  expectState: string | null
): Promise<User> {
  const ref = doc(db, "users", uid);
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error("Account not found.");
    const data = snap.data()!;
    const wallets: LedgerWallets = { ...ZERO, ...(data.wallets || {}) };
    const ledger: Ledger = data.ledger || {};
    const cur = ledger[day]?.[itemId] || "available";
    if (expectState && cur !== expectState) {
      if (cur === "completed") throw new Error("Already done today. Come back tomorrow.");
      throw new Error("This task is not available right now.");
    }
    if (amount > 0) {
      wallets[wallet] = Number(wallets[wallet] || 0) + amount;
      wallets.total = Number(wallets.total || 0) + amount;
    }
    ledger[day] = { ...(ledger[day] || {}), [itemId]: newState };
    trimLedger(ledger);
    tx.update(ref, { wallets, ledger });
    return { ...data, wallets, ledger } as User;
  });
}

/** Raw read of a user's ledger day for server components. */
export async function getLedger(uid: string): Promise<Ledger> {
  const u = await getUserByUid(uid);
  return u?.ledger || {};
}

/** Keep only ~35 days of history so user docs don't grow unbounded. */
function trimLedger(ledger: Ledger) {
  const days = Object.keys(ledger).sort();
  if (days.length <= 35) return;
  for (const d of days.slice(0, days.length - 35)) delete ledger[d];
}
