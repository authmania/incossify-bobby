"use client";

import { useState } from "react";
import { IncApp, SignOut, toast } from "./inc-app";
import { saveBankAction } from "@/lib/actions";

export function ProfileClient({
  uid, fullName, username, email, referralCode, bank,
}: {
  uid: string;
  fullName: string;
  username: string;
  email: string;
  referralCode: string;
  bank: { bankName: string; accountName: string; accountNumber: string };
}) {
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [pending, setPending] = useState(false);

  const save = async () => {
    setPending(true);
    setStatus(null);
    const form = document.getElementById("bankForm") as HTMLFormElement | null;
    if (!form) return setPending(false);
    const fd = new FormData(form);
    const r = await saveBankAction(uid, fd);
    setPending(false);
    if (r.error) setStatus({ ok: false, msg: r.error });
    else { setStatus({ ok: true, msg: "✓ Account details saved!" }); toast("Account details saved!"); }
  };

  const copy = () => {
    navigator.clipboard.writeText(referralCode).then(() => toast("Referral code copied!"));
  };

  const rowIc = (n: number) => (
    <div style={{ height: "2.5rem", width: "2.5rem", borderRadius: "1rem", background: "color-mix(in oklab, var(--primary) 15%, transparent)", display: "grid", placeItems: "center", color: "var(--primary)" }}>
      {n === 0 ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ height: "1rem", width: "1rem" }}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
      ) : n === 1 ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ height: "1rem", width: "1rem" }}><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ height: "1rem", width: "1rem" }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path></svg>
      )}
    </div>
  );

  const row = (n: number, label: string, value: string, action?: React.ReactNode) => (
    <div style={{ borderTop: n > 0 ? "1px solid rgb(255 255 255 / 0.1)" : undefined, display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem 1.25rem" }}>
      {rowIc(n)}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: "0.625rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--foreground)", opacity: 0.55 }}>{label}</p>
        <p style={{ fontSize: "0.875rem", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{value}</p>
      </div>
      {action}
    </div>
  );

  return (
    <IncApp title="Profile" active="profile">
      <div className="card glass-strong shadow-elegant" style={{ marginTop: "1.5rem", padding: "1.5rem", textAlign: "center" }}>
        <div style={{ margin: "0 auto", height: "5rem", width: "5rem", borderRadius: "999px", background: "var(--gradient-aqua)", padding: "3px", boxShadow: "var(--shadow-aqua)" }}>
          <div style={{ height: "100%", width: "100%", borderRadius: "999px", background: "var(--background)", display: "grid", placeItems: "center", fontSize: "1.5rem", fontWeight: 800, color: "var(--primary)" }}>
            {(fullName || "?").charAt(0).toUpperCase()}
          </div>
        </div>
        <p style={{ marginTop: "1rem", fontSize: "1.125rem", fontWeight: 800 }}>{fullName || "—"}</p>
        <p style={{ fontSize: "0.75rem", color: "var(--foreground)", opacity: 0.6 }}>@{username || "—"}</p>
      </div>

      <div className="card glass-strong shadow-elegant" style={{ marginTop: "1rem", padding: 0, overflow: "hidden" }}>
        {row(0, "Username", username || "—")}
        {row(1, "Email", email || "—")}
        {row(2, "Referral code", referralCode || "—",
          <button className="btn btn-sm" onClick={copy} style={{ background: "none", border: "1px solid color-mix(in oklab, var(--primary) 50%, transparent)", color: "var(--primary)", fontSize: "0.75rem", fontWeight: 700, padding: "0.375rem 0.75rem", borderRadius: "999px" }}>Copy</button>)}
      </div>

      <div className="card glass-strong shadow-elegant" style={{ marginTop: "1rem", padding: "1.5rem" }}>
        <div className="sec-head"><h2>Account Details</h2></div>
        <p style={{ fontSize: "0.75rem", color: "var(--foreground)", opacity: 0.6, marginBottom: "1rem" }}>Add your bank details so withdrawals go straight to your account.</p>
        <form id="bankForm" style={{ display: "grid", gap: "0.875rem" }} onSubmit={(e) => e.preventDefault()}>
          <label className="block"><span className="field-label">Bank Name</span><input type="text" name="bankName" className="field" defaultValue={bank.bankName} placeholder="e.g. Opay / Access / GTB..." /></label>
          <label className="block"><span className="field-label">Account Name</span><input type="text" name="accountName" className="field" defaultValue={bank.accountName} placeholder="Full name on the account" /></label>
          <label className="block"><span className="field-label">Account Number</span>
            <input type="text" name="accountNumber" className="field" inputMode="numeric" pattern="\d{10,11}" defaultValue={bank.accountNumber} placeholder="10-digit account number"
              onInput={(e) => { const t = e.currentTarget; t.value = t.value.replace(/\D/g, ""); }} />
          </label>
          <button type="button" className="btn btn-aqua btn-block" style={{ padding: "0.9rem" }} disabled={pending} onClick={save}>
            {pending ? "Saving…" : "Save Account Details"}
          </button>
        </form>
        <div className="link-status" style={{ fontSize: "0.8rem", marginTop: "0.5rem", minHeight: "1.2em", color: status ? (status.ok ? "oklch(85% 0.13 160)" : "oklch(75% 0.15 25)") : undefined }}>{status?.msg || ""}</div>
      </div>

      <div style={{ marginTop: "1.5rem" }}><SignOut /></div>
    </IncApp>
  );
}
