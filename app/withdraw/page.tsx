import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { MIN_WITHDRAWAL } from "@/lib/config";
import { WithdrawClient } from "@/components/withdraw";

export default async function WithdrawPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return (
    <WithdrawClient
      uid={user.uid}
      total={user.wallets?.total || 0}
      active={!!user.activatedAt}
      min={MIN_WITHDRAWAL}
      bankSaved={!!(user.bank?.accountNumber)}
      bank={user.bank}
    />
  );
}
