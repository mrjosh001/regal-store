"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { whatsappLink } from "@/lib/whatsapp";

export default function CustomOrderPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [details, setDetails] = useState("");
  const [configError, setConfigError] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const message = `Hi Regal Store! Custom order request:\n\nName: ${name.trim()}\nPhone: ${phone.trim()}\n\nWhat I want:\n${details.trim()}`;
    const link = whatsappLink(message);

    if (!link) {
      setConfigError(true);
      return;
    }

    setConfigError(false);
    window.open(link, "_blank", "noopener,noreferrer");
  }

  const inputClass = "w-full rounded-xl border border-black/[.09] bg-[#f5f5f7] px-4 py-3.5 text-base text-[#1d1d1f] placeholder:text-black/35 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10";

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f5f7]">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 sm:py-16">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-black/[.06] bg-white shadow-[0_25px_80px_-45px_rgba(20,30,50,.25)] md:grid-cols-[.8fr_1.2fr]">
          <aside className="relative overflow-hidden bg-[#1d1d1f] p-7 text-white sm:p-10 md:p-12">
            <div className="pointer-events-none absolute -right-20 -top-16 h-56 w-56 rounded-full bg-blue-500/30 blur-3xl" />
            <div className="relative">
              <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-white/75 hover:text-white">← Back to store</Link>
              <p className="mt-12 text-xs font-semibold uppercase tracking-[.2em] text-blue-300">Personal sourcing</p>
              <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-[-.04em] sm:text-4xl">Tell us what you’re looking for.</h1>
              <p className="mt-5 text-sm leading-7 text-white/65">A product you saw online, a particular size, colour or model — share the details and we’ll help you check the options.</p>
              <div className="mt-10 space-y-4 text-sm text-white/80">
                <p className="flex items-start gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-blue-200">1</span><span>Describe the item or paste a product link.</span></p>
                <p className="flex items-start gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-blue-200">2</span><span>We’ll review the request and availability.</span></p>
                <p className="flex items-start gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-blue-200">3</span><span>Confirm the details before making a payment.</span></p>
              </div>
            </div>
          </aside>

          <section className="p-6 sm:p-10 md:p-12">
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-brand-blue">Custom order</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-.04em] text-[#1d1d1f]">Make a request</h2>
            <p className="mt-2 text-sm leading-6 text-black/50">Add enough detail for us to understand exactly what you need.</p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div>
                <label htmlFor="custom-name" className="mb-2 block text-sm font-semibold text-[#1d1d1f]">Your name</label>
                <input id="custom-name" type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" required className={inputClass} />
              </div>
              <div>
                <label htmlFor="custom-phone" className="mb-2 block text-sm font-semibold text-[#1d1d1f]">Your phone number</label>
                <input id="custom-phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08012345678" required className={inputClass} />
              </div>
              <div>
                <label htmlFor="custom-details" className="mb-2 block text-sm font-semibold text-[#1d1d1f]">What would you like?</label>
                <textarea id="custom-details" rows={5} value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Product name, brand, size, colour, budget or product link…" required className={`${inputClass} resize-y`} />
              </div>

              {configError && (
                <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
                  WhatsApp ordering is not configured yet. Your request has not been sent. Please contact the store through its published contact channel or try again later.
                </p>
              )}

              <button type="submit" className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3.5 font-semibold text-white hover:bg-[#1da851]">
                Continue to WhatsApp <span aria-hidden="true">↗</span>
              </button>
              <p className="text-center text-xs leading-5 text-black/40">Your message opens in WhatsApp for you to review and send.</p>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
