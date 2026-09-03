import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { BASE_URL } from "@/lib/config";
import { ProfileClient } from "@/components/profile";

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return (
    <ProfileClient
      uid={user.uid}
      fullName={user.fullName}
      username={user.username}
      email={user.email}
      referralCode={user.referralCode}
      referralUrl={`${BASE_URL}/register?ref=${user.referralCode}`}
      bank={user.bank}
      active={!!user.activatedAt}
      pkg={user.packageName}
    />
  );
}
