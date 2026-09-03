"use client";

import { useState } from "react";
import Link from "next/link";
import { loginAction, registerAction } from "@/lib/actions";

const arrow = (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ height: "1rem", width: "1rem" }}><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
);
const eye = (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ height: "1rem", width: "1rem" }}><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path><circle cx="12" cy="12" r="3"></circle></svg>
);

const COUNTRIES = ["Nigeria", "Ghana", "Kenya", "South Africa", "United Kingdom", "United States", "Canada", "Other"];

export function AuthShell({ maxWidth = "28rem", children }: { maxWidth?: string; children: React.ReactNode }) {
  return (
    <div className="auth-shell">
      <div style={{ position: "absolute", inset: 0, background: "var(--background)", zIndex: -1 }}></div>
      <div style={{ position: "absolute", inset: 0, background: "var(--gradient-hero)", opacity: 0.4, zIndex: -1 }}></div>
      <div className="rain" style={{ position: "absolute", inset: 0, opacity: 0.2, zIndex: -1 }}></div>
      <div className="glow-1"></div>
      <div className="glow-2"></div>
      <header className="wrap auth-header">
        <Link href="/" className="logo lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-CUooZ1Ch.png" alt="Incossify" draggable="false" />
          <span className="name" style={{ fontSize: "1.5rem" }}>Incossify</span>
        </Link>
        <Link href="/" className="back">← Back home</Link>
      </header>
      <main className="wrap-md" style={{ maxWidth, padding: "2.5rem 0 4rem" }}>
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", inset: "-1rem", background: "var(--gradient-aqua)", borderRadius: "2.5rem", filter: "blur(3rem)", opacity: 0.15 }}></div>
          {children}
        </div>
      </main>
    </div>
  );
}

function PasswordField({ name = "password", label = "Password", placeholder = "Your password" }: { name?: string; label?: string; placeholder?: string }) {
  const [show, setShow] = useState(false);
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <div style={{ position: "relative" }}>
        <input required type={show ? "text" : "password"} minLength={4} name={name} className="field pr-11" placeholder={placeholder} autoComplete={name === "password" ? "current-password" : "new-password"} />
        <button type="button" className="pass-toggle" aria-label="Show password" style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--foreground)", opacity: 0.55 }} onClick={() => setShow((s) => !s)}>
          {eye}
        </button>
      </div>
    </label>
  );
}

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  return (
    <form className="card glass-strong shadow-elegant" style={{ position: "relative", padding: "1.75rem 2.5rem" }}
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true); setError(null);
        try {
          const r = await loginAction(null, new FormData(e.currentTarget));
          if (r.error) setError(r.error);
        } catch { /* server redirect */ }
        setPending(false);
      }}
    >
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.25rem" }}>
        <div style={{ height: "3rem", width: "3rem", borderRadius: "1rem", background: "var(--gradient-aqua)", display: "grid", placeItems: "center", boxShadow: "var(--shadow-aqua)" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ height: "1.25rem", width: "1.25rem", color: "var(--primary-foreground)" }}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        </div>
      </div>
      <div style={{ marginBottom: "1.75rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em" }}>Welcome back</h1>
        <p style={{ marginTop: "0.375rem", fontSize: "0.875rem", color: "var(--foreground)", opacity: 0.65 }}>Sign in to continue earning on Incossify.</p>
      </div>

      {error && <div className="field-error" style={{ display: "block", marginBottom: "1rem" }}>{error}</div>}

      <div style={{ display: "grid", gap: "1rem" }}>
        <label className="block">
          <span className="field-label">Email or username</span>
          <input required type="text" name="identifier" className="field" placeholder="you@example.com" autoComplete="username" />
        </label>
        <PasswordField name="password" placeholder="Your password" />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.875rem" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--foreground)", opacity: 0.7, cursor: "pointer" }}>
            <input type="checkbox" style={{ width: "1rem", height: "1rem", accentColor: "var(--primary)", borderRadius: "0.25rem" }} /> Remember me
          </label>
          <Link href="/register" style={{ color: "var(--primary)", fontWeight: 600 }}>Forgot password?</Link>
        </div>
      </div>

      <button type="submit" className="btn btn-aqua btn-block" style={{ marginTop: "1.75rem", padding: "1rem" }} disabled={pending}>
        {pending ? "Signing in…" : <>Sign in {arrow}</>}
      </button>
      <p style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.875rem", color: "var(--foreground)", opacity: 0.65 }}>
        New to Incossify? <Link href="/register" style={{ color: "var(--primary)", fontWeight: 600 }}>Create an account</Link>
      </p>
    </form>
  );
}

export function RegisterForm({ pkg }: { pkg: string | null }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  return (
    <form className="card glass-strong shadow-elegant" style={{ position: "relative", padding: "1.5rem 2rem" }}
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true); setError(null);
        try {
          const r = await registerAction(null, new FormData(e.currentTarget));
          if (r.error) setError(r.error);
        } catch { /* server redirect */ }
        setPending(false);
      }}
    >
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.02em" }}>Create Account</h1>
      <p style={{ marginTop: "0.25rem", fontSize: "0.875rem", color: "var(--foreground)", opacity: 0.65 }}>
        {pkg ? "Joining with Apex — pay the ₦15,000 activation fee from your dashboard after signup. " : null}
        Already registered? <Link href="/login" style={{ color: "var(--primary)", fontWeight: 600 }}>Sign in</Link>
      </p>

      {pkg && <input type="hidden" name="package" value={pkg} />}
      {error && <div className="field-error" style={{ display: "block", marginTop: "1rem" }}>{error}</div>}

      <div style={{ marginTop: "1.5rem", display: "grid", gap: "1rem" }}>
        <label className="block"><span className="field-label">Full Name</span><input required name="fullName" className="field" placeholder="Enter your full name" /></label>
        <label className="block"><span className="field-label">Username</span><input required name="username" className="field" placeholder="Choose a username" /></label>
        <label className="block"><span className="field-label">Email Address</span><input required type="email" name="email" className="field" placeholder="you@example.com" /></label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <label className="block">
            <span className="field-label">Country</span>
            <select name="country" className="field" defaultValue="Nigeria">
              {COUNTRIES.map((c) => <option key={c} value={c} style={{ background: "var(--background)", color: "var(--foreground)" }}>{c}</option>)}
            </select>
          </label>
          <label className="block"><span className="field-label">Phone Number</span><input required type="tel" name="phone" className="field" placeholder="08012345678" /></label>
        </div>
        <PasswordField name="password" label="Password" placeholder="Minimum 4 characters" />
      </div>

      <button type="submit" className="btn btn-aqua btn-block" style={{ marginTop: "1.75rem", padding: "1rem" }} disabled={pending}>
        {pending ? "Creating account…" : <>Create Account {arrow}</>}
      </button>
      <p style={{ marginTop: "1rem", fontSize: "0.6875rem", textAlign: "center", color: "var(--foreground)", opacity: 0.55 }}>
        By signing up you agree to Incossify&apos;s Terms &amp; Privacy Policy.
      </p>
    </form>
  );
}
