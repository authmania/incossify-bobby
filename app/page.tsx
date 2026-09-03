"use client";

import { useEffect } from "react";
import Link from "next/link";

// ── Landing fx (port of princess index.html script) ──
export function LandingFx({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const header = document.getElementById("siteHeader");
    const onScroll = () => header?.classList.toggle("scrolled", window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const burger = document.getElementById("burgerBtn");
    const mobile = document.getElementById("mobileMenu");
    const toggle = () => {
      if (!mobile) return;
      const open = mobile.style.display === "block";
      mobile.style.display = open ? "none" : "block";
    };
    burger?.addEventListener("click", toggle);

    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

    function animateCount(el: HTMLElement, target: number, suffix: string) {
      const dur = 1400, t0 = performance.now();
      function tick(t: number) {
        const p = Math.min((t - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toLocaleString() + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }
    const cos = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target as HTMLElement;
        const target = Number(el.dataset.count || 0);
        const suffix = el.textContent.endsWith("+") ? "+" : "";
        el.textContent = "0" + suffix;
        animateCount(el, target, suffix);
        cos.unobserve(el);
      });
    }, { threshold: 0.4 });
    document.querySelectorAll("[data-count]").forEach((el) => cos.observe(el));

    return () => {
      window.removeEventListener("scroll", onScroll);
      burger?.removeEventListener("click", toggle);
      io.disconnect();
      cos.disconnect();
    };
  }, []);
  return <>{children}</>;
}

export function Burger() {
  return (
    <button className="icon-btn burger" id="burgerBtn" aria-label="Menu">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"></line><line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="20" y1="18" y2="18"></line></svg>
    </button>
  );
}

