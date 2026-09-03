import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Incossify — Earn in British Pound & Kuwait Dinar",
  description: "Complete tasks, earn daily, and withdraw anytime. Join Incossify today.",
  icons: {
    icon: "/logo-CUooZ1Ch.png",
    shortcut: "/logo-CUooZ1Ch.png",
    apple: "/logo-CUooZ1Ch.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Sora:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
