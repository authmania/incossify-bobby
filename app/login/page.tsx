import { redirect } from "next/navigation";
import { AuthShell, LoginForm } from "@/components/auth-ui";
import { getSessionUser } from "@/lib/auth";

export default async function LoginPage() {
  if (await getSessionUser()) redirect("/dashboard");
  return (
    <AuthShell>
      <LoginForm />
    </AuthShell>
  );
}
