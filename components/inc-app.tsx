"use client";

import Link from "next/link";
import { logoutAction } from "@/lib/actions";

function NavIco({ kind }: { kind: "home" | "withdraw" | "profile" }) {
  const svg = {
    home: (<><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></>),
    withdraw: (<><rect x="3" y="6" width="18" height="14" rx="3" /><path d="M3 10h18" /><path d="M15 15h2" /></>),
    profile: (<><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></>),
  };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {svg[kind]}
    </svg>
  );
}

export function BottomBar({ active }: { active: "dashboard" | "withdraw" | "profile" }) {
  const items = [
    { kind: "home" as const, label: "Home", href: "/dashboard", slug: "dashboard" },
    { kind: "withdraw" as const, label: "Withdraw", href: "/withdraw", slug: "withdraw" },
    { kind: "profile" as const, label: "Profile", href: "/profile", slug: "profile" },
  ];
  return (
    <nav className="bottom-nav">
      <ul>
        {items.map((i) => (
          <li key={i.slug}>
            <Link href={i.href} className={active === i.slug ? "active" : ""}>
              <span className="nav-ic"><NavIco kind={i.kind} /></span>
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function IncApp({
  title,
  sub,
  backHref = "/dashboard",
  active,
  children,
}: {
  title: string;
  sub?: string;
  backHref?: string;
  active: "dashboard" | "withdraw" | "profile";
  children: React.ReactNode;
}) {
  return (
    <div className="app">
      <div className="bg"></div>
      <div className="app-body">
        <div className="app-top">
          <Link href={backHref} className="back-btn glass" aria-label="Back">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ height: "1.25rem", width: "1.25rem" }}><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>
          </Link>
          <div>
            {sub && <p className="sub">{sub}</p>}
            <h1>{title}</h1>
          </div>
        </div>
        {children}
      </div>
      <BottomBar active={active} />
    </div>
  );
}

export function SignOut() {
  return (
    <form action={logoutAction}>
      <button className="btn btn-danger-ghost btn-block" style={{ padding: "0.875rem" }}>Sign out</button>
    </form>
  );
}

export function toast(msg: string) {
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = msg;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add("show"));
  setTimeout(() => { el.classList.remove("show"); setTimeout(() => el.remove(), 320); }, 2400);
}
