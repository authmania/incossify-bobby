"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminLoginAction, adminLogoutAction, adminSaveConfigAction, adminActivateUserAction, adminWithdrawalAction } from "@/lib/admin-actions";

type ConfigDraft = {
  bankName: string;
  accountName: string;
  accountNumber: string;
  paymentLink1: string;
  paymentLink2: string;
  usePaymentLink: boolean;
  telegramLink: string;
  whatsappLink: string;
  socialLink: "tg" | "wa";
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

// ── Admin login form ──
export function AdminLoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  return (
    <form onSubmit={async (e) => {
      e.preventDefault();
      setPending(true);
      setError(null);
      const fd = new FormData(e.currentTarget);
      const r = await adminLoginAction(null, fd);
      setPending(false);
      if (r.error) return setError(r.error);
      router.push("/admin");
      router.refresh();
    }}>
      <label className="field-label">Password</label>
      <input name="password" type="password" className="input" placeholder="••••••••" autoComplete="current-password" required />
      {error && <div className="error-box">{error}</div>}
      <button className="btn btn-primary btn-block" style={{ marginTop: 22 }} disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

// ── Config editor ──
function ConfigEditor({ config }: { config: ConfigDraft }) {
  const [f, setF] = useState<ConfigDraft>(config);
  const [saved, setSaved] = useState(false);
  const up = <K extends keyof ConfigDraft>(k: K, v: ConfigDraft[K]) => { setF((p) => ({ ...p, [k]: v })); setSaved(false); };
  const save = async () => {
    const r = await adminSaveConfigAction(f);
    if (r.error) alert(r.error);
    else setSaved(true);
  };
  return (
    <div className="admin-card card">
      <h2 className="admin-title" style={{ fontSize: "1.1rem" }}>Config (account/incossifybobby)</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="app-form">
        <div><label className="field-label">Bank name</label><input className="input" value={f.bankName} onChange={(e) => up("bankName", e.target.value)} /></div>
        <div><label className="field-label">Account number</label><input className="input" value={f.accountNumber} onChange={(e) => up("accountNumber", e.target.value)} /></div>
        <div style={{ gridColumn: "1 / -1" }}><label className="field-label">Account name</label><input className="input" value={f.accountName} onChange={(e) => up("accountName", e.target.value)} /></div>
        <div><label className="field-label">StarterKit payment link</label><input className="input" value={f.paymentLink1} onChange={(e) => up("paymentLink1", e.target.value)} /></div>
        <div><label className="field-label">Apex payment link</label><input className="input" value={f.paymentLink2} onChange={(e) => up("paymentLink2", e.target.value)} /></div>
        <div><label className="field-label">Telegram link</label><input className="input" value={f.telegramLink} onChange={(e) => up("telegramLink", e.target.value)} /></div>
        <div><label className="field-label">WhatsApp link</label><input className="input" value={f.whatsappLink} onChange={(e) => up("whatsappLink", e.target.value)} /></div>
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 16 }}>
        <span className="badge violet">Social: {f.socialLink}</span>
        <button className="btn btn-sm btn-ghost" onClick={() => up("socialLink", "tg")}>Telegram</button>
        <button className="btn btn-sm btn-ghost" onClick={() => up("socialLink", "wa")}>WhatsApp</button>
        <label style={{ display: "flex", gap: 8, alignItems: "center", marginLeft: "auto" }}>
          <input type="checkbox" checked={f.usePaymentLink} onChange={(e) => up("usePaymentLink", e.target.checked)} />
          <b>Use payment links</b>
        </label>
        <button className="btn btn-primary btn-sm" onClick={save}>{saved ? "✓ Saved" : "Save config"}</button>
      </div>
    </div>
  );
}

