"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { claimShareAction, claimSongAction, logoutAction } from "@/lib/actions";
import { musicSongIds, SONG_REWARD, SHARE_CLAIMS, type Song } from "@/lib/catalog";

type Snapshot = {
  uid: string;
  fullName: string;
  firstName: string;
  initials: string;
  username: string;
  referralCode: string;
  referralUrl: string;
  pkg: string;
  packageName: string;
  active: boolean;
  wallets: { total: number; shares: number; rewards: number };
};

const SHARES = SHARE_CLAIMS.map((s, i) => ({ id: s.id, label: `Inn Share ${i + 1}`, sub: "Daily share bonus", reward: s.reward }));

const RATE_DEFAULT = 1846.279333;

function fmt(n: number) {
  return "₦" + Number(n || 0).toLocaleString();
}
function toasts(msg: string) {
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = msg;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add("show"));
  setTimeout(() => { el.classList.remove("show"); setTimeout(() => el.remove(), 350); }, 2400);
}

export function DashboardClient({ user, day, ledger, tgLink }: { user: Snapshot; day: string; ledger: Record<string, string>; tgLink?: string }) {
  const router = useRouter();
  const songs: Song[] = useMemo(() => musicSongIds(day), [day]);
  const status = (id: string) => ledger[id] || "available";
  const claimedShares = SHARES.filter((s) => status(s.id) === "completed").length;
  const playedSongs = songs.filter((s) => status(s.id) === "completed").length;
  const allDone = claimedShares === SHARES.length && playedSongs === songs.length;

  const [currency, setCurrency] = useState<string>(() => {
    if (typeof window === "undefined") return "NGN";
    const saved = localStorage.getItem("incossify_currency");
    return saved === "GBP" || saved === "NGN" ? saved : "NGN";
  });
  const [rate, setRate] = useState(RATE_DEFAULT);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [doneOpen, setDoneOpen] = useState(false);
  const [popup, setPopup] = useState<"tg" | "task" | null>(null);
  const popupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [music, setMusic] = useState<Song | null>(null);
  const [busyShare, setBusyShare] = useState<string | null>(null);
  const [musicMeta, setMusicMeta] = useState<Record<string, { url: string; art: string }>>({});
  const audio = useRef<HTMLAudioElement | null>(null);

  // Alternating nag popups (nextel-bobby logic): Telegram first, then the daily
  // task popup 13s after each close — but only while today's tasks aren't done.
  const queuePopup = (kind: "tg" | "task", ms: number) => {
    if (popupTimer.current) clearTimeout(popupTimer.current);
    popupTimer.current = setTimeout(() => setPopup(kind), ms);
  };
  useEffect(() => {
    if (allDone) {
      if (popupTimer.current) clearTimeout(popupTimer.current);
      return;
    }
    const t = setTimeout(() => setPopup("tg"), 1600);
    return () => clearTimeout(t);
  }, [allDone]);
  useEffect(() => () => { if (popupTimer.current) clearTimeout(popupTimer.current); }, []);
  const closeTelegram = () => {
    setPopup(null);
    if (!allDone) queuePopup("task", 13000);
  };
  const closeTask = () => {
    setPopup(null);
    if (!allDone) queuePopup("tg", 13000);
  };
  const goTask = () => {
    closeTask();
    setTimeout(() => document.getElementById("claimSection")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };
  const tgUrl = tgLink || "https://t.me/bobbysupport";

  // Prefetch today's track previews + artwork on load (like princess loadMusicUrls),
  // so opening a song plays ONE chosen source instead of swapping audio mid-play.
  useEffect(() => {
    let alive = true;
    Promise.all(
      songs.map(async (s) => {
        try {
          const res = await fetch("https://itunes.apple.com/search?term=" + encodeURIComponent(s.term) + "&entity=song&limit=1");
          const j = await res.json();
          const r = j?.results?.[0];
          return { id: s.id, url: r?.previewUrl || "", art: r?.artworkUrl100 ? r.artworkUrl100.replace("/100x100bb.jpg", "/300x300bb.jpg") : "" };
        } catch {
          return { id: s.id, url: "", art: "" };
        }
      })
    ).then((list) => {
      if (!alive) return;
      const m: Record<string, { url: string; art: string }> = {};
      list.forEach((x) => (m[x.id] = x));
      setMusicMeta(m);
    });
    return () => { alive = false; };
  }, [day, songs]);

  useEffect(() => {
    fetch("https://open.er-api.com/v6/latest/GBP")
      .then((r) => r.json())
      .then((d) => d?.rates?.NGN && setRate(d.rates.NGN))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const all = claimedShares === SHARES.length && playedSongs === songs.length;
    if (all && (claimedShares > 0 || playedSongs > 0)) {
      const t = setTimeout(() => setDoneOpen(true), 700);
      return () => clearTimeout(t);
    }
  }, [claimedShares, playedSongs, songs.length]);

  const money = (n: number) =>
    currency === "GBP" ? "£" + (n / rate).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : fmt(n);
  const mask = () => (currency === "GBP" ? "£••••" : "₦••••");
  const amt = (n: number) => (hidden ? mask() : money(n));
  const bar = (v: number) => Math.min(100, Math.round((Number(v || 0) / 16000) * 100)) + "%";
  const total = user.wallets.total;

  const toggleCurrency = () => {
    const next = currency === "NGN" ? "GBP" : "NGN";
    setCurrency(next);
    localStorage.setItem("incossify_currency", next);
  };
  const go = (href: string) => { router.push(href); setMenuOpen(false); };
  const toggleMenu = () => setMenuOpen((o) => !o);
  const logout = async () => { try { await logoutAction(); } catch { /* redirect handled */ } };

  const claimShare = async (id: string, reward: number) => {
    setBusyShare(id);
    const r = await claimShareAction(user.uid, id);
    setBusyShare(null);
    if (r.error) toasts(r.error); else { toasts("+" + money(reward) + " claimed!"); router.refresh(); }
  };

  const finishSong = async () => {
    const r = await claimSongAction(user.uid);
    if (r.error) toasts(r.error);
    else toasts("+" + money(r.reward || 0) + " earned!");
    window.location.href = "/dashboard";
  };

  const openMusic = (song: Song) => { setMusic(song); setGateOpen(false); };
  const startTask = () => { if (!user.active) setGateOpen(true); };
  const quickAI = () => { if (!user.active) setGateOpen(true); else toasts("AI Auto is an active-member feature"); };

  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const growthLabel = user.active ? "APEX" : "FREE";
  const growthColor = user.active ? "#6ee7b7" : "#ff5b5b";

  return (
    <div className="phone">
      <div className="content">
        {/* Greeting */}
        <div className="greeting-row">
          <div className="greeting-left">
            <button className="menu-btn" aria-label="Menu" onClick={toggleMenu}>
              <svg width="18" height="14" viewBox="0 0 18 14" fill="none"><path d="M0 1H18M0 7H18M0 13H18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
            </button>
            <div className="greeting-text">
              <h1>{greet}, {user.firstName}</h1>
              <p>Let&apos;s grow your earnings today</p>
            </div>
          </div>
          <div className="greeting-right">
            <button className="bell-btn" aria-label="Notifications" onClick={() => toasts("No new notifications")}>
              <svg width="16" height="18" viewBox="0 0 16 18" fill="none"><path d="M8 1C5.5 1 3.5 3 3.5 5.5V8.5C3.5 9.5 3 10.3 2.3 11L1.5 12H14.5L13.7 11C13 10.3 12.5 9.5 12.5 8.5V5.5C12.5 3 10.5 1 8 1Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /><path d="M6 14.5C6.3 15.6 7.1 16.3 8 16.3C8.9 16.3 9.7 15.6 10 14.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
            </button>
            <div className="avatar">{user.initials}</div>
          </div>
        </div>

        {/* Balance */}
        <div className="balance-card">
          <div className="balance-top-row">
            <div className="balance-label">
              Total Balance
              <svg width="15" height="10" viewBox="0 0 15 10" fill="none"><path d="M0.5 5C0.5 5 3 0.5 7.5 0.5C12 0.5 14.5 5 14.5 5C14.5 5 12 9.5 7.5 9.5C3 9.5 0.5 5 0.5 5Z" stroke="white" strokeOpacity="0.75" strokeWidth="1.1" /><circle cx="7.5" cy="5" r="1.8" fill="white" fillOpacity="0.75" /></svg>
            </div>
            <button className="currency-pill" onClick={toggleCurrency} aria-label="Switch currency">
              <span>{currency}</span>
              <svg width="9" height="6" viewBox="0 0 9 6" fill="none"><path d="M1 1L4.5 5L8 1" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
          <div className="balance-mid-row">
            <div>
              <div className="balance-amount">{amt(total)}</div>
              <div className="balance-sub">{currency === "GBP" ? "≈ " + fmt(total) : "≈ £" + (total / rate).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
            <div className="coin-badge-wrap">
              <div className="coin-badge"><div className="coin"><span>{currency === "GBP" ? "£" : "₦"}</span></div></div>
              <div className="growth-pill" style={{ color: growthColor }}>{growthLabel}</div>
            </div>
          </div>
          <div className="balance-actions">
            <button className="balance-btn" onClick={() => setHidden((h) => !h)}>
              <svg width="16" height="14" viewBox="0 0 16 14" fill="none"><path d="M1 7C1 7 4 1.5 8 1.5C12 1.5 15 7 15 7C15 7 12 12.5 8 12.5C4 12.5 1 7 1 7Z" stroke="white" strokeWidth="1.3" /><circle cx="8" cy="7" r="2" stroke="white" strokeWidth="1.3" /></svg>
              <span>{hidden ? "Show Balance" : "Hide Balance"}</span>
            </button>
            <button className="balance-btn" onClick={() => { if (!user.active) setGateOpen(true); else toasts("Your account is already active"); }}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="6.8" stroke="white" strokeWidth="1.3" /><path d="M4.5 7.6L6.5 9.6L10.5 5.4" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span className="pkg-text">{user.active ? user.packageName : "Activate Package"}</span>
            </button>
          </div>
        </div>

        {/* Wallets */}
        <div className="section-head">
          <div className="section-title">My Wallets</div>
          <button className="view-all" onClick={() => go("/withdraw")}>View all</button>
        </div>
        <div className="wallets-row">
          <div className="wallet-card">
            <div className="wallet-icon shares">
              <svg width="17" height="14" viewBox="0 0 17 14" fill="none"><circle cx="5.5" cy="4" r="2.4" stroke="currentColor" strokeWidth="1.3" /><circle cx="12" cy="4" r="2" stroke="currentColor" strokeWidth="1.3" /><path d="M1 12.5C1 9.7 3 8 5.5 8C8 8 10 9.7 10 12.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /><path d="M10.5 8.3C12.5 8.5 14.5 9.9 14.5 12.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
            </div>
            <div className="wallet-mid"><div className="wallet-name">Shares Wallet</div><div className="wallet-amount">{amt(user.wallets.shares)}</div></div>
            <div className="wallet-bar shares"><span style={{ width: bar(user.wallets.shares) }}></span></div>
          </div>
          <div className="wallet-card">
            <div className="wallet-icon rewards">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="6" width="14" height="9" rx="1" stroke="currentColor" strokeWidth="1.3" /><rect x="0.5" y="3.5" width="15" height="3" rx="1" stroke="currentColor" strokeWidth="1.3" /><path d="M8 3.5V15" stroke="currentColor" strokeWidth="1.3" /><path d="M8 3.5C8 3.5 5.5 3.5 5 2C4.7 1.1 5.4 0.5 6.2 0.7C7.5 1 8 3.5 8 3.5Z" stroke="currentColor" strokeWidth="1.1" /><path d="M8 3.5C8 3.5 10.5 3.5 11 2C11.3 1.1 10.6 0.5 9.8 0.7C8.5 1 8 3.5 8 3.5Z" stroke="currentColor" strokeWidth="1.1" /></svg>
            </div>
            <div className="wallet-mid"><div className="wallet-name">Music Wallet</div><div className="wallet-amount">{amt(user.wallets.rewards)}</div></div>
            <div className="wallet-bar rewards"><span style={{ width: bar(user.wallets.rewards) }}></span></div>
          </div>
        </div>

        <button className="wallet-withdraw" onClick={() => go("/withdraw")}>
          <svg width="17" height="14" viewBox="0 0 17 14" fill="none"><rect x="1" y="3" width="15" height="10" rx="2" stroke="white" strokeWidth="1.4" /><path d="M1 6H16" stroke="white" strokeWidth="1.4" /><circle cx="12.5" cy="9.5" r="1" fill="white" /></svg>
          Withdraw
        </button>

        {/* Quick actions */}
        <div className="section-head" style={{ marginBottom: 16 }}>
          <div className="section-title">Quick Actions</div>
        </div>
        <div className="quick-actions-row">
          <button className="quick-action" onClick={() => document.getElementById("claimSection")?.scrollIntoView({ behavior: "smooth" })}>
            <div className="quick-action-icon tasks"><svg width="19" height="19" viewBox="0 0 19 19" fill="none"><rect x="1" y="1" width="17" height="17" rx="4" stroke="white" strokeWidth="1.4" /><path d="M5.5 9.5L8 12L13.5 6.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
            <div className="quick-action-label">Daily Task</div>
          </button>
          <button className="quick-action" onClick={quickAI}>
            <div className="quick-action-icon ai"><svg width="19" height="18" viewBox="0 0 19 18" fill="none"><rect x="5" y="4" width="9" height="8" rx="2.5" stroke="white" strokeWidth="1.4" /><circle cx="7.7" cy="7.8" r="0.9" fill="white" /><circle cx="11.3" cy="7.8" r="0.9" fill="white" /><path d="M9.5 4V1.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" /><path d="M5 8H2.5M14 8H16.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" /></svg></div>
            <div className="quick-action-label">AI Auto</div>
          </button>
          <button className="quick-action" onClick={() => document.getElementById("musicSection")?.scrollIntoView({ behavior: "smooth" })}>
            <div className="quick-action-icon gaming"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg></div>
            <div className="quick-action-label">Music</div>
          </button>
          <button className="quick-action" onClick={() => go("/withdraw")}>
            <div className="quick-action-icon market"><svg width="17" height="14" viewBox="0 0 17 14" fill="none"><rect x="1" y="3" width="15" height="10" rx="2" stroke="white" strokeWidth="1.4" /><path d="M1 6H16" stroke="white" strokeWidth="1.4" /><circle cx="12.5" cy="9.5" r="1" fill="white" /></svg></div>
            <div className="quick-action-label">Withdraw</div>
          </button>
          <button className="quick-action" onClick={() => go("/profile")}>
            <div className="quick-action-icon invite"><svg width="14" height="16" viewBox="0 0 14 16" fill="none"><circle cx="7" cy="4" r="3.2" stroke="white" strokeWidth="1.4" /><path d="M1 15C1 11.5 3.5 9.5 7 9.5C10.5 9.5 13 11.5 13 15" stroke="white" strokeWidth="1.4" strokeLinecap="round" /></svg></div>
            <div className="quick-action-label">Profile</div>
          </button>
        </div>

        {/* Daily Tasks */}
        <div className="dash-section" id="tasksSection">
          <div className="section-head"><div className="section-title" style={{ fontSize: 16 }}>Daily Tasks</div></div>
          <div className="task-stack">
            <button className="task-card" onClick={startTask} type="button">
              <span className="task-ic"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg></span>
              <span className="task-info"><span className="desc">Inn Task</span><span className="sub">Claim 100 shares at once</span></span>
              <span className="task-reward">{fmt(50000)}<span className="start-hint">Start →</span></span>
            </button>
            <button className="task-card" onClick={startTask} type="button">
              <span className="task-ic"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg></span>
              <span className="task-info"><span className="desc">Listening to Music</span><span className="sub">Music stream bonus</span></span>
              <span className="task-reward">{fmt(5000)}<span className="start-hint">Start →</span></span>
            </button>
          </div>
        </div>

        {/* Claim & Earn */}
        <div className="dash-section" id="claimSection">
          <div className="section-head"><div className="section-title" style={{ fontSize: 16 }}>Claim &amp; Earn</div></div>
          <div id="sharesList">
            {SHARES.map((s) => {
              const done = status(s.id) === "completed";
              return (
                <div className="music-card" key={s.id}>
                  <div className="music-cover fallback">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ height: "1.25rem", width: "1.25rem" }}><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"></line><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"></line></svg>
                  </div>
                  <div className="music-info"><b>{s.label}</b><span>{s.sub}</span></div>
                  <button className={`music-play ${done ? "played" : ""}`} type="button" disabled={done || busyShare === s.id} onClick={() => claimShare(s.id, s.reward)}>
                    {done ? "Claimed ✓" : busyShare === s.id ? "…" : "Claim " + money(s.reward)}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Listen & Earn */}
        <div className="dash-section" id="musicSection">
          <div className="section-head"><div className="section-title" style={{ fontSize: 16 }}>Listen &amp; Earn</div></div>
          <div id="musicList">
            {songs.map((s) => {
              const done = status(s.id) === "completed";
              const meta = musicMeta[s.id];
              return (
                <div className="music-card" key={s.id}>
                  <div className={`music-cover ${meta?.art ? "" : "fallback"}`}>
                    {meta?.art
                      ? <img src={meta.art} alt={s.song} loading="lazy" />
                      : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ height: "1.25rem", width: "1.25rem" }}><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>}
                  </div>
                  <div className="music-info"><b>{s.artist}</b><span>{s.song}</span></div>
                  <button className={`music-play ${done ? "played" : ""}`} type="button" disabled={done} onClick={() => openMusic(s)}>
                    {done ? "Played ✓" : "Play " + money(SONG_REWARD)}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Activate FAB */}
      {!user.active && (
        <button className="gift-fab" onClick={() => setGateOpen(true)} aria-label="Activate your account">
          <svg width="26" height="24" viewBox="0 0 26 24" fill="none"><rect x="2" y="9" width="22" height="14" rx="1.5" stroke="white" strokeWidth="1.6" /><rect x="1" y="5" width="24" height="5" rx="1.2" stroke="white" strokeWidth="1.6" /><path d="M13 5V23" stroke="white" strokeWidth="1.6" /><path d="M13 5C13 5 8.5 5 7.5 2.7C6.9 1.3 8 0.2 9.3 0.6C11.5 1.2 13 5 13 5Z" stroke="white" strokeWidth="1.3" /><path d="M13 5C13 5 17.5 5 18.5 2.7C19.1 1.3 18 0.2 16.7 0.6C14.5 1.2 13 5 13 5Z" stroke="white" strokeWidth="1.3" /></svg>
        </button>
      )}

      {/* Bottom nav */}
      <nav className="bottom-nav">
        <ul>
          <li><Link href="/dashboard" className="active"><span className="nav-ic"><NavIco d="M3 10.5 12 3l9 7.5" extra="M5 9.5V21h14V9.5" /></span>Home</Link></li>
          <li><Link href="/withdraw"><span className="nav-ic"><NavIco rect="3,6,18,14,3" d="M3 10h18" /></span>Withdraw</Link></li>
          <li><Link href="/profile"><span className="nav-ic"><NavIco circle="12,8,4" d="M4 21c0-4 4-6 8-6s8 2 8 6" /></span>Profile</Link></li>
        </ul>
      </nav>

      {/* Menu sheet */}
      {menuOpen && (
        <div id="menuSheet" style={{ display: "block" }}>
          <div className="menu-backdrop" onClick={() => setMenuOpen(false)}></div>
          <div className="menu-card">
            <button className="menu-item" onClick={() => go("/dashboard")}><MenuIc d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /> Dashboard</button>
            <button className="menu-item" onClick={() => go("/tasks")}><MenuIc d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" circle /> Daily Tasks</button>
            <button className="menu-item" onClick={() => go("/withdraw")}><MenuIc d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" /> Withdraw</button>
            <button className="menu-item" onClick={() => go("/profile")}><MenuIc d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" circle /> My Profile</button>
            <button className="menu-item danger" onClick={logout}><MenuIc d="M10 17l5-5-5-5v3H3v4h7v3z" /> Log Out</button>
          </div>
        </div>
      )}

      {/* Activate gate */}
      {gateOpen && !music && (
        <div className="gate">
          <div className="box">
            <div className="big">⚡</div>
            <h2>Activate your account</h2>
            <p>Unlock withdrawals and full daily earning by choosing your package.</p>
            <Link href="/payment" className="btn">Activate Now</Link>
            <button className="ghost" type="button" onClick={() => setGateOpen(false)}>Go Back</button>
          </div>
        </div>
      )}

      {/* Done modal */}
      {doneOpen && (
        <div id="doneModal" className="active">
          <div className="done-box">
            <div className="done-ic"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ height: "1.5rem", width: "1.5rem" }}><path d="M20 6 9 17l-5-5"></path></svg></div>
            <h3>All tasks completed for today!</h3>
            <p>You have completed the free tasks for the day. Come back tomorrow, or activate your account to keep earning.</p>
            <button id="doneOk" onClick={() => setDoneOpen(false)}>OK</button>
            {!user.active && <button id="doneActivate" onClick={() => go("/payment")}>Activate your account</button>}
          </div>
        </div>
      )}

      {/* Music modal */}
      {music && (
        <MusicModal song={music} reward={SONG_REWARD} money={money} url={musicMeta[music.id]?.url || ""} art={musicMeta[music.id]?.art || ""} onClose={() => { setMusic(null); }} onClaim={finishSong} />
      )}

      {/* Join Telegram popup */}
      {popup === "tg" && !allDone && (
        <div className="inc-pop">
          <div className="inc-pop-card">
            <button className="inc-pop-close" type="button" aria-label="Close" onClick={closeTelegram}>&times;</button>
            <div className="inc-pop-icon tg">
              <svg viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
            </div>
            <h3>Join our Official Telegram channel!</h3>
            <p>Get real time updates, video tutorials, and insider strategies to boost your earnings!</p>
            <a className="inc-pop-cta" href={tgUrl} target="_blank" rel="noopener noreferrer">
              <span>CLICK HERE</span>
              <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </a>
          </div>
        </div>
      )}

      {/* Complete daily tasks popup */}
      {popup === "task" && !allDone && (
        <div className="inc-pop">
          <div className="inc-pop-card">
            <button className="inc-pop-close" type="button" aria-label="Close" onClick={closeTask}>&times;</button>
            <div className="inc-pop-icon task">
              <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="2" /><path d="M8 3v4M16 3v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M8 14l2.5 2.5L16 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <h3>Complete your daily tasks</h3>
            <p>Claim your shares and play today&apos;s songs to keep your earnings active. Finish your tasks now — it only takes a few minutes.</p>
            <button className="inc-pop-cta" type="button" onClick={goTask}>
              <span>GO TO TASK</span>
              <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function NavIco({ d, extra, circle, rect }: { d: string; extra?: string; circle?: string; rect?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {rect && <rect x={rect.split(",")[0]} y={rect.split(",")[1]} width={rect.split(",")[2]} height={rect.split(",")[3]} rx={rect.split(",")[4]} />}
      {circle && <circle cx={circle.split(",")[0]} cy={circle.split(",")[1]} r={circle.split(",")[2]} />}
      <path d={d} />
      {extra && <path d={extra} />}
    </svg>
  );
}

function MenuIc({ d, circle }: { d: string; circle?: boolean }) {
  return <svg width="18" height="18" fill="var(--purple-2)" viewBox="0 0 24 24"><path d={d} />{circle ? <circle cx="9" cy="7" r="4" /> : null}</svg>;
}

function MusicModal({ song, reward, money, url, art, onClose, onClaim }: { song: Song; reward: number; money: (n: number) => string; url: string; art: string; onClose: () => void; onClaim: () => Promise<void> }) {
  const [earn, setEarn] = useState(0);
  const [earnVisible, setEarnVisible] = useState(false);
  const [pct, setPct] = useState(0);
  const [remain, setRemain] = useState(12);
  const [done, setDone] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  const started = useRef(false);

  const SHOW_AT = 3500; // ms until the earnings counter appears
  const EARN_WINDOW = 8000; // ms the counter counts up
  const TOTAL = SHOW_AT + EARN_WINDOW; // 11.5s per song

  // Play ONE source chosen up front — the real preview if we already have it,
  // otherwise the bundled sample. Never swap mid-play (princess behaviour).
  useEffect(() => {
    if (!audio.current || started.current) return;
    started.current = true;
    audio.current.src = url || "/music-sample.mpeg";
    audio.current.load();
    audio.current.play().catch(() => {});
  }, [url]);

  // Smooth timeline driven by elapsed time: bar fills to 100% exactly when the
  // session ends and the earnings counter reaches the full reward.
  useEffect(() => {
    let raf = 0;
    const start = Date.now();
    const frame = () => {
      const elapsed = Date.now() - start;
      setPct(Math.min(100, (elapsed / TOTAL) * 100));
      setRemain(Math.max(0, Math.ceil((TOTAL - elapsed) / 1000)));
      if (elapsed >= SHOW_AT) {
        setEarnVisible(true);
        setEarn(Math.min(reward, Math.floor(((elapsed - SHOW_AT) / EARN_WINDOW) * reward)));
      }
      if (elapsed >= TOTAL) {
        setEarn(reward);
        setDone(true);
        audio.current?.pause();
        return;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [SHOW_AT, EARN_WINDOW, TOTAL, reward]);

  const fmtTime = (s: number) => Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");

  return (
    <div id="taskModal" className="active">
      <div className="tm-inner">
        <div className="tm-top">
          <button type="button" aria-label="Close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"></path></svg>
          </button>
          <div className="tm-signal"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18l6-6 4 4 8-8"></path></svg><span>Incossify Music</span></div>
        </div>
        <div id="tmMusicView" style={{ display: "block" }}>
          <div className="tm-art">{art ? <img src={art} alt={song.song} /> : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>}</div>
          <h2>{song.song}</h2>
          <p id="tmArtist">{song.artist}</p>
          <div className="tm-progress"><div className="tm-progress-bar" style={{ width: pct + "%" }}></div></div>
          <div className="tm-time-row"><span>{done ? "Complete" : "Listening…"}</span><span>{fmtTime(remain)}</span></div>
          <audio ref={audio} preload="auto" playsInline />
          <div className="tm-earn" style={{ display: earnVisible ? "block" : "none" }}><span>Earnings</span><strong>{money(earn)}</strong></div>
        </div>
        <div className="tm-actions">
          <button className={`tm-end ${done ? "done" : ""}`} type="button" onClick={() => (done ? onClaim() : onClose())}>{done ? "Done" : "End"}</button>
        </div>
      </div>
    </div>
  );
}
