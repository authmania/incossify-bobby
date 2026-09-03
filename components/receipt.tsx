"use client";

import Link from "next/link";
import { AppShell } from "./app-shell";

type ReceiptData = {
  id: string; amount: number; bankName: string; accountName: string;
  accountNumber: string; status: string; date: string;
} | null;

export function ReceiptView({ receipt }: { receipt: ReceiptData }) {
  const fmt = (n: number) => "₦" + Number(n || 0).toLocaleString("en-NG");
  const rows = receipt
    ? [
        ["Transaction ID", receipt.id],
        ["Reference Number", receipt.id],
        ["Amount", fmt(receipt.amount)],
        ["Wallet Used", "Total Balance"],
        ["Bank", receipt.bankName],
        ["Account Name", receipt.accountName],
        ["Account Number", receipt.accountNumber],
        ["Date", new Date(receipt.date).toLocaleString()],
        ["Status", receipt.status],
      ]
    : [];

  return (
    <AppShell title="Receipt" navActive="none">
      <div className="stat-card card" style={{ textAlign: "center" }}>
        {!receipt ? (
          <>
            <div style={{ fontSize: 40 }}>🧾</div>
            <h2 className="h2" style={{ margin: "10px 0" }}>No receipt yet</h2>
            <p className="small muted">Complete a withdrawal to see your receipt here.</p>
            <Link href="/withdraw" className="btn btn-primary btn-block" style={{ marginTop: 18 }}>Go to wallet</Link>
          </>
        ) : (
          <>
            <div className={`badge ${receipt.status === "Pending" ? "gold" : "green"}`} style={{ fontSize: 13, padding: "6px 14px" }}>
              {receipt.status}
            </div>
            <div style={{ fontSize: 44, margin: "12px 0" }}>💸</div>
            <div className="big-amount">{fmt(receipt.amount)}</div>
            <p className="small muted">Sent to {receipt.bankName} — {receipt.accountName}</p>
            <div className="divider" />
            {rows.map(([k, v]) => (
              <div className="kv" key={k}><span className="k">{k}</span><span className="v">{v}</span></div>
            ))}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 18 }}>
              <button className="btn btn-ghost" onClick={() => window.print()}>🖨 Print</button>
              <Link href="/withdraw" className="btn btn-primary">Done</Link>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
