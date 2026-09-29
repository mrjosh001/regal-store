"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function OrdersContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status") || "all";

  return (
    <div className="min-h-screen bg-brand-surface">
      <div className="bg-white border-b border-black/5 sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center">
          <Link href="/account" className="text-sm text-black/50 hover:text-brand-blue">
            ← Back
          </Link>
          <span className="ml-4 font-semibold text-sm text-brand-black capitalize">
            {status.replace("-", " ")} Orders
          </span>
        </div>
      </div>
      <main className="max-w-lg mx-auto px-4 py-12 text-center">
        <p className="text-black/40 text-sm mb-2">No orders in this status yet</p>
        <p className="text-black/30 text-xs mb-6">
          When you place orders they will appear here.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-brand-blue text-white text-sm font-medium rounded-full"
        >
          Start Shopping
        </Link>
      </main>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-brand-surface">
          <p className="text-black/40">Loading orders...</p>
        </div>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}
