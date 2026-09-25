"use client";

import { useState } from "react";
import Link from "next/link";

export default function TrackPage() {
  const [code, setCode] = useState("");

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <div className="bg-white border-b border-black/5 sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center">
          <Link href="/account" className="text-sm text-black/50">← Back</Link>
          <span className="ml-4 font-semibold text-sm">Track Order</span>
        </div>
      </div>
      <main className="max-w-lg mx-auto px-4 py-10">
        <h1 className="text-xl font-semibold mb-2">Track your order</h1>
        <p className="text-sm text-black/40 mb-6">Enter your order code to see live status.</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="E.G. RGX1234"
            className="flex-1 px-4 py-3 rounded-xl border border-black/10 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
          />
          <button className="px-5 py-3 bg-black text-white text-sm font-medium rounded-xl">
            Track
          </button>
        </div>
        <p className="text-xs text-black/30 mt-4 text-center">Order tracking will be available once orders are active.</p>
      </main>
    </div>
  );
}
