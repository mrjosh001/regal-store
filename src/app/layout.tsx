import type { Metadata } from "next";
import "./globals.css";
import "./system-theme.css";
import BottomNav from "@/components/BottomNav";
import BrandRebrand from "@/components/BrandRebrand";
import AuthRedirectBridge from "@/components/AuthRedirectBridge";

const siteUrl = "https://regalsdrip.store";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Regal’s Drip | Clothing, Bags & Shoes in Nigeria",
    template: "%s | Regal’s Drip",
  },
  description: "Explore clothing, bags and shoes at Regal’s Drip. Contact us to confirm product availability and delivery options before payment.",
  icons: {
    icon: "/regals-drip-logo-round.svg",
    apple: "/regals-drip-logo-round.svg",
  },
  openGraph: {
    type: "website",
    siteName: "Regal’s Drip",
    title: "Regal’s Drip | Clothing, Bags & Shoes in Nigeria",
    description: "Explore clothing, bags and shoes at Regal’s Drip. Contact us to confirm product availability and delivery options before payment.",
    url: siteUrl,
  },
  twitter: {
    card: "summary",
    title: "Regal’s Drip | Clothing, Bags & Shoes in Nigeria",
    description: "Explore clothing, bags and shoes at Regal’s Drip. Contact us to confirm product availability and delivery options before payment.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-NG">
      <body className="antialiased">
        <AuthRedirectBridge />
        <BrandRebrand />
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
