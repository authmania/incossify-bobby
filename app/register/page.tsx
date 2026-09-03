import { AuthShell, RegisterForm } from "@/components/auth-ui";

export default function RegisterPage() {
  return (
    <AuthShell maxWidth="32rem">
      <RegisterForm pkg="apex" />
    </AuthShell>
  );
}
