import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/firebase-admin";
import { ReceiptView } from "@/components/receipt";

export default async function ReceiptPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const snap = await db.collection("withdrawals").where("uid", "==", user.uid).orderBy("date", "desc").limit(1).get();
  type ReceiptData = {
    id: string; amount: number; bankName: string; accountName: string;
    accountNumber: string; status: string; date: string;
  } | null;
  let receipt: ReceiptData = null;
  if (!snap.empty) {
    const d = snap.docs[0].data();
    receipt = {
      id: d.id,
      amount: d.amount,
      bankName: d.bankName,
      accountName: d.accountName,
      accountNumber: d.accountNumber,
      status: d.status,
      date: d.date instanceof Date ? d.date.toISOString() : new Date(d.date?.seconds ? d.date.seconds * 1000 : d.date).toISOString(),
    };
  }
  return <ReceiptView receipt={receipt} />;
}
