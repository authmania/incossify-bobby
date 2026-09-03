"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell, LogoutButton } from "./app-shell";
import { Icon } from "./icons";
import { claimShareAction, claimSongAction } from "@/lib/actions";

type Snapshot = {
  uid: string;
  fullName: string;
  firstName: string;
  username: string;
  referralCode: string;
  pkg: string;
  packageName: string;
  active: boolean;
  wallets: { total: number; shares: number; rewards: number; task: number };
  bankSaved: boolean;
};

const SHARES = [
  { id: "sh1", title: "Inn Share 1", reward: 1000 },
  { id: "sh2", title: "Inn Share 2", reward: 1000 },
];
const SONG_SETS = [
  ["burnaboy", "davido", "wizkid", "rema"],
  ["asake", "ayra", "omah", "fireboy"],
  ["kizz", "ladipoe", "tiwa", "simi"],
  ["sosmusic", "timaya", "phyno", "joeboy"],
];
const GBP_RATE = 1846.279333;

function toast(msg: string) {
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2400);
}

function dayIndex() {
  return Math.floor(Date.now() / 86400000) % 4;
}

export function DashboardClient({ user }: { user: Snapshot }) {
  const router = useRouter();
  const [currency, setCurrency] = useState<"NGN" | "GBP">("NGN");
  const [rate, setRate] = useState(GBP_RATE);
  const [hide, setHide] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [musicIdx, setMusicIdx] = useState(-1);
  const [musicDone, setMusicDone] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch("https://open.er-api.com/v6/latest/GBP")
      .then((r) => r.json())
      .then((j) => j?.rates?.NGN && setRate(j.rates.NGN))
      .catch(() => {});
  }, []);

  const fmt = (n: number) =>
    currency === "GBP"
      ? "£" + (n / rate).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : "₦" + Number(n || 0).toLocaleString("en-NG");

  const toggleCurrency = () => setCurrency((c) => (c === "NGN" ? "GBP" : "NGN"));

  const refLink = `https://${typeof window !== "undefined" ? window.location.host : "incossify.com"}/register?ref=${user.referralCode}`;

  const copyReferral = async () => {
    try {
      await navigator.clipboard.writeText(refLink);
      toast("Referral link copied!");
    } catch {
      toast("Could not copy link");
    }
  };

  const doAction = async (fn: () => Promise<{ error?: string }>, id: string) => {
    setBusy(id);
    const res = await fn();
    if (res.error) toast(res.error);
    else router.refresh();
    setBusy(null);
  };

  const songs = SONG_SETS[dayIndex()];
  // Track completed via component-level for current visit (server re-sync on claim refresh)
  const [songPlayed, setSongPlayed] = useState<number[]>([]);

  const playSong = (i: number) => {
    setMusicDone(false);
    setMusicIdx(i);
  };

  const finishSong = async () => {
    setMusicDone(true);
    setMusicIdx(-1);
    setSongPlayed((p) => (p.includes(musicIdx) ? p : [...p, musicIdx]));
    await doAction(() => claimSongAction(user.uid), "song" + musicIdx);
  };

  const playableTotal = Math.min(songs.length, 4);

  return (
    <AppShell title="Dashboard" navActive="dashboard" trailing={<LogoutButton />}>
      <div className="balance-card">
        <div className="row">
          <span className="label">Total balance</span>
          <button className="currency-pill" onClick={toggleCurrency} aria-label="Toggle currency">
            <span>{currency}</span> <span style={{ opacity: 0.7 }}>⇅</span>
          </button>
        </div>
        <div className="balance-amount" style={{ filter: hide ? "blur(10px)" : "none" }}>
          {hide ? (currency === "GBP" ? "£••••" : "₦••••") : fmt(user.wallets.total)}
        </div>
        <div className="row">
          <span className="balance-sub">{currency === "GBP" ? fmt(user.wallets.total) : "≈ " + fmt(user.wallets.total)}</span>
          <span className="growth">{user.active ? `↑ ${user.packageName}` : "FREE"}</span>
        </div>
        <div className="balance-actions">
          <button className="frost" onClick={() => setHide((h) => !h)}>{hide ? "Show" : "Hide"}</button>
          <button className="frost" onClick={copyReferral}>Invite</button>
        </div>
      </div>

      <div className="wallets">
        {[
          { label: "Shares wallet", key: "shares", v: user.wallets.shares, bar: "linear-gradient(90deg,#7c3aed,#a855f7)" },
          { label: "Music wallet", key: "rewards", v: user.wallets.rewards, bar: "linear-gradient(90deg,#22d3ee,#a855f7)" },
        ].map((w) => (
          <div className="wallet card" key={w.key}>
            <div className="w-top">
              <div className="tile-ic" style={{ width: 34, height: 34, margin: 0 }}>
                <Icon name={w.key === "shares" ? "share" : "music"} cls="w-4 h-4" />
              </div>
              <span className="w-name">{w.label}</span>
            </div>
            <div className="w-amt" style={{ filter: hide ? "blur(8px)" : "none" }}>{fmt(w.v)}</div>
            <div className="wbar"><i style={{ width: `${Math.min(100, Math.round((w.v / 16000) * 100))}%`, background: w.bar }} /></div>
          </div>
        ))}
      </div>

      <div className="quick">
        {[
          { icon: "gift", label: "Invite", act: copyReferral, grad: "linear-gradient(135deg,#7c3aed,#ec4899)" },
          { icon: "clipboard", label: "Tasks", href: "/tasks", grad: "linear-gradient(135deg,#22d3ee,#7c3aed)" },
          { icon: "music", label: "Music", act: () => document.getElementById("musicSection")?.scrollIntoView({ behavior: "smooth" }), grad: "linear-gradient(135deg,#ec4899,#7c3aed)" },
          { icon: "withdraw", label: "Withdraw", href: "/withdraw", grad: "linear-gradient(135deg,#34d399,#22d3ee)" },
          { icon: "profile", label: "Profile", href: "/profile", grad: "linear-gradient(135deg,#a855f7,#22d3ee)" },
        ].map((a) => {
          const inner = (
            <>
              <span className="qa-ic" style={{ background: a.grad }}>
                <Icon name={a.icon} />
              </span>
              <span>{a.label}</span>
            </>
          );
          return a.href ? (
            <Link key={a.label} href={a.href} className="qa">{inner}</Link>
          ) : (
            <button key={a.label} className="qa" onClick={a.act}>{inner}</button>
          );
        })}
      </div>

      {!user.active && (
        <div className="card glass" style={{ margin: "16px 18px", display: "flex", alignItems: "center", gap: 14 }}>
          <div className="tile-ic"><Icon name="lock" /></div>
          <div style={{ flex: 1 }}>
            <b>Activate your account</b>
            <div className="small muted">Unlock withdrawals &amp; full daily earning.</div>
          </div>
          <Link href="/payment" className="btn btn-primary btn-sm">Activate</Link>
        </div>
      )}

      {/* Claim & Earn */}
      <div className="app-sec" id="claimSection">
        <h2>Claim &amp; Earn</h2>
        <p className="sub">Daily Inn shares you can claim instantly</p>
      </div>
      <div style={{ margin: "6px 18px", display: "grid", gap: 10 }}>
        {SHARES.map((s) => (
          <div className="card task-row" key={s.id}>
            <div className="ic" style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
              <Icon name="share" />
            </div>
            <div className="t">
              <b>{s.title}</b>
              <span>{fmt(s.reward)} daily</span>
            </div>
            <button
              className="btn btn-primary btn-sm btn-sm-reward"
              disabled={busy !== null}
              onClick={() => doAction(() => claimShareAction(user.uid, s.id), s.id)}
            >{busy === s.id ? "…" : `Claim ${currency === "GBP" ? "£" : "₦"}`}</button>
          </div>
        ))}
      </div>

      {/* Listen & Earn */}
      <div className="app-sec" id="musicSection">
        <h2>Listen &amp; Earn</h2>
        <p className="sub">Play today&apos;s tracks — {fmt(2000)} each, {playableTotal} a day</p>
      </div>
      <div style={{ margin: "6px 18px", display: "grid", gap: 10 }}>
        {songs.map((song, i) => {
          const played = songPlayed.includes(i);
          return (
            <div className="card task-row" key={song + i}>
              <div className="ic" style={{ background: played ? "rgba(52,211,153,0.2)" : "linear-gradient(135deg,#ec4899,#7c3aed)" }}>
                <Icon name="music" />
              </div>
              <div className="t">
                <b style={{ textTransform: "capitalize" }}>{song}</b>
                <span>{played ? "Earned today" : `Play to earn ${fmt(2000)}`}</span>
              </div>
              <button className={`btn ${played ? "btn-ghost" : "btn-primary"} btn-sm btn-sm-reward`} disabled={played || busy !== null} onClick={() => playSong(i)}>
                {played ? "Done" : "Play"}
              </button>
            </div>
          );
        })}
      </div>

      <Link href="/withdraw" className="btn btn-primary btn-block" style={{ margin: "18px auto", maxWidth: "calc(100% - 36px)" }}>
        <Icon name="withdraw" /> Withdraw funds
      </Link>

      {/* Music overlay */}
      {musicIdx >= 0 && (
        <MusicOverlay
          song={songs[musicIdx]}
          onDone={finishSong}
          onCancel={() => setMusicIdx(-1)}
          fmt={fmt}
        />
      )}
    </AppShell>
  );
}

