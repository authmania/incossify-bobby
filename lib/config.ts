import type { Package, PackageId, SiteConfig } from "./types";
import { db } from "./firebase-admin";

export const SITE_NAME = "Incossify";
export const CONFIG_DOC_PATH = "account/incossifybobby";
export const MIN_WITHDRAWAL = 15000;
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://incossifyweb.online";

export const PACKAGES: Record<"starterkit" | "apex", Package> = {
  starterkit: {
    id: "starterkit",
    name: "StarterKit Package",
    price: 9500,
    bonus: 9500,
    daily: "7,900 / £3.45 daily",
    tagline: "Perfect for new earners starting today",
    features: [
      "100% welcome commission — ₦9,500 / £4.75",
      "Inn-shares: 8,000 / £4.00",
      "Inn-Reshares: 200 / £0.10",
      "Daily tasks up to 7,900 / £3.45",
      "Raffle, grant & sports rewards",
    ],
  },
  apex: {
    id: "apex",
    name: "Apex Package",
    price: 15000,
    bonus: 15000,
    daily: "16,000 / £6.50 daily",
    tagline: "Highest daily payouts and full access",
    popular: true,
    features: [
      "100% registration commission — ₦15,000 / £7.50",
      "Inn-shares: 13,500 / £6.50",
      "Inn-Reshares: 400 / £0.20",
      "Daily tasks up to 16,000 / £6.50",
      "Over 1.2M in extra rewards",
    ],
  },
};

export function packageOf(id: string): Package | null {
  if (id === "starterkit") return PACKAGES.starterkit;
  if (id === "apex") return PACKAGES.apex;
  return null;
}

export function packageNameOf(id: string): string {
  if (id === "starterkit") return "StarterKit Package";
  if (id === "apex") return "Apex Package";
  return "Free";
}

const CONFIG_DEFAULTS: SiteConfig = {
  bankName: "",
  accountName: "",
  accountNumber: "",
  paymentLink1: "",
  paymentLink2: "",
  usePaymentLink: false,
  telegramLink: "https://t.me/bobbysupport",
  whatsappLink: "https://wa.me/2340000000000",
  socialLink: "tg",
  supportTelegram: "https://t.me/bobbysupport",
};

/** Merge the live Firestore config over the defaults. Never throws. */
export async function loadConfig(): Promise<SiteConfig> {
  try {
    const snap = await db.doc(CONFIG_DOC_PATH).get();
    const d = (snap.exists ? snap.data()! : {}) as Record<string, unknown>;
    const merged: SiteConfig = { ...CONFIG_DEFAULTS };
    const KEYS: (keyof SiteConfig)[] = [
      "bankName",
      "accountName",
      "accountNumber",
      "paymentLink1",
      "paymentLink2",
      "usePaymentLink",
      "telegramLink",
      "whatsappLink",
      "socialLink",
      "supportTelegram",
    ];
    for (const k of KEYS) {
      const v = d[k];
      if (v !== undefined) (merged as unknown as Record<string, unknown>)[k] = v;
    }
    return merged;
  } catch (e) {
    console.error("loadConfig failed", e);
    return CONFIG_DEFAULTS;
  }
}

/** Server-only write used by the admin panel. */
export async function saveConfig(patch: Partial<SiteConfig>) {
  await db.doc(CONFIG_DOC_PATH).set(patch, { merge: true });
}

// Money / display helpers (NGN is the single source of truth)
export function fmt(n: number): string {
  return "₦" + Number(n || 0).toLocaleString("en-NG");
}

export const LIVE_GBP_RATE = 1846.279333;

export async function gbpRate(): Promise<number> {
  try {
    const r = await fetch("https://open.er-api.com/v6/latest/GBP");
    const j = await r.json();
    if (j?.rates?.NGN) return j.rates.NGN;
  } catch {
    /* keep default */
  }
  return LIVE_GBP_RATE;
}

export function fmtMoney(naira: number, currency: "NGN" | "GBP", rate: number): string {
  if (currency === "GBP") {
    return "£" + (naira / rate).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return fmt(naira);
}
