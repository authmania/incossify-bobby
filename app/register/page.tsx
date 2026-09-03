import Link from "next/link";
import { RegisterForm } from "@/components/auth-forms";
import { PACKAGES } from "@/lib/config";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const pkg = typeof sp?.package === "string" ? sp.package : null;
  const ref = typeof sp?.ref === "string" ? sp.ref : null;
  const isPkg = pkg === "starterkit" || pkg === "apex";

  return (
    <div className="auth-shell">
      <div className="auth-card card glass">
        <Link href="/" className="logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-CUooZ1Ch.png" alt="Incossify" />
          Incossify<span style={{ color: "#a855f7" }}>.</span>
        </Link>
        <h1 className="h1">Create your account</h1>
        <p className="sub">
          {isPkg ? (
            <>Joining with <b>{PACKAGES[pkg as "starterkit" | "apex"].name}</b>. Pay the activation fee from your dashboard after signup.</>
          ) : (
            "Start earning today — no activation fee required to begin."
          )}
        </p>
        <RegisterForm pkg={pkg} ref={ref} />
        <p className="auth-foot">
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
