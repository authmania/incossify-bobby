"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  adminLoginAction, adminLogoutAction, adminSaveConfigAction,
  adminActivateUserAction, adminWithdrawalAction,
} from "@/lib/admin-actions";

type ConfigDraft = {
  bankName: string; accountName: string; accountNumber: string;
  paymentLink1: string; paymentLink2: string;
  usePaymentLink: boolean;
  telegramLink: string; whatsappLink: string; socialLink: "tg" | "wa";
};
type UserRow = {
  uid: string; fullName: string; username: string; email: string; pkg: string;
  packageName: string; activated: boolean; total: number; phone: string;
  paymentReference: string; joined: string | null;
};
type WdRow = {
  id: string; uid: string; amount: number; bankName: string; accountName: string;
  accountNumber: string; status: string; date: string | null;
};

function toast(msg: string) {
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = msg;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add("show"));
  setTimeout(() => { el.classList.remove("show"); setTimeout(() => el.remove(), 320); }, 2400);
}
const fmtN = (n: number) => "₦" + Number(n || 0).toLocaleString();
const dateTxt = (iso: string | null) => (iso ? new Date(iso).toLocaleString() : "—");
const Ico = ({ d }: { d: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);

// ── Admin password card (route: /admin/login) ──
export function AdminPasswordCard() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const router = useRouter();
  return (
    <div style={{ position: "relative", minHeight: "100vh", background: "var(--background)", display: "grid", placeItems: "center", padding: "1.25rem" }}>
      <div style={{ position: "absolute", inset: 0, background: "var(--gradient-hero)", opacity: 0.45, zIndex: 0 }}></div>
      <form className="card glass-strong shadow-elegant" style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 420, padding: "2.5rem 2rem", textAlign: "center" }}
        onSubmit={async (e) => {
          e.preventDefault();
          setPending(true); setError(null);
          const r = await adminLoginAction(null, new FormData(e.currentTarget));
          setPending(false);
          if (r.error) return setError(r.error);
          router.push("/admin");
          router.refresh();
        }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-CUooZ1Ch.png" alt="Incossify" style={{ width: 64, height: 64, objectFit: "contain", borderRadius: 18, margin: "0 auto 1.25rem", display: "block" }} />
        <h2 style={{ fontSize: "1.6rem", fontWeight: 800 }}>Admin <span style={{ color: "var(--primary)" }}>Access</span></h2>
        <p style={{ fontSize: "0.875rem", color: "var(--foreground)", opacity: 0.6, marginTop: "0.25rem", marginBottom: "1.5rem" }}>Enter the admin password to continue</p>
        <input type="password" name="password" className="field" placeholder="Password" autoComplete="current-password" />
        {error && <div style={{ fontSize: "0.84rem", color: "oklch(75% 0.15 25)", margin: "0.6rem 0", minHeight: "1.2em" }}>{error}</div>}
        <button className="btn btn-aqua btn-block" style={{ padding: "0.9rem" }} disabled={pending}>{pending ? "Signing in…" : "Enter Dashboard"}</button>
      </form>
    </div>
  );
}

