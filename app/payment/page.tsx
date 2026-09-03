import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { loadConfig, PACKAGES } from "@/lib/config";
import { PaymentClient } from "@/components/payment";

export default async function PaymentPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const config = await loadConfig();

  const bankReady = !!(config.bankName && config.accountName && config.accountNumber);

  return (
    <PaymentClient
      uid={user.uid}
      fullName={user.fullName}
      username={user.username}
      paymentReference={user.paymentReference}
      pkg={user.pkg}
      packageName={user.packageName}
      active={!!user.activatedAt}
      packages={[
        { id: "starterkit", name: PACKAGES.starterkit.name, price: PACKAGES.starterkit.price, daily: PACKAGES.starterkit.daily, popular: false },
        { id: "apex", name: PACKAGES.apex.name, price: PACKAGES.apex.price, daily: PACKAGES.apex.daily, popular: true },
      ]}
      bank={{ bankName: config.bankName, accountName: config.accountName, accountNumber: config.accountNumber }}
      bankReady={bankReady}
      socialLink={config.socialLink}
      telegramLink={config.telegramLink}
      whatsappLink={config.whatsappLink}
    />
  );
}
