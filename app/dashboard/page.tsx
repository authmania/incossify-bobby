import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { DashboardClient } from "@/components/dashboard";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const snapshot = {
    uid: user.uid,
    fullName: user.fullName,
    firstName: user.fullName.split(" ")[0] || "Friend",
    username: user.username,
    referralCode: user.referralCode,
    pkg: user.pkg,
    packageName: user.packageName,
    active: !!user.activatedAt,
    wallets: {
      total: user.wallets?.total || 0,
      shares: user.wallets?.shares || 0,
      rewards: user.wallets?.rewards || 0,
      task: user.wallets?.task || 0,
    },
    bankSaved: !!(user.bank?.accountName),
  };

  return <DashboardClient user={snapshot} />;
}
