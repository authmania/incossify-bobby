import { AuthShell, RegisterForm } from "@/components/auth-ui";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const pkg = typeof sp?.package === "string" && (sp.package === "starterkit" || sp.package === "apex") ? sp.package : null;
  return (
    <AuthShell maxWidth="32rem">
      <RegisterForm pkg={pkg} />
    </AuthShell>
  );
}
