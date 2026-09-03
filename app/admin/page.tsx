import { redirect } from "next/navigation";
import { adminAuthed, loadAppLinks } from "@/lib/admin";
import { loadConfig } from "@/lib/config";
import { AdminDashboard } from "@/components/admin";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await adminAuthed())) redirect("/admin/login");

  const [config, app] = await Promise.all([loadConfig(), loadAppLinks()]);

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
      app={{ cta: app.cta, telegramLink: app.telegramLink, telegramGroupLink: app.telegramGroupLink }}
    />
  );
}
