import { redirect } from "next/navigation";
import { getSessionUser, toDate } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { ReceiptView } from "@/components/receipt";

export default async function ReceiptPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const q = query(collection(db, "withdrawals"), where("uid", "==", user.uid));
  const snap = await getDocs(q);
  type ReceiptData = {
    id: string; amount: number; bankName: string; accountName: string;
    accountNumber: string; status: string; date: string;
  } | null;
  let receipt: ReceiptData = null;
  if (!snap.empty) {
    const rows = snap.docs.map((d) => ({ id: d.id, data: d.data() }));
    rows.sort((a, b) => toDate(b.data.date).getTime() - toDate(a.data.date).getTime());
    const latest = rows[0];
    receipt = {
      id: latest.id,
      amount: Number(latest.data.amount || 0),
      bankName: String(latest.data.bankName || ""),
      accountName: String(latest.data.accountName || ""),
      accountNumber: String(latest.data.accountNumber || ""),
      status: String(latest.data.status || "Pending"),
      date: toDate(latest.data.date).toISOString(),
    };
  }
  return <ReceiptView receipt={receipt} />;
}
