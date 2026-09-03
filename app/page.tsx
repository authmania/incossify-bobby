import Link from "next/link";
import { PACKAGES, SITE_NAME } from "@/lib/config";
import { LandingFx, MobileMenuToggle } from "@/components/landing-fx";
import { Icon } from "@/components/icons";

const FEATURES = [
  { icon: "share", title: "Inn-Shares & Reshares", desc: "Claim daily shares and reshares straight from your dashboard." },
  { icon: "music", title: "Listen & earn", desc: "Stream music tracks and earn bonus cash while you relax." },
  { icon: "clipboard", title: "Daily task catalog", desc: "Surveys, ghostwriting, movie reviews, AI tasks and more." },
  { icon: "withdraw", title: "Withdraw anytime", desc: "Move earnings to your bank account whenever you like." },
];

const EARNINGS = [
  ["Inn-Shares & Reshares", "Up to 13,500 / £6.50"],
  ["Inn Ghostwriter", "2,000 / £1"],
  ["Inn Survey", "2,000 / £1"],
  ["Inn Video Clipping", "3,000 / £1.50"],
  ["Inn Movie Review", "1,000 / £0.50"],
  ["Inn AI Assistant", "1,500 / £0.75"],
];

const STEPS = [
  { n: "01", t: "Create a free account", d: "Sign up in seconds and explore the dashboard." },
  { n: "02", t: "Pay securely", d: "Choose your package and pay the one-time activation fee." },
  { n: "03", t: "Complete tasks", d: "Claim tasks, listen to music and grow your balance daily." },
  { n: "04", t: "Withdraw", d: "Request a payout to your bank account anytime." },
];

