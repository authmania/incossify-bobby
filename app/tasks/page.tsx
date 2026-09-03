import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { todayKey } from "@/lib/data";
import { TasksClient } from "@/components/tasks";

export default async function TasksPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const day = todayKey();
  const ledger = user.ledger?.[day] || {};
  return <TasksClient uid={user.uid} day={day} ledger={ledger} total={user.wallets?.total || 0} />;
}
