import { redirect } from "next/navigation";
import { doc, updateDoc } from "firebase/firestore";
import { getSessionUser } from "@/lib/auth";
import { loadConfig, PACKAGES } from "@/lib/config";
import { db } from "@/lib/firebase";
import { PaymentClient } from "@/components/payment";

export const dynamic = "force-dynamic";

export default async function PaymentPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const active = !!user.activatedAt;
  const config = await loadConfig();

  // When payment links are enabled, payment happens on the external checkout —
  // never lead an inactive user through the bank-transfer page.
  if (!active && config.usePaymentLink && config.paymentLink2) {
    try {
      await updateDoc(doc(db, "users", user.uid), {
        pkg: "apex",
        packageName: PACKAGES.apex.name,
      });
    } catch (e) {
      console.error("record apex before checkout failed", e);
    }
    redirect(config.paymentLink2);
  }

  const bankReady = !!(config.bankName && config.accountName && config.accountNumber);

  return (
    <PaymentClient
      uid={user.uid}
      fullName={user.fullName}
      paymentReference={user.paymentReference}
      packageName={user.packageName}
      active={!!user.activatedAt}
      packages={[
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
