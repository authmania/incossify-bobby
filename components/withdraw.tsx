"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AppShell } from "./app-shell";
import { requestWithdrawalAction } from "@/lib/actions";

export function WithdrawClient({
  uid, total, active, min, bankSaved, bank,
}: {
  uid: string;
  total: number;
  active: boolean;
  min: number;
  bankSaved: boolean;
  bank: { bankName: string; accountName: string; accountNumber: string };
}) {
  const [state, formAction, pending] = useActionState(
    (_s: { error?: string }, fd: FormData) => requestWithdrawalAction(uid, fd),
    {}
  );
  const fmt = (n: number) => "₦" + Number(n).toLocaleString("en-NG");

  return (
    <AppShell title="Withdraw" navActive="withdraw">
      <div className="stat-card card">
        <div className="small muted">Available balance</div>
        <div className="big-amount">{fmt(total)}</div>
        <div className="divider" />
        <div className="kv"><span className="k">Status</span>
          <span className={`badge ${active ? "green" : "red"}`}>{active ? "Unlocked" : "Locked"}</span>
        </div>
        <div className="kv"><span className="k">Minimum withdrawal</span><span className="v">{fmt(min)}</span></div>
        <div className="kv"><span className="k">Bank details</span>
          {bankSaved ? <span className="badge green">Saved</span> : <Link href="/profile" className="badge gold">Add in Profile</Link>}
        </div>
        <div className="wbar" style={{ marginTop: 6 }}>
          <i style={{ width: `${Math.min(100, Math.round((total / min) * 100))}%`, height: "100%", background: "linear-gradient(90deg,#34d399,#22d3ee)" }} />
        </div>
      </div>

      {!active && (
        <div className="card glass" style={{ margin: "0 18px" }}>
          <b>Activate to withdraw</b>
          <p className="small muted" style={{ margin: "8px 0 14px" }}>Activate your account to unlock withdrawals.</p>
          <Link href="/payment" className="btn btn-primary btn-block btn-sm">Activate account</Link>
        </div>
      )}

      {active && (
        <div className="card" style={{ margin: "0 18px" }}>
          <h2 className="card-title" style={{ marginBottom: 4 }}>Request payout</h2>
          {!bankSaved && <p className="small muted" style={{ marginBottom: 12 }}>Add your bank details in Profile before withdrawing.</p>}
          <form action={formAction}>
            <label className="field-label">Amount</label>
            <input name="amount" type="number" className="input" min={min} max={total} placeholder={`Minimum ${fmt(min)}`} required />
            <label className="field-label">Bank name</label>
            <input name="bankName" className="input" defaultValue={bank.bankName} required />
            <label className="field-label">Account name</label>
            <input name="accountName" className="input" defaultValue={bank.accountName} required />
            <label className="field-label">Account number</label>
            <input name="accountNumber" className="input" inputMode="numeric" pattern="[0-9]{10,11}" defaultValue={bank.accountNumber} required />
            {state.error && <div className="error-box">{state.error}</div>}
            <button className="btn btn-primary btn-block" style={{ marginTop: 20 }} disabled={pending}>
              {pending ? "Processing…" : "Withdraw now"}
            </button>
          </form>
        </div>
      )}
    </AppShell>
  );
}