export default function Home() {
  return (
    <LandingFx>
      {/* Header */}
      <header className="site-header" id="siteHeader">
        <div className="wrap inner">
          <Link href="/" className="logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-CUooZ1Ch.png" alt="" />
            {SITE_NAME}<span style={{ color: "#a855f7" }}>.</span>
          </Link>
          <nav className="nav-links">
            <a href="#about">About</a>
            <a href="#earnings">Earnings</a>
            <a href="#packages">Packages</a>
            <a href="#how">How it works</a>
          </nav>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Link href="/login" className="btn btn-ghost btn-sm">Sign in</Link>
            <Link href="/register" className="btn btn-primary btn-sm">Get started</Link>
            <MobileMenuToggle />
          </div>
        </div>
        <div id="mobileMenu" className="glass wrap" style={{ display: "none", margin: "0 16px" }} />
      </header>

      {/* Hero */}
      <section className="hero" id="top">
        <div className="wrap">
          <span className="eyebrow">🇬🇧 Earn in British Pound &amp; Kuwait Dinar</span>
          <h1 className="h1">
            Complete simple tasks,<br /> <span className="text-gradient">earn daily &amp; withdraw anytime.</span>
          </h1>
          <p className="lead">
            {SITE_NAME} pays you for shares, music, surveys, ghostwriting and more. One-time activation, lifetime earning.
          </p>
          <div className="cta-row">
            <Link href="/register?package=apex" className="btn btn-primary">Start earning — from ₦9,500</Link>
            <Link href="/login" className="btn btn-ghost">Sign in to dashboard</Link>
          </div>
          <div className="hero-stats">
            {[
              ["data-count", "2500", "Active earners"],
              ["data-count", "180", "M+ Paid out (₦M)"],
              ["data-count", "100", "Daily tasks"],
            ].map(([attr, count, label], i) => (
              <div className="stat reveal" key={i}>
                <div className="n" {...{ [attr]: count }} data-suffix="+">0</div>
                <div className="l">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="sec" id="about">
        <div className="wrap">
          <h2 className="h2 sec-title reveal">Why join {SITE_NAME}?</h2>
          <p className="sec-sub reveal">A UK-registered, CAC-approved digital earning platform trusted by thousands.</p>
          <div className="grid-4">
            {FEATURES.map((f, i) => (
              <div className="tile card reveal" key={f.title} style={{ transitionDelay: `${i * 60}ms` }}>
                <div className="tile-ic"><Icon name={f.icon} /></div>
                <h3>{f.title}</h3>
                <p className="small muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Earnings */}
      <section className="sec" id="earnings">
        <div className="wrap">
          <h2 className="h2 sec-title reveal">What you can earn daily</h2>
          <p className="sec-sub reveal">Every task pays — the more you do, the more you make.</p>
          <div className="grid-2" style={{ maxWidth: 760, margin: "0 auto" }}>
            <div className="card reveal">
              {EARNINGS.slice(0, 3).map(([t, v]) => (
                <div className="kv" key={t}><span className="k">{t}</span><span className="v">{v}</span></div>
              ))}
            </div>
            <div className="card reveal">
              {EARNINGS.slice(3).map(([t, v]) => (
                <div className="kv" key={t}><span className="k">{t}</span><span className="v">{v}</span></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="sec" id="packages">
        <div className="wrap">
          <h2 className="h2 sec-title reveal">Choose your package</h2>
          <p className="sec-sub reveal">One-time activation. Lifetime access. 100% welcome bonus on confirmation.</p>
          <div className="grid-2" style={{ maxWidth: 860, margin: "0 auto" }}>
            {Object.values(PACKAGES).map((p, i) => (
              <div className="pkg card glass reveal" key={p.id} style={{ transitionDelay: `${i * 90}ms` }}>
                {p.popular && <span className="pkg-flag">Most popular</span>}
                <div className="pkg-name">{p.name}</div>
                <div className="pkg-tag">{p.tagline}</div>
                <div className="pkg-price">{p.price.toLocaleString()}₦</div>
                <div className="pkg-daily">{p.daily}</div>
                <ul>
                  {p.features.map((f) => (
                    <li key={f}>
                      <Icon name="share" cls="w-4" />
                      <span><b>{f.split(" — ")[0]}</b>{f.includes("—") ? " — " + f.split(" — ")[1] : ""}</span>
                    </li>
                  ))}
                </ul>
                <Link href={`/register?package=${p.id}`} className={`btn ${p.popular ? "btn-primary" : "btn-ghost"} btn-block`} style={{ marginTop: "auto" }}>
                  Get {p.name.split(" ")[0]}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How */}
      <section className="sec" id="how">
        <div className="wrap">
          <h2 className="h2 sec-title reveal">How it works</h2>
          <p className="sec-sub reveal">From signup to first payout in four steps.</p>
          <div className="grid-4">
            {STEPS.map((s, i) => (
              <div className="tile card reveal" key={s.n} style={{ transitionDelay: `${i * 70}ms` }}>
                <div className="eyebrow" style={{ marginBottom: 12 }}>{s.n}</div>
                <h3>{s.t}</h3>
                <p className="small muted">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="card glass reveal" style={{ textAlign: "center", padding: "54px 24px", position: "relative", overflow: "hidden" }}>
            <h2 className="h2" style={{ fontSize: "2rem" }}>Ready to start earning?</h2>
            <p className="lead" style={{ maxWidth: 480, margin: "12px auto 26px" }}>Create your free account and complete your first task today.</p>
            <div className="cta-row">
              <Link href="/register" className="btn btn-primary">Create free account</Link>
              <Link href="https://t.me/bobbysupport" target="_blank" rel="noreferrer" className="btn btn-ghost">Chat support</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="wrap cols">
          <div>
            <Link href="/" className="logo" style={{ marginBottom: 14 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-CUooZ1Ch.png" alt="" /> {SITE_NAME}
            </Link>
            <p className="small">Complete tasks, earn daily and withdraw anytime. One-time activation, lifetime access.</p>
          </div>
          <div>
            <h4>Links</h4>
            <a href="#about">About</a>
            <a href="#packages">Packages</a>
            <a href="#how">How it works</a>
          </div>
          <div>
            <h4>Support</h4>
            <a href="https://t.me/bobbysupport" target="_blank" rel="noreferrer">Telegram</a>
            <a href="mailto:support@incossify.com">support@incossify.com</a>
          </div>
        </div>
      </footer>
    </LandingFx>
  );
}