// ── Main dashboard ──
export function AdminDashboard({ config, users, withdrawals }: { config: ConfigDraft; users: UserRow[]; withdrawals: WdRow[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<"pending" | "all" | "withdrawals" | "config">("pending");
  const fmt = (n: number) => "₦" + Number(n || 0).toLocaleString();
  const dte = (iso: string | null) => (iso ? new Date(iso).toLocaleString() : "—");

  const pending = users.filter((u) => u.pkg !== "free" && !u.activated);
  const pendingWd = withdrawals.filter((w) => w.status === "Pending");

  const act = async (fn: () => Promise<{ error?: string }>) => {
    const r = await fn();
    if (r.error) alert(r.error);
    router.refresh();
  };

  return (
    <div className="admin-wrap">
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 4 }}>
        <div className="logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-CUooZ1Ch.png" alt="" /> Incossify<span style={{ color: "#a855f7" }}>.</span>
        </div>
        <span className="badge violet">Admin</span>
        <button className="btn btn-ghost btn-sm" style={{ marginLeft: "auto" }} onClick={async () => { await adminLogoutAction(); router.push("/admin/login"); }}>
          Log out
        </button>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === "pending" ? "active" : ""}`} onClick={() => setTab("pending")}>
          Activations {pending.length > 0 && `(${pending.length})`}
        </button>
        <button className={`tab ${tab === "all" ? "active" : ""}`} onClick={() => setTab("all")}>All users ({users.length})</button>
        <button className={`tab ${tab === "withdrawals" ? "active" : ""}`} onClick={() => setTab("withdrawals")}>
          Withdrawals {pendingWd.length > 0 && `(${pendingWd.length})`}
        </button>
        <button className={`tab ${tab === "config" ? "active" : ""}`} onClick={() => setTab("config")}>Config</button>
      </div>

      {tab === "config" && <ConfigEditor config={config} />}

      {(tab === "pending" || tab === "all") && (
        <div className="admin-card card">
          <h2 className="admin-title" style={{ fontSize: "1.1rem" }}>{tab === "pending" ? "Pending activations" : "All users"}</h2>
          <p className="admin-sub">Confirm a user&apos;s payment and activate to credit their 100% welcome bonus.</p>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>User</th><th>Package</th><th>Balance</th><th>Ref</th><th>Joined</th><th></th></tr></thead>
              <tbody>
                {(tab === "pending" ? pending : users).map((u) => (
                  <tr key={u.uid}>
                    <td><b>{u.fullName}</b><br /><span className="small muted">@{u.username} · {u.email}</span></td>
                    <td><span className="badge violet">{u.packageName}</span></td>
                    <td>{fmt(u.total)}</td>
                    <td className="small">{u.paymentReference}</td>
                    <td className="small">{dte(u.joined)}</td>
                    <td>
                      {u.activated ? (
                        <span className="badge green">Active</span>
                      ) : u.pkg !== "free" ? (
                        <button className="btn btn-primary btn-sm" onClick={() => act(() => adminActivateUserAction(u.uid))}>Activate</button>
                      ) : (
                        <span className="badge gray">Free</span>
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
        <div className="admin-card card">
          <h2 className="admin-title" style={{ fontSize: "1.1rem" }}>Withdrawal requests</h2>
          <p className="admin-sub">Approve requests you&apos;ve paid out; reject to refund the user&apos;s balance.</p>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Amount</th><th>Bank details</th><th>Status</th><th>Date</th><th></th></tr></thead>
              <tbody>
                {withdrawals.map((w) => (
                  <tr key={w.id}>
                    <td><b>{fmt(w.amount)}</b><br /><span className="small muted">{w.id}</span></td>
                    <td>{w.bankName}<br /><span className="small muted">{w.accountName} · {w.accountNumber}</span></td>
                    <td><span className={`badge ${w.status === "Pending" ? "gold" : w.status === "Rejected" ? "red" : "green"}`}>{w.status}</span></td>
                    <td className="small">{dte(w.date)}</td>
                    <td>
                      {w.status === "Pending" && (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn btn-primary btn-sm" onClick={() => act(() => adminWithdrawalAction(w.id, "approve"))}>Mark paid</button>
                          <button className="btn btn-danger btn-sm" onClick={() => act(() => adminWithdrawalAction(w.id, "reject"))}>Reject</button>
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
  );
}
