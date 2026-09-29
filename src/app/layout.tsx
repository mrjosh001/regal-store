import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "Regal Store",
  description: "Premium products delivered across Nigeria",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased pb-16 md:pb-0">
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
