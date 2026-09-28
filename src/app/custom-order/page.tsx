"use client";

import { useState } from "react";
import Link from "next/link";

export default function CustomOrderPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [details, setDetails] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const message = encodeURIComponent(
      `Hi Regal Store! Custom order request:\n\nName: ${name}\nPhone: ${phone}\n\nWhat I want:\n${details}`
    );
    window.open(`https://wa.me/234?text=${message}`, "_blank");
  }

  return (
    <div className="min-h-screen bg-brand-surface flex flex-col">
      <header className="border-b border-black/5 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-brand-blue rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="text-xl font-semibold tracking-tight text-brand-black">
                Regal Store
              </span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg bg-white rounded-2xl border border-black/5 p-8 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight mb-2 text-center text-brand-black">
            Request a Custom Order
          </h1>
          <p className="text-black/50 text-sm text-center mb-8">
            Can&apos;t find what you want? Send us the details and we&apos;ll source it for you.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-brand-black">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                required
                className="w-full px-4 py-3 rounded-xl border border-black/10 bg-brand-surface text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue/40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-brand-black">
                WhatsApp / Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08012345678"
                required
                className="w-full px-4 py-3 rounded-xl border border-black/10 bg-brand-surface text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue/40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-brand-black">
                What do you want?
              </label>
              <textarea
                rows={4}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe the product, brand, size, color, or paste a link..."
                required
                className="w-full px-4 py-3 rounded-xl border border-black/10 bg-brand-surface text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue/40 resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 bg-[#25D366] text-white font-medium rounded-full hover:bg-[#1da851] transition-colors mt-2"
            >
              Send via WhatsApp
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link href="/" className="text-sm text-black/40 hover:text-brand-blue">
              ← Back to shop
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
