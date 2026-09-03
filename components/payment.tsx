"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { choosePackageAction, reportPaidAction } from "@/lib/actions";

type Pkg = { id: string; name: string; price: number; daily: string; popular: boolean };

const shield = (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ height: "1rem", width: "1rem", color: "var(--primary)" }}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1 1 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path></svg>
);
const check = (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ height: "1rem", width: "1rem", color: "var(--primary)" }}><path d="M21.801 10A10 10 0 1 1 17 3.335"></path><path d="m9 11 3 3L22 4"></path></svg>
);

export function PaymentClient({
  uid, fullName, paymentReference, packageName, active,
  packages, bank, bankReady, socialLink, telegramLink, whatsappLink,
}: {
  uid: string;
  fullName: string;
  paymentReference: string;
  packageName: string;
  active: boolean;
  packages: Pkg[];
  bank: { bankName: string; accountName: string; accountNumber: string };
  bankReady: boolean;
  socialLink: string;
  telegramLink: string;
  whatsappLink: string;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [reported, setReported] = useState(false);
  const [copied, setCopied] = useState(false);
  const [chosenId, setChosenId] = useState<string | null>(null);
  const router = useRouter();

  const fmt = (n: number) => "₦" + Number(n).toLocaleString("en-NG");
  const chosen = packages.find((p) => p.id === chosenId) || null;
  const chosenName = chosen ? chosen.name : packageName;

  const socialName = socialLink === "wa" ? "WhatsApp" : "Telegram";
  const socialUrl = socialLink === "wa" ? whatsappLink || "https://wa.me/2340000000000" : telegramLink || "https://t.me/bobbysupport";
  const socialHandle = socialLink === "wa"
    ? (whatsappLink || "https://wa.me/2340000000000").replace("https://wa.me/", "").split("?")[0]
    : (telegramLink || "https://t.me/bobbysupport").replace("https://t.me/", "@").split("?")[0];

  const copyBank = () => {
    navigator.clipboard.writeText(bank.accountNumber).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch(() => {});
  };

  const selectPackage = async (id: string) => {
    setBusy(id);
    const r = await choosePackageAction(uid, id);
    setBusy(null);
    if (r.error) {
      const el = document.createElement("div");
      el.className = "toast"; el.textContent = r.error;
      document.body.appendChild(el);
      requestAnimationFrame(() => el.classList.add("show"));
      setTimeout(() => { el.classList.remove("show"); setTimeout(() => el.remove(), 320); }, 2400);
      return;
    }
    if (r.url && /^https?:\/\//.test(r.url)) {
      router.push(r.url);
    } else {
      setChosenId(id);
    }
  };

  const reportPaid = async () => {
    window.open(socialUrl, "_blank", "noopener");
    await reportPaidAction(uid);
    setReported(true);
  };

  const shell = (body: React.ReactNode) => (
    <div className="auth-shell">
      <div style={{ position: "absolute", inset: 0, background: "var(--gradient-hero)", opacity: 0.4, zIndex: -1 }}></div>
      <div className="glow-1"></div>
      <div className="glow-2"></div>
      <header className="wrap auth-header">
        <Link href="/dashboard" className="logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-CUooZ1Ch.png" alt="Incossify" draggable="false" />
          <span className="name" style={{ fontSize: "1.35rem" }}>Incossify</span>
        </Link>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem", fontWeight: 600, color: "var(--foreground)", opacity: 0.7 }}>
          {shield} Secure checkout
        </span>
      </header>
      <main className="wrap-md" style={{ maxWidth: "34rem", padding: "2.5rem 0 4rem" }}>
        {body}
      </main>
    </div>
  );

  if (active) {
    return shell(
      <div className="card glass-strong shadow-elegant" style={{ padding: "1.75rem 2rem", textAlign: "center" }}>
        <div style={{ fontSize: 40, lineHeight: 1 }}>🎉</div>
        <h1 style={{ marginTop: "0.75rem", fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.02em" }}>You&apos;re active!</h1>
        <p style={{ marginTop: "0.375rem", fontSize: "0.875rem", color: "var(--foreground)", opacity: 0.65 }}>Your {chosenName || "Apex Package"} is active. Keep earning daily.</p>
        <Link href="/dashboard" className="btn btn-aqua btn-block" style={{ marginTop: "1.5rem", padding: "1rem" }}>Go to dashboard</Link>
      </div>
    );
  }

  return shell(
    <div className="card glass-strong shadow-elegant" style={{ padding: "1.5rem 2rem" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.02em" }}>Complete Your Payment</h1>
      <p style={{ marginTop: "0.25rem", fontSize: "0.875rem", color: "var(--foreground)", opacity: 0.65 }}>
        {fullName ? fullName + ", " : ""}activate your {chosen ? chosenName : "package"} to unlock your dashboard.
      </p>

      {!chosen && (
        <div style={{ marginTop: "1.5rem" }}>
          <p style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--foreground)", opacity: 0.65, marginBottom: "0.75rem" }}>Choose your package</p>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {packages.map((p) => (
              <button type="button" key={p.id} className="pay-pkg" disabled={!!busy} onClick={() => selectPackage(p.id)}>
                <span><b>{p.name}</b><span className="tg">{p.daily}</span></span>
                <span className="pr text-gradient-aqua">{fmt(p.price)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {chosen && (
        <>
          <div style={{ marginTop: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "stretch", gap: "0.75rem" }}>
              <div style={{ flex: 1, borderRadius: "1rem", border: "1px solid oklch(80% 0.15 160 / 0.4)", background: "oklch(80% 0.15 160 / 0.15)", padding: "1rem", textAlign: "center" }}>
                <p style={{ fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", color: "oklch(85% 0.13 160)" }}>Amount</p>
                <p style={{ marginTop: "0.25rem", fontSize: "1.5rem", fontWeight: 800, color: "oklch(85% 0.13 160)" }}>{fmt(chosen.price)}</p>
              </div>
            </div>
          </div>

          <div className="card glass" style={{ marginTop: "1rem", padding: "1rem", fontSize: "0.875rem", color: "var(--foreground)", opacity: 0.75 }}>
            Make a bank transfer of <b style={{ color: "var(--foreground)" }}>{fmt(chosen.price)}</b> to the account below, then tap <b style={{ color: "var(--foreground)" }}>&quot;I have paid already&quot;</b> to send your proof. Your <b style={{ color: "var(--primary)" }}>100% welcome bonus</b> is credited once your payment is confirmed.
          </div>

          {bankReady ? (
            <>
              <div style={{ marginTop: "1.25rem", borderRadius: "1rem", boxShadow: "var(--shadow-elegant)", border: "1px solid color-mix(in oklab, var(--primary) 30%, transparent)", padding: "1rem" }}>
                <p style={{ fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", color: "var(--primary)" }}>Bank transfer details</p>
                <div style={{ marginTop: "0.75rem", display: "grid", gap: "0.5rem" }}>
                  <div className="pay-bank-row"><div style={{ minWidth: 0 }}><p className="lbl">Bank name</p><p className="val">{bank.bankName}</p></div></div>
                  <div className="pay-bank-row">
                    <div style={{ minWidth: 0 }}><p className="lbl">Account number</p><p className="val">{bank.accountNumber}</p></div>
                    <button type="button" className="pay-copy" onClick={copyBank}>{copied ? "Copied!" : "Copy"}</button>
                  </div>
                  <div className="pay-bank-row"><div style={{ minWidth: 0 }}><p className="lbl">Account name</p><p className="val">{bank.accountName}</p></div></div>
                </div>
              </div>

              {reported ? (
                <div style={{ marginTop: "1rem", borderRadius: "1rem", border: "1px solid color-mix(in oklab, var(--primary) 40%, transparent)", background: "color-mix(in oklab, var(--primary) 10%, transparent)", padding: "1rem", fontSize: "0.875rem" }}>
                  <p style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 600 }}>{check} Payment reported</p>
                  <p style={{ marginTop: "0.375rem", color: "var(--foreground)", opacity: 0.75 }}>
                    Send your proof of payment on <span style={{ fontWeight: 600, color: "var(--foreground)" }}>{socialName}</span> to{" "}
                    <a href={socialUrl} target="_blank" rel="noreferrer" style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "underline" }}>{socialHandle}</a>{" "}
                    with your username. Your account is activated as soon as it is confirmed.
                  </p>
                </div>
              ) : (
                <button type="button" className="btn btn-aqua btn-block" style={{ marginTop: "0.75rem", padding: "1rem" }} onClick={reportPaid}>
                  {check} I have paid already
                </button>
              )}
            </>
          ) : (
            <div className="card glass" style={{ marginTop: "1rem", padding: "1rem", fontSize: "0.875rem", color: "var(--foreground)", opacity: 0.75 }}>
              Bank details are not set yet. Contact support on {socialName} at <b style={{ color: "var(--primary)" }}>{socialHandle}</b> for the payment account, and your account will be activated once payment is confirmed.
            </div>
          )}

          <p style={{ marginTop: "1.25rem", fontSize: "0.75rem", color: "var(--foreground)", opacity: 0.5, textAlign: "center" }}>
            Payment reference: <b style={{ color: "var(--foreground)" }}>{paymentReference}</b>
          </p>
        </>
      )}
    </div>
  );
}
