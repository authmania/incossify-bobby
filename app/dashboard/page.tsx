import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { BASE_URL, loadConfig } from "@/lib/config";
import { todayKey } from "@/lib/data";
import { DashboardClient } from "@/components/dashboard";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const config = await loadConfig();

  const day = todayKey();
  const ledger = user.ledger?.[day] || {};

  const initials = user.fullName
    .trim().split(/\s+/).filter(Boolean)
    .map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";

  return (
    <DashboardClient
      user={{
        uid: user.uid,
        fullName: user.fullName,
        firstName: user.fullName.trim().split(/\s+/)[0] || "Member",
        initials,
        username: user.username,
        referralCode: user.referralCode,
        referralUrl: `${BASE_URL}/register?ref=${user.referralCode}`,
        pkg: user.pkg,
        packageName: user.packageName,
        active: !!user.activatedAt,
        wallets: {
          total: user.wallets?.total || 0,
          shares: user.wallets?.shares || 0,
          rewards: user.wallets?.rewards || 0,
        },
      }}
      tgLink={config.telegramLink || config.supportTelegram}
      day={day}
      ledger={ledger}
    />
  );
}
