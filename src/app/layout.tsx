import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Regal Store",
  description: "Premium products delivered to your door. Nigeria's trusted import marketplace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-canvas-cream text-ink">
        {children}
      </body>
    </html>
  );
}