// ── Config editor ──
function ConfigCard({ config }: { config: ConfigDraft }) {
  const [f, setF] = useState<ConfigDraft>(config);
  const [status, setStatus] = useState<string>("");
  const dirty = JSON.stringify(f) !== JSON.stringify(config);
  const up = <K extends keyof ConfigDraft>(k: K, v: ConfigDraft[K]) => { setF((p) => ({ ...p, [k]: v })); setStatus(""); };

  const save = async () => {
    const r = await adminSaveConfigAction(f);
    if (r.error) { setStatus("❌ " + r.error); return; }
    setStatus("✅ Config saved!");
    toast("✅ Config saved!");
  };
  const label = (t: string) => <span className="current-label">{t}</span>;
  const current = (v: string) => <div className="current-value">{v || "Not set"}</div>;

  return (
    <>
      <div className="admin-card glass-strong">
        <div className="hd"><div className="ic"><Ico d="M3 9 12 2l9 7v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></div><h2>Payment Account Details</h2></div>
        <div style={{ display: "grid", gap: "0.875rem" }}>
          <label className="block"><span className="field-label">Bank Name</span><input className="field" value={f.bankName} onChange={(e) => up("bankName", e.target.value)} placeholder="e.g. Opay" /></label>
          <label className="block"><span className="field-label">Account Name</span><input className="field" value={f.accountName} onChange={(e) => up("accountName", e.target.value)} placeholder="e.g. INCOSSIFY LTD" /></label>
          <label className="block"><span className="field-label">Account Number</span><input className="field" value={f.accountNumber} onChange={(e) => up("accountNumber", e.target.value.replace(/\D/g, "").slice(0, 11))} placeholder="e.g. 0123456789" /></label>
        </div>
      </div>

      <div className="admin-card glass-strong">
        <div className="hd"><div className="ic"><Ico d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /></div><h2>Payment Link Settings</h2></div>
        <div className="toggle-row">
          <div className="toggle-label">Enable Payment Links <small>(Use payment links instead of bank transfer)</small></div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: "auto" }}>
            <span className={`toggle-status ${f.usePaymentLink ? "active" : "inactive"}`}>{f.usePaymentLink ? "ON" : "OFF"}</span>
            <label className="toggle-switch"><input type="checkbox" checked={f.usePaymentLink} onChange={(e) => up("usePaymentLink", e.target.checked)} /><span className="toggle-slider"></span></label>
          </div>
        </div>
        <div style={{ height: 1, background: "var(--border)", margin: "1rem 0" }}></div>
        <label className="block">
          {label("StarterKit Payment Link (₦9,500)")}
          {current(f.paymentLink1)}
          <input type="url" className="field" style={{ marginTop: "0.5rem" }} value={f.paymentLink1} onChange={(e) => up("paymentLink1", e.target.value)} placeholder="https://pay.example/incossifykit" />
        </label>
        <div style={{ height: 1, background: "var(--border)", margin: "1rem 0" }}></div>
        <label className="block">
          {label("Apex Payment Link (₦15,000)")}
          {current(f.paymentLink2)}
          <input type="url" className="field" style={{ marginTop: "0.5rem" }} value={f.paymentLink2} onChange={(e) => up("paymentLink2", e.target.value)} placeholder="https://pay.example/incossifyape" />
        </label>
      </div>

      <div className="admin-card glass-strong">
        <div className="hd"><div className="ic"><Ico d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /></div><h2>Social Settings</h2></div>
        <span className="field-label" style={{ display: "block", marginBottom: "0.75rem" }}>Use Social</span>
        <div className="social-pick">
          <button type="button" className={`social-opt ${f.socialLink === "tg" ? "active" : ""}`} onClick={() => { up("socialLink", "tg"); }}>Telegram</button>
          <button type="button" className={`social-opt ${f.socialLink === "wa" ? "active" : ""}`} onClick={() => { up("socialLink", "wa"); }}>WhatsApp</button>
        </div>
      </div>

      <div className="admin-card glass-strong">
        <div className="hd"><div className="ic"><Ico d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /></div><h2>Telegram Redirect Link</h2></div>
        {label("Current link")}
        {current(f.telegramLink)}
        <input type="url" className="field" style={{ marginTop: "0.5rem" }} value={f.telegramLink} onChange={(e) => up("telegramLink", e.target.value)} placeholder="https://t.me/your_channel_or_group" />
      </div>

      <div className="admin-card glass-strong">
        <div className="hd"><div className="ic"><Ico d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059" /></div><h2>WhatsApp Redirect Link</h2></div>
        {label("Current link")}
        {current(f.whatsappLink)}
        <input type="url" className="field" style={{ marginTop: "0.5rem" }} value={f.whatsappLink} onChange={(e) => up("whatsappLink", e.target.value)} placeholder="https://wa.me/2348012345678" />
      </div>

      <button className="btn btn-aqua btn-block" style={{ padding: "0.9rem" }} disabled={!dirty} onClick={save}>Save Changes</button>
      <div className="link-status" style={{ textAlign: "center" }}>{status}</div>
    </>
  );
}

