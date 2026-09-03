// Shared domain types

export type PackageId = "free" | "starterkit" | "apex";

export interface Package {
  id: Exclude<PackageId, "free">;
  name: string;
  price: number; // naira
  bonus: number; // 100% welcome bonus credited on activation
  daily: string; // marketing line
  tagline: string;
  features: string[];
  popular?: boolean;
}

export interface User {
  uid: string;
  fullName: string;
  username: string;
  email: string;
  country: string;
  phone: string;
  passwordHash: string;
  pkg: PackageId;
  packageName: string;
  activatedAt: Date | string | null;
  intendedPkg?: string | null;
  paymentReference: string;
  referralCode: string;
  referredBy: string | null;
  wallets: {
    total: number;
    shares: number;
    rewards: number;
    task: number;
    sales: number;
    referralEarnings: number;
  };
  referrals: number;
  bank: { bankName: string; accountName: string; accountNumber: string };
  joinedAt: Date | string;
  ledger: Record<string, Record<string, string>>;
}

export type PublicUser = Omit<User, "passwordHash">;

export interface Withdrawal {
  id: string;
  uid: string;
  amount: number;
  bankName: string;
  accountName: string;
  accountNumber: string;
  status: "Pending" | "Approved" | "Paid" | "Rejected";
  date: Date | string;
  note?: string;
}

export interface SiteConfig {
  bankName: string;
  accountName: string;
  accountNumber: string;
  paymentLink1: string; // starterkit
  paymentLink2: string; // apex
  usePaymentLink: boolean;
  telegramLink: string;
  whatsappLink: string;
  socialLink: "tg" | "wa";
  supportTelegram: string;
}

export type TaskState = "available" | "claimed" | "completed";