// ── Shared inline icons (lucide paths as used in princess) ──
const stroke = { xmlns: "http://www.w3.org/2000/svg", width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const fillCur = { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor" } as const;

function ArrowRight() { return <svg {...stroke}><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>; }
function Check() { return <svg {...stroke}><path d="M20 6 9 17l-5-5"></path></svg>; }
function Sparkle() { return <svg {...stroke}><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path><path d="M20 3v4"></path><path d="M22 5h-4"></path><path d="M4 17v2"></path><path d="M5 18H3"></path></svg>; }
function Shield() { return <svg {...stroke}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path></svg>; }
function Zap() { return <svg {...stroke}><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path></svg>; }
function Banknote() { return <svg {...stroke}><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"></path><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"></path></svg>; }
function Globe() { return <svg {...stroke}><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>; }
function Share2() { return <svg {...stroke}><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"></line><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"></line></svg>; }
function Pen() { return <svg {...stroke}><path d="M12 20h9"></path><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"></path></svg>; }
function Clipboard() { return <svg {...stroke}><rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><path d="M12 11h4"></path><path d="M12 16h4"></path><path d="M8 11h.01"></path><path d="M8 16h.01"></path></svg>; }
function Video() { return <svg {...stroke}><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"></path><rect x="2" y="6" width="14" height="12" rx="2"></rect></svg>; }
function ReviewStar() { return <svg {...stroke}><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path></svg>; }
function StarSolid() { return <svg {...fillCur}><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></svg>; }
function Send() { return <svg {...stroke}><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"></path><path d="m21.854 2.147-10.94 10.939"></path></svg>; }
function Phone() { return <svg {...stroke}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>; }
function Mail() { return <svg {...stroke}><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>; }

function Stars() {
  return (
    <div className="stars">
      {[0, 1, 2, 3, 4].map((i) => <StarSolid key={i} />)}
    </div>
  );
}

const Landing = () => (
  <LandingFx>
    <div id="root">
      <div className="relative min-h-screen" style={{ background: "var(--background)", color: "var(--foreground)", overflowX: "hidden" }}>
        {/* HEADER */}
        <header className="landing-header" id="siteHeader">
          <div className="wrap">
            <Link href="#top" className="logo" scroll={false}>
              <span className="logo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-CUooZ1Ch.png" alt="Incossify" draggable="false" />
                <span className="name">Incossify</span>
              </span>
            </Link>
            <nav className="landing-nav">
              <a href="#about">About</a>
              <a href="#earnings">Earnings</a>
              <a href="#packages">Packages</a>
              <a href="#how">How it works</a>
              <a href="#stories">Stories</a>
            </nav>
            <div className="actions">
              <Link className="signin" href="/login">Sign in</Link>
              <Link className="btn btn-aqua btn-sm" href="/register">Get started</Link>
              <Burger />
            </div>
          </div>
          <div id="mobileMenu" style={{ display: "none", background: "var(--background)", borderTop: "1px solid var(--border)" }}>
            <div className="wrap" style={{ display: "flex", flexDirection: "column", gap: "0.75rem", paddingTop: "1rem", paddingBottom: "1rem", fontSize: "0.875rem", fontWeight: 500 }}>
              <a href="#about">About</a>
              <a href="#earnings">Earnings</a>
              <a href="#packages">Packages</a>
              <a href="#how">How it works</a>
              <a href="#stories">Stories</a>
              <Link href="/login">Sign in</Link>
            </div>
          </div>
        </header>

        {/* HERO */}
        <section id="top" className="hero">
          <div className="bg"></div>
          <div className="rain"></div>
          <div className="orb"></div>
          <div className="wrap">
            <div className="grid">
              <div className="reveal in">
                <span className="eyebrow glass">
                  <svg {...stroke}><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path><path d="M20 3v4"></path><path d="M22 5h-4"></path><path d="M4 17v2"></path><path d="M5 18H3"></path></svg>
                  UK registered • CAC approved
                </span>
                <h1>Earn daily in <span className="text-gradient-aqua">British Pound</span> &amp; Kuwait Dinar</h1>
                <p className="sub">Incossify pays you for simple everyday tasks — shares, reshares, status posts, surveys, ghostwriting, movie reviews and video clipping. Activate once, get 100% of your registration fee back as a welcome bonus, then earn every single day.</p>
                <div className="ctas">
                  <Link className="btn btn-aqua" href="/register">Create your account <ArrowRight /></Link>
                  <a href="#packages" className="btn btn-glass">See packages</a>
                </div>
                <div className="stats">
                  <div className="stat glass"><b className="text-gradient-aqua" data-count="2500">0</b><span>+ Active earners</span></div>
                  <div className="stat glass"><b className="text-gradient-aqua" data-count="180">0</b><span>M+ Paid out (₦M)</span></div>
                  <div className="stat glass"><b className="text-gradient-aqua" data-count="100">0</b><span>Daily tasks</span></div>
                </div>
              </div>
              <div className="reveal in" style={{ transitionDelay: "120ms" }}>
                <div className="flyer-wrap">
                  <div className="flyer-glow"></div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/flyer-110325-CIcsGcvZ.jpg" alt="Incossify early bird package prices" className="flyer" draggable="false" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" className="sec">
          <div className="wrap">
            <div className="reveal">
              <div className="sec-title">
                <p style={{ padding: 0, textTransform: "uppercase", letterSpacing: "0.25em", fontWeight: 700, fontSize: "0.75rem", color: "var(--primary)" }}>About Incossify</p>
                <h2>A digital earning platform built for everyday people</h2>
                <p>You do not need a degree, capital or experience. If you can use your phone, you can earn with Incossify. Every task on your dashboard carries a fixed reward that lands straight in your wallet the moment it is completed.</p>
              </div>
            </div>
            <div className="grid-4">
              {[
                { ic: Shield, t: "Registered & approved", d: "Incossify operates under a UK certificate of incorporation and is CAC approved for Nigerian members." },
                { ic: Zap, t: "Instant activation", d: "Pay once through our secure checkout and your dashboard unlocks with your welcome bonus." },
                { ic: Banknote, t: "Withdraw anytime", d: "Move your task, sales and referral balances to your bank account whenever you hit the minimum." },
                { ic: Globe, t: "Global currencies", d: "Rewards are valued in British Pound and Kuwait Dinar, then paid to you in Naira." },
              ].map((f, i) => (
                <div className="reveal" style={{ transitionDelay: `${i * 80}ms` }} key={f.t}>
                  <div className="about-card glass">
                    <div className="ic"><f.ic /></div>
                    <h3>{f.t}</h3>
                    <p>{f.d}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="reveal">
              <div className="grid-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/flyer-110351-CWFPyJpf.jpg" alt="Incossify CAC approved certificate" className="flyer-img" loading="lazy" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/flyer-110318-CDSEa378.jpg" alt="Incossify 100% cashback welcome bonus" className="flyer-img" loading="lazy" />
              </div>
            </div>
          </div>
        </section>

        {/* EARNINGS */}
        <section id="earnings" className="sec" style={{ position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, background: "var(--gradient-surface)", zIndex: -1 }}></div>
          <div className="wrap">
            <div className="reveal">
              <div className="sec-title center">
                <p style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.25em", color: "var(--primary)", fontWeight: 700 }}>Earning structures</p>
                <h2>Every task has a fixed reward</h2>
                <p>1 Pound = ₦2,000 &nbsp;•&nbsp; 1 Kuwait Dinar = ₦4,000</p>
              </div>
            </div>
            <div className="grid-3">
              {[
                { ic: Share2, t: "Inn-Shares & Reshares", d: "Up to 13,500 / £6.50" },
                { ic: Pen, t: "Inn Ghostwriter", d: "2,000 / £1 per reward" },
                { ic: Clipboard, t: "Inn Survey", d: "2,000 / £1 per reward" },
                { ic: Video, t: "Inn Video Clipping", d: "3,000 / £1.50" },
                { ic: ReviewStar, t: "Inn Movie Review", d: "1,000 / £0.50" },
                { ic: Sparkle, t: "Inn AI Assistant", d: "1,500 / £0.75" },
              ].map((r, i) => (
                <div className="reveal" style={{ transitionDelay: `${i * 60}ms` }} key={r.t}>
                  <div className="task-row glass">
                    <div className="ic"><r.ic /></div>
                    <div>
                      <h4>{r.t}</h4>
                      <p>{r.d}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="reveal">
              <div className="grid-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/flyer-110333-Qs8c3z28.jpg" alt="StarterKit package earning structure" className="flyer-img" loading="lazy" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/flyer-110423-BFe0pvC8.jpg" alt="Apex package earning structure" className="flyer-img" loading="lazy" />
              </div>
            </div>
            <div className="reveal">
              <div className="grid-3" style={{ marginTop: "1.5rem" }}>
                {["flyer-110311-DsFjjKzV.jpg", "flyer-110345-BtmE9mEA.jpg", "flyer-110339-C5b8xXCj.jpg"].map((f) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={f} src={`/${f}`} alt="" className="flyer-img" loading="lazy" style={{ borderRadius: "1.5rem" }} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* PACKAGES */}
        <section id="packages" className="sec">
          <div className="wrap-lg">
            <div className="reveal">
              <div className="sec-title center">
                <p style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.25em", color: "var(--primary)", fontWeight: 700 }}>Choose your package</p>
                <h2>One-time activation. Lifetime access.</h2>
                <p>Early bird pricing is live — you get 100% of your registration fee back as a welcome bonus.</p>
              </div>
            </div>
            <div className="grid-2" style={{ marginTop: "3rem" }}>
              <div className="reveal">
                <div className="package glass">
                  <h3>StarterKit Package</h3>
                  <p className="tagline">Perfect for new earners starting today</p>
                  <div className="price-row"><span className="price text-gradient-aqua">₦9,500</span></div>
                  <p className="daily">7,900 / £3.45 daily</p>
                  <ul>
                    {["100% welcome commission — ₦9,500 / £4.75", "Inn-shares: 8,000 / £4.00", "Inn-Reshares: 200 / £0.10", "Daily tasks up to 7,900 / £3.45", "Raffle, grant & sports rewards"].map((x) => (
                      <li key={x}><span className="check"><Check /></span>{x}</li>
                    ))}
                  </ul>
                  <Link className="btn btn-aqua" href="/register?package=starterkit">Activate StarterKit <ArrowRight /></Link>
                </div>
              </div>
              <div className="reveal" style={{ transitionDelay: "100ms" }}>
                <div className="package glass-strong popular">
                  <span className="flag">Most popular</span>
                  <h3>Apex Package</h3>
                  <p className="tagline">Highest daily payouts and full access</p>
                  <div className="price-row"><span className="price text-gradient-aqua">₦15,000</span></div>
                  <p className="daily">16,000 / £6.50 daily</p>
                  <ul>
                    {["100% registration commission — ₦15,000 / £7.50", "Inn-shares: 13,500 / £6.50", "Inn-Reshares: 400 / £0.20", "Daily tasks up to 16,000 / £6.50", "Over 1.2M in extra rewards"].map((x) => (
                      <li key={x}><span className="check"><Check /></span>{x}</li>
                    ))}
                  </ul>
                  <Link className="btn btn-aqua" href="/register?package=apex">Activate Apex <ArrowRight /></Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW */}
        <section id="how" className="sec" style={{ position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, background: "var(--gradient-surface)", zIndex: -1 }}></div>
          <div className="wrap-lg">
            <div className="reveal"><h2 style={{ textAlign: "center", fontSize: "1.875rem", fontWeight: 800, letterSpacing: "-0.02em" }}>How it works</h2></div>
            <div className="grid-4" style={{ marginTop: "3rem" }}>
              {[
                ["01", "Create your account", "Fill the short registration form and pick the package that suits you."],
                ["02", "Pay securely", "Complete your one-time activation fee through our secure Squad checkout."],
                ["03", "Get activated", "Your account is confirmed and your 100% welcome bonus lands in your wallet."],
                ["04", "Earn & withdraw", "Complete daily tasks, grow your balance and cash out to your bank."],
              ].map(([n, t, d], i) => (
                <div className="reveal" style={{ transitionDelay: `${i * 90}ms` }} key={n}>
                  <div className="step glass"><span className="num">{n}</span><h3>{t}</h3><p>{d}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* STORIES */}
        <section id="stories" className="sec">
          <div className="wrap-lg">
            <div className="reveal">
              <div className="sec-title center">
                <p style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.25em", color: "var(--primary)", fontWeight: 700 }}>Member stories</p>
                <h2>Real people. Real payouts.</h2>
              </div>
            </div>
            <div className="grid-3" style={{ marginTop: "3rem" }}>
              {[
                ["B", "Blessing A.", "Lagos", "I joined with the StarterKit and got my ₦9,500 back the same day as welcome bonus. My first withdrawal cleared in minutes."],
                ["I", "Ibrahim K.", "Kano", "The Apex package pays more per task. I do my shares in the morning and surveys at night — it adds up fast."],
                ["C", "Chidera O.", "Enugu", "What I love is how simple it is. Post, share, submit, get paid. No stress, no complicated targets."],
              ].map(([av, name, city, quote], i) => (
                <div className="reveal" style={{ transitionDelay: `${i * 90}ms` }} key={name}>
                  <figure className="testimonial glass">
                    <Stars />
                    <blockquote>{quote}</blockquote>
                    <figcaption>
                      <span className="avatar">{av}</span>
                      <span><b>{name}</b><br /><span style={{ fontSize: "0.75rem", color: "var(--foreground)", opacity: 0.6 }}>{city}</span></span>
                    </figcaption>
                  </figure>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="sec">
          <div className="wrap-lg">
            <div className="reveal">
              <div className="cta-banner glass-strong">
                <div className="orb"></div>
                <h2>Your first payout is one form away</h2>
                <p>Join thousands of Nigerians already earning with Incossify. Activation takes less than 5 minutes.</p>
                <div className="btns">
                  <Link className="btn btn-aqua" href="/register">Get started now <ArrowRight /></Link>
                  <a href="https://t.me/bobbysupport" target="_blank" rel="noreferrer" className="btn btn-glass">Chat support</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="footer">
          <div className="wrap">
            <div className="grid">
              <div>
                <span className="logo">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo-CUooZ1Ch.png" alt="Incossify" draggable="false" style={{ height: "2.25rem" }} />
                  <span className="name">Incossify</span>
                </span>
                <p className="desc">Incossify is a digital earning platform rewarding members in British Pound and Kuwait Dinar for simple daily online tasks.</p>
              </div>
              <div>
                <h4>Platform</h4>
                <ul>
                  <li><a href="#about">About</a></li>
                  <li><a href="#packages">Packages</a></li>
                  <li><Link href="/register">Register</Link></li>
                  <li><Link href="/login">Sign in</Link></li>
                </ul>
              </div>
              <div>
                <h4>Support</h4>
                <ul>
                  <li>
                    <a href="https://t.me/bobbysupport" target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                      <svg {...stroke} style={{ height: "1rem", width: "1rem" }}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> Telegram support</a>
                  </li>
                  <li style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}><Mail /> support@incossify.com</li>
                  <li style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}><Phone /> Mon–Sat, 9am–7pm</li>
                </ul>
              </div>
            </div>
            <p className="copy">© 2026 Incossify. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  </LandingFx>
);


export default Landing;
