import Link from "next/link";
import { AdminLoginForm } from "@/components/admin";

export default function AdminLoginPage() {
  return (
    <div className="auth-shell">
      <div className="auth-card card glass">
        <div className="logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-CUooZ1Ch.png" alt="" /> Incossify<span style={{ color: "#a855f7" }}>.</span>
          <span className="badge violet">Admin</span>
        </div>
        <h1 className="h1" style={{ marginTop: 8 }}>Admin sign in</h1>
        <p className="sub">Enter the admin password to continue.</p>
        <AdminLoginForm />
        <p className="auth-foot"><Link href="/">← Back to site</Link></p>
      </div>
    </div>
  );
}
