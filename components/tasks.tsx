"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "./app-shell";
import { Icon } from "./icons";
import { claimTaskAction, completeTaskAction } from "@/lib/actions";
import { TASK_CATALOG } from "@/lib/catalog";

export function TasksClient({
  uid, day, ledger, total,
}: { uid: string; day: string; ledger: Record<string, string>; total: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  const fmt = (n: number) => "₦" + Number(n).toLocaleString("en-NG");
  const state = (id: string) => ledger[id] || "available";

  const run = async (fn: () => Promise<{ error?: string }>, id: string) => {
    setBusy(id);
    const r = await fn();
    if (r.error) {
      alert(r.error);
    } else {
      router.refresh();
    }
    setBusy(null);
  };

  const earnedToday = TASK_CATALOG.filter((t) => state(t.id) === "completed").reduce((s, t) => s + t.reward, 0);
  const claimedToday = TASK_CATALOG.filter((t) => state(t.id) !== "available").length;
  const totalPossible = TASK_CATALOG.reduce((s, t) => s + t.reward, 0);

  return (
    <AppShell title="Daily tasks" backHref="/dashboard" navActive="none">
      <div className="stat-card card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="small muted">Earned today</div>
            <div className="big-amount">{fmt(earnedToday)}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="small muted">Progress</div>
            <div style={{ fontWeight: 800 }}>{claimedToday}/{TASK_CATALOG.length}</div>
          </div>
        </div>
        <div className="wbar" style={{ marginTop: 14 }}>
          <i style={{ width: `${Math.round((claimedToday / TASK_CATALOG.length) * 100)}%`, height: "100%", background: "linear-gradient(90deg,#7c3aed,#a855f7)" }} />
        </div>
      </div>

      <div style={{ margin: "12px 18px", display: "grid", gap: 10 }}>
        {TASK_CATALOG.map((t) => {
          const st = state(t.id);
          const badges: Record<string, [string, string]> = {
            available: ["Available", "gray"],
            claimed: ["Claimed", "violet"],
            completed: ["Completed", "green"],
          };
          const [label, tone] = badges[st] || badges.available;
          return (
            <div className="card task-row" key={t.id}>
              <div className="ic" style={{ background: "linear-gradient(135deg,#22d3ee,#7c3aed)" }}>
                <Icon name={t.icon} />
              </div>
              <div className="t">
                <b>{t.title}</b>
                <span>{fmt(t.reward)} · <span className={`badge ${tone}`}>{label}</span></span>
              </div>
              {st === "available" && (
                <button className="btn btn-primary btn-sm" disabled={!!busy} onClick={() => run(() => claimTaskAction(uid, t.id), t.id)}>
                  {busy === t.id ? "…" : "Claim"}
                </button>
              )}
              {st === "claimed" && (
                <button className="btn btn-ghost btn-sm" disabled={!!busy} onClick={() => run(() => completeTaskAction(uid, t.id), t.id)}>
                  {busy === t.id ? "…" : "Complete"}
                </button>
              )}
              {st === "completed" && (
                <span className="badge green" style={{ fontSize: 12 }}>✓</span>
              )}
            </div>
          );
        })}
      </div>
      <p className="small muted" style={{ textAlign: "center", margin: "6px 18px" }}>
        Up to {fmt(totalPossible)} per day from tasks alone.
      </p>
    </AppShell>
  );
}
