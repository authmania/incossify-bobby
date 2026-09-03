"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, loginAction } from "@/lib/actions";

const COUNTRIES = ["Nigeria", "Ghana", "Kenya", "South Africa", "United Kingdom", "United States", "Canada", "Other"];

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, {});
  return (
    <form action={formAction}>
      <label className="field-label">Email or username</label>
      <input name="identifier" className="input" placeholder="you@email.com" autoComplete="username" required />
      <label className="field-label">Password</label>
      <input name="password" type="password" className="input" placeholder="••••••••" autoComplete="current-password" required />
      <div className="form-row">
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="checkbox" /> Remember me
        </label>
        <Link href="/register">Forgot password?</Link>
      </div>
      {state.error && <div className="error-box">{state.error}</div>}
      <button className="btn btn-primary btn-block" style={{ marginTop: 22 }} disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

export function RegisterForm({ pkg, ref }: { pkg: string | null; ref: string | null }) {
  const [state, formAction, pending] = useActionState(registerAction, {});
  return (
    <form action={formAction}>
      {pkg && (
        <input type="hidden" name="package" value={pkg} />
      )}
      {ref && (
        <input type="hidden" name="referral" value={ref} />
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label className="field-label">Full name</label>
          <input name="fullName" className="input" required />
        </div>
        <div>
          <label className="field-label">Username</label>
          <input name="username" className="input" required minLength={3} />
        </div>
      </div>
      <label className="field-label">Email</label>
      <input name="email" type="email" className="input" placeholder="you@email.com" required />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label className="field-label">Country</label>
          <select name="country" className="input" required defaultValue="Nigeria">
            {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Phone</label>
          <input name="phone" className="input" placeholder="08012345678" required />
        </div>
      </div>
      <label className="field-label">Password</label>
      <input name="password" type="password" className="input" placeholder="Minimum 4 characters" minLength={4} required />
      {state.error && <div className="error-box">{state.error}</div>}
      <button className="btn btn-primary btn-block" style={{ marginTop: 22 }} disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
