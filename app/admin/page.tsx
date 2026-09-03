import { redirect } from "next/navigation";
import { adminAuthed, listUsers, listWithdrawals } from "@/lib/admin";
import { loadConfig } from "@/lib/config";
import { AdminDashboard } from "@/components/admin";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await adminAuthed())) redirect("/admin/login");

  const [config, users, withdrawals] = await Promise.all([loadConfig(), listUsers(400), listWithdrawals(300)]);

  const userRows = users.map((u) => ({
    uid: u.uid,
    fullName: u.fullName,
    username: u.username,
    email: u.email,
    pkg: u.pkg,
    packageName: u.packageName,
    activated: !!u.activatedAt,
    total: u.wallets?.total || 0,
    phone: u.phone,
    paymentReference: u.paymentReference,
    joined: u.joinedAt ? new Date(u.joinedAt).toISOString() : null,
  }));

  const wdRows = withdrawals.map((w) => ({
    id: w.id,
    uid: w.uid,
    amount: w.amount,
    bankName: w.bankName,
    accountName: w.accountName,
    accountNumber: w.accountNumber,
    status: w.status,
    date: w.date ? new Date(w.date).toISOString() : null,
  }));

  return (
    <AdminDashboard
      config={{
        bankName: config.bankName,
        accountName: config.accountName,
        accountNumber: config.accountNumber,
        paymentLink1: config.paymentLink1,
        paymentLink2: config.paymentLink2,
        usePaymentLink: config.usePaymentLink,
        telegramLink: config.telegramLink,
        whatsappLink: config.whatsappLink,
        socialLink: config.socialLink,
      }}
      users={userRows}
      withdrawals={wdRows}
    />
  );
}
