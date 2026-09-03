import Link from "next/link";
import { LoginForm } from "@/components/auth-forms";

export default function LoginPage() {
  return (
    <div className="auth-shell">
      <div className="auth-card card glass">
        <Link href="/" className="logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-CUooZ1Ch.png" alt="Incossify" />
          Incossify<span style={{ color: "#a855f7" }}>.</span>
        </Link>
        <h1 className="h1">Welcome back</h1>
        <p className="sub">Sign in to your dashboard to continue earning.</p>
        <LoginForm />
        <p className="auth-foot">
          Don&apos;t have an account? <Link href="/register">Create one free</Link>
        </p>
      </div>
    </div>
  );
}