function MusicOverlay({ song, onDone, onCancel, fmt }: { song: string; onDone: () => void; onCancel: () => void; fmt: (n: number) => string }) {
  const [art, setArt] = useState("");
  const [preview, setPreview] = useState("");
  const [playing, setPlaying] = useState(false);
  const [secs, setSecs] = useState(0);
  const audio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(song)}&entity=song&limit=1`)
      .then((r) => r.json())
      .then((j) => {
        const res = j?.results?.[0];
        if (!alive) return;
        setArt(res?.artworkUrl100?.replace("100x100bb", "300x300bb") || "");
        setPreview(res?.previewUrl || "");
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [song]);

  useEffect(() => {
    if (!audio.current) return;
    const onEnd = () => setSecs((s) => s + 1);
    audio.current.addEventListener("ended", onEnd);
    return () => audio.current?.removeEventListener("ended", onEnd);
  }, [preview]);

  useEffect(() => {
    if (playing) {
      const id = setInterval(() => {
        setSecs((s) => {
          if (s >= 3) {
            clearInterval(id);
            return s;
          }
          return s + 1;
        });
      }, 1000);
      return () => clearInterval(id);
    }
  }, [playing]);

  const done = secs >= 3;

  return (
    <div className="overlay">
      <div className="modal" style={{ textAlign: "center" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {art && <img src={art} alt="" style={{ width: 140, height: 140, borderRadius: 20, margin: "0 auto 18px" }} />}
        <h2 style={{ textTransform: "capitalize" }}>{song}</h2>
        <p>Keep listening to earn {fmt(2000)}.</p>
        <audio ref={audio} src={preview || "/music-sample.mpeg"} autoPlay onPlay={() => setPlaying(true)} onEnded={() => setPlaying(false)} />
        <div style={{ fontSize: "2.4rem", fontWeight: 800, fontFamily: "var(--font-display)", margin: "10px 0" }}>
          {done ? "✓" : `${Math.max(0, 3 - secs)}s`}
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel}>{done ? "Close" : "Cancel"}</button>
          <button className="btn btn-primary" disabled={!done} onClick={onDone}>{done ? "Claim & earn" : "Listen…"}</button>
        </div>
      </div>
    </div>
  );
}
