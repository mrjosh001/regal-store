import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const siteUrl = "https://regal-store.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Regal Store | Clothing & Footwear in Nigeria",
    template: "%s | Regal Store",
  },
  description:
    "Shop clothing and occasional footwear from Regal Store, with nationwide delivery across Nigeria.",
  openGraph: {
    type: "website",
    siteName: "Regal Store",
    title: "Regal Store | Clothing & Footwear in Nigeria",
    description:
      "Shop clothing and occasional footwear from Regal Store, with nationwide delivery across Nigeria.",
    url: siteUrl,
  },
  twitter: {
    card: "summary",
    title: "Regal Store | Clothing & Footwear in Nigeria",
    description:
      "Shop clothing and occasional footwear from Regal Store, with nationwide delivery across Nigeria.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-NG">
      <body className="antialiased pb-16 md:pb-0">
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
