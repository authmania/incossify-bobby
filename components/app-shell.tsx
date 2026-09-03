"use client";

import Link from "next/link";
import { Icon } from "./icons";
import { logoutAction } from "@/lib/actions";

export function LogoutButton({ label = "Log out" }: { label?: string }) {
  return (
    <form action={logoutAction}>
      <button className="btn btn-ghost btn-sm" style={{ padding: "6px 10px", fontSize: 12 }}>{label}</button>
    </form>
  );
}

const ITEMS = [
  { slug: "dashboard", href: "/dashboard", label: "Home", icon: "home" },
  { slug: "withdraw", href: "/withdraw", label: "Wallet", icon: "wallet" },
  { slug: "profile", href: "/profile", label: "Profile", icon: "profile" },
];

export function BottomNav({ active }: { active: string }) {
  return (
    <nav className="bottom-nav">
      {ITEMS.map((i) => (
        <Link key={i.slug} href={i.href} className={active === i.slug ? "active" : ""}>
          <Icon name={i.icon} />
          <span>{i.label}</span>
        </Link>
      ))}
    </nav>
  );
}

export function AppShell({
  title,
  backHref,
  children,
  navActive,
  trailing,
}: {
  title: string;
  backHref?: string;
  children: React.ReactNode;
  navActive: "dashboard" | "withdraw" | "profile" | "none";
  trailing?: React.ReactNode;
}) {
  return (
    <div className="app">
      <div className="app-head">
        {backHref ? (
          <Link href={backHref} className="back glass">
            <Icon name="arrow" cls="w-4 h-4" />
          </Link>
        ) : (
          <span style={{ width: 40 }} />
        )}
        <h1>{title}</h1>
        {trailing ?? <span style={{ width: 40 }} />}
      </div>
      <div style={{ flex: 1 }}>{children}</div>
      {navActive !== "none" && <BottomNav active={navActive} />}
    </div>
  );
}
