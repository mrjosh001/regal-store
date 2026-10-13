import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const siteUrl = "https://regal-store.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Regal Store | Clothing, Bags & Shoes in Nigeria",
    template: "%s | Regal Store",
  },
  description:
    "Explore clothing, bags and shoes at Regal Store. Contact us to confirm product availability and delivery options before payment.",
  openGraph: {
    type: "website",
    siteName: "Regal Store",
    title: "Regal Store | Clothing, Bags & Shoes in Nigeria",
    description:
      "Explore clothing, bags and shoes at Regal Store. Contact us to confirm product availability and delivery options before payment.",
    url: siteUrl,
  },
  twitter: {
    card: "summary",
    title: "Regal Store | Clothing, Bags & Shoes in Nigeria",
    description:
      "Explore clothing, bags and shoes at Regal Store. Contact us to confirm product availability and delivery options before payment.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-NG">
      <body className="antialiased">
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