// ── Main dashboard ──
export function AdminDashboard({ config, users, withdrawals }: { config: ConfigDraft; users: UserRow[]; withdrawals: WdRow[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<"activations" | "users" | "withdrawals" | "config">("activations");
  const pending = users.filter((u) => u.pkg !== "free" && !u.activated);
  const pendingWd = withdrawals.filter((w) => w.status === "Pending");
  const run = async (fn: () => Promise<{ error?: string }>) => {
    const r = await fn();
    if (r.error) toast("❌ " + r.error);
    else router.refresh();
  };

  const tabs: { id: typeof tab; label: string; badge?: number }[] = [
    { id: "activations", label: "Activations", badge: pending.length },
    { id: "users", label: `All users (${users.length})` },
    { id: "withdrawals", label: "Withdrawals", badge: pendingWd.length },
    { id: "config", label: "Config" },
  ];

  const pill = (ok: boolean) => (ok ? "badge-pill ok" : "badge-pill bad");

  return (
    <div className="admin-shell">
      <div className="grad"></div>
      <div className="inner">
        <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem" }}>
          <div className="brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-CUooZ1Ch.png" alt="Incossify" />
            <span style={{ fontWeight: 800, fontSize: "1.1rem" }}>Incossify <span style={{ color: "var(--primary)" }}>Admin</span></span>
          </div>
          <button className="signout" style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8rem", fontWeight: 600, color: "var(--foreground)", opacity: 0.7, border: "1px solid var(--border)", borderRadius: 999, padding: "0.55rem 1.4rem", background: "rgb(255 255 255 / 0.04)", cursor: "pointer", fontFamily: "inherit" }}
            onClick={async () => { await adminLogoutAction(); router.push("/admin/login"); }}>
            Logout
          </button>
        </header>

        <div className="admin-tabs">
          {tabs.map((t) => (
            <button key={t.id} className={tab === t.id ? "active" : ""} onClick={() => setTab(t.id)}>
              {t.label}{t.badge ? ` (${t.badge})` : ""}
            </button>
          ))}
        </div>

        {tab === "config" && <ConfigCard config={config} />}

        {(tab === "activations" || tab === "users") && (
          <div className="admin-card glass-strong">
            <div className="hd">
              <div className="ic"><Ico d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /></div>
              <h2>{tab === "activations" ? "Pending activations" : "All users"}</h2>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--foreground)", opacity: 0.6, marginBottom: "1rem" }}>Confirm a user&apos;s payment and activate to credit their 100% welcome bonus.</p>
            <div className="adm-scroll">
              <table className="adm-tbl">
                <thead><tr><th>User</th><th>Package</th><th>Balance</th><th>Ref</th><th>Joined</th><th></th></tr></thead>
                <tbody>
                  {(tab === "activations" ? pending : users).map((u) => (
                    <tr key={u.uid}>
                      <td><b>{u.fullName}</b><br /><span style={{ fontSize: "0.75rem", opacity: 0.6 }}>@{u.username} · {u.email}</span></td>
                      <td><span className="badge-pill dim">{u.packageName}</span></td>
                      <td>{fmtN(u.total)}</td>
                      <td style={{ fontSize: "0.78rem" }}>{u.paymentReference}</td>
                      <td style={{ fontSize: "0.78rem" }}>{dateTxt(u.joined)}</td>
                      <td>
                        {u.activated ? (
                          <span className="badge-pill ok">Active</span>
                        ) : u.pkg !== "free" ? (
                          <button className="btn btn-aqua btn-sm" onClick={() => run(() => adminActivateUserAction(u.uid))}>Activate</button>
                        ) : (
                          <span className="badge-pill dim">Free</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "withdrawals" && (
          <div className="admin-card glass-strong">
            <div className="hd"><div className="ic"><Ico d="M3 9 12 2l9 7v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></div><h2>Withdrawal requests</h2></div>
            <p style={{ fontSize: "0.85rem", color: "var(--foreground)", opacity: 0.6, marginBottom: "1rem" }}>Approve requests you&apos;ve paid out; reject to refund the user&apos;s balance.</p>
            <div className="adm-scroll">
              <table className="adm-tbl">
                <thead><tr><th>Amount</th><th>Bank details</th><th>Status</th><th>Date</th><th></th></tr></thead>
                <tbody>
                  {withdrawals.map((w) => (
                    <tr key={w.id}>
                      <td><b>{fmtN(w.amount)}</b><br /><span style={{ fontSize: "0.75rem", opacity: 0.6 }}>{w.id}</span></td>
                      <td>{w.bankName}<br /><span style={{ fontSize: "0.78rem", opacity: 0.6 }}>{w.accountName} · {w.accountNumber}</span></td>
                      <td><span className={`badge-pill ${w.status === "Pending" ? "warn" : w.status === "Rejected" ? "bad" : "ok"}`}>{w.status}</span></td>
                      <td style={{ fontSize: "0.78rem" }}>{dateTxt(w.date)}</td>
                      <td>
                        {w.status === "Pending" && (
                          <div style={{ display: "flex", gap: 6 }}>
                            <button className="btn btn-aqua btn-sm" onClick={() => run(() => adminWithdrawalAction(w.id, "approve"))}>Mark paid</button>
                            <button className="btn btn-sm" style={{ border: "1px solid color-mix(in oklab, oklch(65% 0.22 25) 60%, transparent)", color: "oklch(80% 0.16 25)" }} onClick={() => run(() => adminWithdrawalAction(w.id, "reject"))}>Reject</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
