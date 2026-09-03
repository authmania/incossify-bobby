"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IncApp } from "./inc-app";
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
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [modal, setModal] = useState<"limit" | "activate" | "account" | null>(null);

  const fmt = (n: number) => "₦" + Number(n || 0).toLocaleString();
  const unlocked = total >= min;
  const pct = Math.min((total / min) * 100, 100);

  const onWithdrawNow = () => {
    if (!unlocked) return setModal("limit");
    if (!bankSaved) return setModal("account");
    if (!active) return setModal("activate");
    setFormOpen(true);
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      await requestWithdrawalAction(uid, new FormData(e.currentTarget));
      // success redirects server-side
    } catch {
      /* redirect in progress */
    }
    setPending(false);
  };

  return (
    <IncApp title="Withdraw" sub="Move funds" active="withdraw">
      {/* Status card */}
      <div className="withdraw-card" style={{ marginTop: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: "0.625rem", textTransform: "uppercase", letterSpacing: "0.18em", opacity: 0.8, fontWeight: 600 }}>Withdrawable Balance</p>
            <p style={{ marginTop: "0.25rem", fontSize: "1.75rem", fontWeight: 800 }}>{fmt(total)}</p>
          </div>
          <span className={`wd-status ${unlocked ? "unlocked" : ""}`}>{unlocked ? "Unlocked" : "Locked"}</span>
        </div>
        <div style={{ marginTop: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", opacity: 0.9 }}>
            <span>Minimum withdrawal</span>
            <strong>{fmt(min)}</strong>
          </div>
          <div className="wd-bar"><div style={{ width: `${pct.toFixed(1)}%` }}></div></div>
          <p style={{ marginTop: "0.5rem", fontSize: "0.75rem", opacity: 0.85 }}>
            {unlocked ? "You can withdraw now 🎉" : `Need ${fmt(min - total)} more to unlock`}
          </p>
        </div>
      </div>

      {!formOpen && (
        <button type="button" className={`btn btn-aqua btn-block ${!unlocked ? "blurred" : ""}`} style={{ marginTop: "1rem", padding: "1rem" }} onClick={onWithdrawNow}>
          Withdraw Now
        </button>
      )}

      {/* Bank form */}
      {formOpen && (
        <form className="card glass-strong shadow-elegant" style={{ marginTop: "1rem", padding: "1.5rem", display: "grid", gap: "1rem" }} onSubmit={submit}>
          {error && <div className="field-error" style={{ display: "block" }}>{error}</div>}

          <label className="block">
            <span className="field-label">Amount (₦)</span>
            <input required type="number" min={min} name="amount" className="field" placeholder={String(min)} />
            <span style={{ display: "block", marginTop: "0.375rem", fontSize: "0.75rem", color: "var(--foreground)", opacity: 0.6 }}>You can withdraw up to <b>{fmt(total)}</b></span>
          </label>

          <label className="block">
            <span className="field-label">Bank Name</span>
            <div style={{ position: "relative" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", height: "1rem", width: "1rem", color: "var(--foreground)", opacity: 0.6 }}><path d="M3 9 12 2l9 7v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><path d="M9 22V12h6v10"></path></svg>
              <input required type="text" name="bankName" className="field pl-10" defaultValue={bank.bankName} placeholder="Opay / Access / GTB..." />
            </div>
          </label>

          <label className="block">
            <span className="field-label">Account Name</span>
            <input required type="text" name="accountName" className="field" defaultValue={bank.accountName} placeholder="Full name on the account" />
          </label>

          <label className="block">
            <span className="field-label">Account Number</span>
            <input required type="text" name="accountNumber" className="field" inputMode="numeric" pattern="\d{10,11}" defaultValue={bank.accountNumber} placeholder="10-digit account number"
              onInput={(e) => { const t = e.currentTarget; t.value = t.value.replace(/\D/g, ""); }} />
          </label>

          <button type="submit" className="btn btn-aqua btn-block" style={{ padding: "1rem" }} disabled={pending}>
            {pending ? "Processing withdrawal…" : "Confirm Withdrawal"}
          </button>
        </form>
      )}

      {/* Modals */}
      {modal === "limit" && (
        <div id="withdrawGate" className="active">
          <div className="gate-box">
            <div className="gate-ic">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ height: "1.5rem", width: "1.5rem" }}><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"></path><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"></path></svg>
            </div>
            <h3>Withdrawal Unavailable</h3>
            <p>You can only withdraw when your balance reaches a minimum of <b>{fmt(min)}</b>. Your current balance is <b>{fmt(total)}</b>. Keep earning!</p>
            <button type="button" onClick={() => setModal(null)}>Got it</button>
          </div>
        </div>
      )}

      {modal === "activate" && (
        <div id="activateGate" className="active">
          <div className="gate-box">
            <div className="gate-ic">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ height: "1.5rem", width: "1.5rem" }}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path></svg>
            </div>
            <h3>Activate your account</h3>
            <p>Please activate your account in order to withdraw and keep earning.</p>
            <button type="button" onClick={() => router.push("/payment")}>Activate Now</button>
            <button type="button" style={{ marginTop: "0.5rem", background: "rgb(255 255 255 / 0.08)", border: "1px solid var(--border)", color: "var(--foreground)" }} onClick={() => setModal(null)}>Go Back</button>
          </div>
        </div>
      )}

      {modal === "account" && (
        <div id="accountGate" className="active">
          <div className="gate-box">
            <div className="gate-ic">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ height: "1.5rem", width: "1.5rem" }}><path d="M3 9 12 2l9 7v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><path d="M9 22V12h6v10"></path></svg>
            </div>
            <h3>Add your account details</h3>
            <p>Please add your bank account details in your <b>Profile</b> before making a withdrawal.</p>
            <button type="button" onClick={() => router.push("/profile")}>Go to Profile</button>
            <button type="button" style={{ marginTop: "0.5rem", background: "rgb(255 255 255 / 0.08)", border: "1px solid var(--border)", color: "var(--foreground)" }} onClick={() => setModal(null)}>Go Back</button>
          </div>
        </div>
      )}
    </IncApp>
  );
}
