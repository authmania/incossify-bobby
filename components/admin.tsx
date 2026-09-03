"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminLoginAction, adminLogoutAction, adminSaveConfigAction, adminSaveAppLinksAction } from "@/lib/admin-actions";

type AppDraft = {
  cta: string;
  telegramLink: string;
  telegramGroupLink: string;
};
type ConfigDraft = {
  bankName: string; accountName: string; accountNumber: string;
  paymentLink1: string; paymentLink2: string;
  usePaymentLink: boolean;
  telegramLink: string; telegramGroupLink: string; whatsappLink: string; socialLink: "tg" | "wa";
};

function toast(msg: string) {
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = msg;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add("show"));
  setTimeout(() => { el.classList.remove("show"); setTimeout(() => el.remove(), 320); }, 2400);
}
const Ico = ({ d, extra }: { d: string; extra?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} />{extra && <path d={extra} />}</svg>
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

function Card({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="admin-card glass-strong">
      <div className="hd"><div className="ic">{icon}</div><h2>{title}</h2></div>
      {children}
    </div>
  );
}

function LinkField({ label, current, value, onChange, placeholder }: { label: string; current: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="block">
      <span className="current-label">{label}</span>
      <div className="current-value">{current || "Not set"}</div>
      <input type="url" className="field" style={{ marginTop: "0.5rem" }} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </label>
  );
}

// ── Princess-style admin panel ──
export function AdminDashboard({ config, app }: { config: ConfigDraft; app: AppDraft }) {
  const router = useRouter();
  const [f, setF] = useState<ConfigDraft>(config);
  const [a, setA] = useState<AppDraft>(app);
  const [saving, setSaving] = useState(false);
  const [savedCfg, setSavedCfg] = useState<ConfigDraft>(config);
  const dirty = JSON.stringify(f) !== JSON.stringify(savedCfg);
  const appDirty = JSON.stringify(a) !== JSON.stringify(app);
  const up = <K extends keyof ConfigDraft>(k: K, v: ConfigDraft[K]) => setF((p) => ({ ...p, [k]: v }));
  const upApp = <K extends keyof AppDraft>(k: K, v: AppDraft[K]) => setA((p) => ({ ...p, [k]: v }));

  // Payment-links toggle autosaves immediately — no Save Changes needed.
  const togglePaymentLinks = async (checked: boolean) => {
    setF((p) => ({ ...p, usePaymentLink: checked }));
    const r = await adminSaveConfigAction({ usePaymentLink: checked });
    if (r.error) {
      setF((p) => ({ ...p, usePaymentLink: !checked }));
      return toast("❌ " + r.error);
    }
    setSavedCfg((p) => ({ ...p, usePaymentLink: checked }));
    toast(`✅ Payment links ${checked ? "enabled" : "disabled"}`);
  };

  const saveAll = async () => {
    setSaving(true);
    if (dirty) {
      const r = await adminSaveConfigAction(f);
      if (r.error) { setSaving(false); return toast("❌ " + r.error); }
      setSavedCfg(f);
    }
    if (appDirty) {
      const r = await adminSaveAppLinksAction(a);
      if (r.error) { setSaving(false); return toast("❌ " + r.error); }
    }
    setSaving(false);
    toast("✅ Settings saved!");
  };

  const hdIc = {
    bank: <Ico d="M3 9 12 2l9 7v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" extra="M9 22V12h6v10" />,
    link: <Ico d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" extra="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />,
    people: <Ico d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" extra="" />,
    whatsapp: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.668-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" /></svg>,
  };

  return (
    <div className="admin-shell">
      <div className="grad"></div>
      <div className="inner">
        <header className="admin-head">
          <div className="brand" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-CUooZ1Ch.png" alt="Incossify" style={{ height: "2rem", width: "2rem", objectFit: "contain" }} />
            <span style={{ fontWeight: 800, fontSize: "1.1rem" }}>Incossify <span style={{ color: "var(--primary)" }}>Admin</span></span>
          </div>
          <button className="btn btn-aqua" type="button" style={{ marginLeft: "auto", display: dirty || appDirty ? "inline-flex" : "none", padding: "0.5rem 1.1rem", fontSize: "0.8rem" }} disabled={saving} onClick={saveAll}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ height: "0.875rem", width: "0.875rem" }}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </header>

        <div style={{ marginTop: "1.5rem", display: "grid", gap: "1.25rem" }}>
          {/* Payment Account */}
          <Card icon={hdIc.bank} title="Payment Account Details">
            <div style={{ display: "grid", gap: "0.875rem" }}>
              <label className="block"><span className="field-label">Bank Name</span><input type="text" className="field" value={f.bankName} onChange={(e) => up("bankName", e.target.value)} placeholder="e.g. Opay" /></label>
              <label className="block"><span className="field-label">Account Name</span><input type="text" className="field" value={f.accountName} onChange={(e) => up("accountName", e.target.value)} placeholder="e.g. INCOSSIFY LTD" /></label>
              <label className="block"><span className="field-label">Account Number</span><input type="text" className="field" value={f.accountNumber} onChange={(e) => up("accountNumber", e.target.value.replace(/\D/g, "").slice(0, 11))} placeholder="e.g. 0123456789" /></label>
            </div>
          </Card>

          {/* Payment Links */}
          <Card icon={hdIc.link} title="Payment Link Settings">
            <div className="toggle-row">
              <div className="toggle-label">Enable Payment Links <small>(Use payment links instead of bank transfer)</small></div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: "auto" }}>
                <span className={`toggle-status ${f.usePaymentLink ? "active" : "inactive"}`}>{f.usePaymentLink ? "ON" : "OFF"}</span>
                <label className="toggle-switch"><input type="checkbox" checked={f.usePaymentLink} onChange={(e) => togglePaymentLinks(e.target.checked)} /><span className="toggle-slider"></span></label>
              </div>
            </div>
            <div style={{ height: 1, background: "var(--border)", margin: "1rem 0" }}></div>
            <LinkField label="Apex Payment Link (₦15,000)" current={f.paymentLink2} value={f.paymentLink2} onChange={(v) => up("paymentLink2", v)} placeholder="https://pay.example/incossifyape" />
          </Card>

          {/* Social Settings */}
          <Card icon={hdIc.people} title="Social Settings">
            <span className="field-label" style={{ display: "block", marginBottom: "0.75rem" }}>Use Social</span>
            <div className="social-pick">
              <button type="button" className={`social-opt ${f.socialLink === "tg" ? "active" : ""}`} onClick={() => up("socialLink", "tg")}>Telegram</button>
              <button type="button" className={`social-opt ${f.socialLink === "wa" ? "active" : ""}`} onClick={() => up("socialLink", "wa")}>WhatsApp</button>
            </div>
            <div className="link-status"></div>
          </Card>

          {/* Telegram */}
          <Card icon={hdIc.people} title="Telegram Links">
            <LinkField label="Link to DM" current={f.telegramLink} value={f.telegramLink} onChange={(v) => up("telegramLink", v)} placeholder="https://t.me/bobbysupport" />
            <div style={{ height: 1, background: "var(--border)", margin: "1rem 0" }}></div>
            <LinkField label="Link to group" current={f.telegramGroupLink} value={f.telegramGroupLink} onChange={(v) => up("telegramGroupLink", v)} placeholder="https://t.me/your_group" />
          </Card>

          {/* WhatsApp */}
          <Card icon={hdIc.whatsapp} title="WhatsApp Redirect Link">
            <LinkField label="Current link" current={f.whatsappLink} value={f.whatsappLink} onChange={(v) => up("whatsappLink", v)} placeholder="https://wa.me/2348012345678" />
          </Card>

          {/* App links (read by incossify-app) */}
          <Card icon={<Ico d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />} title="App">
            <span className="current-label" style={{ display: "block", marginBottom: "0.5rem" }}>Links used by the Incossify mobile app.</span>
            <LinkField label="CTA / signup link" current={a.cta} value={a.cta} onChange={(v) => upApp("cta", v)} placeholder="https://www.incossify.com" />
            <div style={{ height: 1, background: "var(--border)", margin: "1rem 0" }}></div>
            <LinkField label="App Telegram link" current={a.telegramLink} value={a.telegramLink} onChange={(v) => upApp("telegramLink", v)} placeholder="https://t.me/your_channel_or_group" />
            <div style={{ height: 1, background: "var(--border)", margin: "1rem 0" }}></div>
            <LinkField label="Telegram group link" current={a.telegramGroupLink} value={a.telegramGroupLink} onChange={(v) => upApp("telegramGroupLink", v)} placeholder="https://t.me/your_group" />
          </Card>

        </div>

        <div style={{ display: "flex", justifyContent: "center", marginTop: "1.5rem" }}>
          <button className="signout" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8rem", fontWeight: 600, color: "var(--foreground)", opacity: 0.7, border: "1px solid var(--border)", borderRadius: 999, padding: "0.55rem 1.4rem", background: "rgb(255 255 255 / 0.04)", cursor: "pointer", fontFamily: "inherit" }}
            onClick={async () => { await adminLogoutAction(); router.push("/admin/login"); }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ height: "1rem", width: "1rem" }}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" x2="9" y1="12" y2="12"></line></svg>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
