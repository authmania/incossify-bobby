"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AppShell, LogoutButton } from "./app-shell";
import { saveBankAction } from "@/lib/actions";

export function ProfileClient({
  uid, fullName, username, email, referralCode, referralUrl, bank, active, pkg,
}: {
  uid: string;
  fullName: string;
  username: string;
  email: string;
  referralCode: string;
  referralUrl: string;
  bank: { bankName: string; accountName: string; accountNumber: string };
  active: boolean;
  pkg: string;
}) {
  const [state, formAction, pending] = useActionState(
    (_s: { error?: string }, fd: FormData) => saveBankAction(uid, fd),
    {}
  );

  const initials = fullName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  const copy = (t: string, msg: string) => {
    navigator.clipboard.writeText(t).then(() => {
      const el = document.createElement("div");
      el.className = "toast"; el.textContent = msg;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 2200);
    }).catch(() => {});
  };

  return (
    <AppShell title="My profile" navActive="profile">
      <div style={{ margin: "10px 18px", display: "flex", alignItems: "center", gap: 14 }}>
        <div className="avatar" style={{ width: 60, height: 60, fontSize: 20 }}>{initials}</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: "1.1rem" }}>{fullName}</div>
          <div className="small muted">@{username}</div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <span className={`badge ${active ? "green" : "red"}`}>{active ? pkg : "Free"}</span>
        </div>
      </div>

      <div className="card" style={{ margin: "12px 18px" }}>
        <h2 className="card-title" style={{ marginBottom: 10 }}>Account details</h2>
        <div className="kv"><span className="k">Email</span><span className="v">{email}</span></div>
        <div className="kv"><span className="k">Username</span><span className="v">@{username}</span></div>
        <div className="kv"><span className="k">Referral code</span>
          <span className="v" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            {referralCode}
            <button className="btn btn-ghost btn-sm" onClick={() => copy(referralCode, "Referral code copied!")}>Copy</button>
          </span>
        </div>
        {!active && (
          <Link href="/payment" className="btn btn-primary btn-block" style={{ marginTop: 12 }}>Activate your account</Link>
        )}
      </div>

      <div className="card" style={{ margin: "12px 18px" }}>
        <h2 className="card-title" style={{ marginBottom: 4 }}>Payout details</h2>
        <p className="small muted" style={{ marginBottom: 4 }}>We send your withdrawals to this account.</p>
        <form action={formAction}>
          <label className="field-label">Bank name</label>
          <input name="bankName" className="input" defaultValue={bank.bankName} placeholder="e.g. Kuda" required />
          <label className="field-label">Account name</label>
          <input name="accountName" className="input" defaultValue={bank.accountName} placeholder="Full name" required />
          <label className="field-label">Account number</label>
          <input name="accountNumber" className="input" inputMode="numeric" defaultValue={bank.accountNumber} pattern="[0-9]{10,11}" placeholder="10–11 digits" required />
          {state.error && <div className="error-box">{state.error}</div>}
          {!state.error && state && <div />}
          <button className="btn btn-primary btn-block" style={{ marginTop: 18 }} disabled={pending}>
            {pending ? "Saving…" : "Save bank details"}
          </button>
        </form>
      </div>

      <div className="card glass" style={{ margin: "12px 18px", display: "flex", gap: 10 }}>
        <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => copy(referralUrl, "Referral link copied!")}>Share referral</button>
        <div style={{ flex: 1 }}><LogoutButton label="Sign out" /></div>
      </div>
    </AppShell>
  );
}
