"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "./app-shell";
import { choosePackageAction, reportPaidAction } from "@/lib/actions";

type Pkg = { id: string; name: string; price: number; daily: string; popular: boolean };

export function PaymentClient({
  uid, fullName, username, paymentReference, pkg, packageName, active,
  packages, bank, bankReady, socialLink, telegramLink, whatsappLink,
}: {
  uid: string;
  fullName: string;
  username: string;
  paymentReference: string;
  pkg: string;
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
  const router = useRouter();

  const fmt = (n: number) => "₦" + Number(n).toLocaleString("en-NG");
  const chosen = packages.find((p) => p.id === pkg) || null;
  const chosenName = chosen ? chosen.name : packageName;

  const socialName = socialLink === "wa" ? "WhatsApp" : "Telegram";
  const socialHandle = socialLink === "wa"
    ? (whatsappLink || "https://wa.me/2340000000000").replace("https://wa.me/", "@")
    : (telegramLink || "https://t.me/bobbysupport").replace("https://t.me/", "@");
  const socialUrl = socialLink === "wa" ? whatsappLink || "https://wa.me/2340000000000" : telegramLink || "https://t.me/bobbysupport";

  const copyBank = () => {
    navigator.clipboard.writeText(bank.accountNumber).then(() => {
      const el = document.createElement("div");
      el.className = "toast"; el.textContent = "Account number copied!";
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 2200);
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
      setTimeout(() => el.remove(), 2200);
      return;
    }
    if (r.url && /^https?:\/\//.test(r.url)) {
      router.push(r.url);
    } else {
      router.refresh();
    }
  };

  const reportPaid = async () => {
    const msg = encodeURIComponent(
      `Hello, I just paid for my ${chosenName || "Incossify"} activation.\n\nName: ${fullName}\nUsername: @${username}\nPayment reference: ${paymentReference}\n\nPlease activate my account. Thank you!`
    );
    const base = socialUrl;
    const url = socialLink === "wa"
      ? (base.includes("wa.me") ? base + "?text=" + msg : base)
      : base;
    window.open(url, "_blank");
    await reportPaidAction(uid);
    setReported(true);
  };

  if (active) {
    return (
      <AppShell title="Activation" backHref="/dashboard" navActive="none">
        <div className="stat-card card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 46 }}>🎉</div>
          <h2 className="h2">You&apos;re active!</h2>
          <p className="small muted">Your {chosenName} is active. Keep earning daily.</p>
          <Link href="/dashboard" className="btn btn-primary btn-block" style={{ marginTop: 18 }}>Go to dashboard</Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Activate account" backHref="/dashboard" navActive="none">
      {!chosen && (
        <div className="app-sec">
          <h2>Choose your package</h2>
          <p className="sub">One-time activation. 100% welcome bonus credited on confirmation.</p>
        </div>
      )}

      {!chosen && (
        <div className="picker" style={{ margin: "10px 18px" }}>
          {packages.map((p) => (
            <button key={p.id} className={`picker-card ${p.popular ? "popular" : ""}`} disabled={!!busy} onClick={() => selectPackage(p.id)}>
              <b>{p.name}</b>
              <div className="pr">{fmt(p.price)}</div>
              <div className="dl">{p.daily}</div>
              {busy === p.id ? <div className="small muted" style={{ marginTop: 8 }}>Starting…</div> : <div className="small muted" style={{ marginTop: 8 }}>Select →</div>}
            </button>
          ))}
        </div>
      )}

      {chosen && (
        <>
          <div className="stat-card card">
            <div className="kv"><span className="k">Package</span><span className="v">{chosenName}</span></div>
            <div className="kv"><span className="k">Payment reference</span><span className="v" style={{ fontSize: 13 }}>{paymentReference}</span></div>
            <div className="divider" />
            <div className="small muted">Activation fee</div>
            <div className="big-amount">{fmt(chosen.price)}</div>
            <p className="small muted" style={{ marginTop: 8 }}>
              100% welcome bonus of {fmt(chosen.price)} is credited once your payment is confirmed.
            </p>
          </div>

          {bankReady ? (
            <div className="stat-card card">
              <h2 className="card-title" style={{ marginBottom: 12 }}>Pay to this account</h2>
              <div className="kv"><span className="k">Bank</span><span className="v">{bank.bankName}</span></div>
              <div className="kv"><span className="k">Account name</span><span className="v">{bank.accountName}</span></div>
              <div className="kv">
                <span className="k">Account number</span>
                <span className="v" style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                  {bank.accountNumber}
                  <button className="btn btn-ghost btn-sm" onClick={copyBank}>Copy</button>
                </span>
              </div>
              <p className="small muted" style={{ marginTop: 12, lineHeight: 1.6 }}>
                After paying, tap <b>“I have paid already”</b> and send your proof of payment to our {socialName} support. We activate within minutes.
              </p>
            </div>
          ) : (
            <div className="stat-card card">
              <b>Bank details not set yet.</b>
              <p className="small muted" style={{ marginTop: 8 }}>Contact support on {socialName} for the payment account, or try again shortly.</p>
            </div>
          )}

          {reported ? (
            <div className="stat-card card" style={{ borderColor: "rgba(52,211,153,0.4)", textAlign: "center" }}>
              <div style={{ fontSize: 36 }}>✅</div>
              <b>Payment reported!</b>
              <p className="small muted">We&apos;ve noted your report. Our team activates your account once your payment is confirmed.</p>
              <Link href="/dashboard" className="btn btn-primary btn-block" style={{ marginTop: 12 }}>Back to dashboard</Link>
            </div>
          ) : (
            bankReady && (
              <div style={{ margin: "4px 18px" }}>
                <button className="btn btn-primary btn-block" onClick={reportPaid}>
                  I have paid already — notify {socialName} ({socialHandle.replace("@", "")})
                </button>
              </div>
            )
          )}
        </>
      )}
    </AppShell>
  );
}
