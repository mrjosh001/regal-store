"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

type OrderItem = {
  id: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  size: string | null;
  color: string | null;
  selected_image_url: string | null;
  image_urls: string[];
};

type Order = {
  id: string;
  status: string;
  total: number;
  created_at: string;
  order_items: OrderItem[];
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(value);
}

function OrdersContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status") || "all";
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: auth } = await supabase.auth.getUser();
        if (!auth.user) throw new Error("Please sign in to view your orders.");
        const { data, error: queryError } = await supabase
          .from("orders")
          .select("id, status, total, created_at, order_items(id, product_name, unit_price, quantity, size, color, selected_image_url, image_urls)")
          .order("created_at", { ascending: false });
        if (queryError) throw queryError;
        if (!cancelled) setOrders((data || []) as Order[]);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load orders.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  const visibleOrders = status === "all" ? orders : orders.filter((order) => order.status === status);

  return (
    <div className="min-h-screen bg-brand-surface">
      <div className="sticky top-0 z-40 border-b border-black/5 bg-white">
        <div className="mx-auto flex h-14 max-w-2xl items-center px-4">
          <Link href="/account" className="text-sm text-black/50 hover:text-brand-blue">← Back</Link>
          <span className="ml-4 text-sm font-semibold text-brand-black">{status === "all" ? "Orders" : `${status.replace("_", " ")} Orders`}</span>
        </div>
      </div>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        {loading ? <p className="py-12 text-center text-sm text-black/45">Loading your orders…</p> : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">{error}</div>
        ) : visibleOrders.length === 0 ? (
          <div className="py-12 text-center"><p className="mb-2 text-sm text-black/50">No orders in this status yet.</p><p className="mb-6 text-xs text-black/35">When you start an order through WhatsApp, it will appear here with its product photos and selected options.</p><Link href="/" className="inline-block rounded-full bg-brand-blue px-6 py-3 text-sm font-medium text-white">Start Shopping</Link></div>
        ) : (
          <div className="space-y-5">
            {visibleOrders.map((order) => (
              <article key={order.id} className="overflow-hidden rounded-3xl border border-black/[.06] bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-black/[.06] pb-4">
                  <div><p className="text-xs uppercase tracking-wider text-black/40">Order started</p><p className="mt-1 text-sm font-semibold text-brand-black">{new Date(order.created_at).toLocaleString()}</p></div>
                  <div className="text-right"><span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900">{order.status.replaceAll("_", " ")}</span><p className="mt-2 text-lg font-semibold text-brand-black">{formatPrice(order.total)}</p></div>
                </div>

                <div className="mt-4 space-y-4">
                  {order.order_items.map((item) => {
                    const images = [...new Set([...(item.image_urls || []), ...(item.selected_image_url ? [item.selected_image_url] : [])])];
                    return (
                      <div key={item.id} className="rounded-2xl bg-[#f7f5f0] p-3">
                        <div className="flex gap-3">
                          <div className="flex shrink-0 gap-2 overflow-x-auto">
                            {images.length ? images.map((image, index) => (
                              <div key={`${image}-${index}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white">
                                <Image src={image} alt={`${item.product_name} photo ${index + 1}`} fill className="object-cover" sizes="80px" unoptimized />
                              </div>
                            )) : <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-white text-xs text-black/35">No image</div>}
                          </div>
                          <div className="min-w-0 flex-1"><p className="font-semibold text-brand-black">{item.product_name}</p><p className="mt-1 text-sm text-black/55">{item.quantity} × {formatPrice(item.unit_price)}</p>{(item.size || item.color) && <p className="mt-1 text-xs text-black/45">{[item.size ? `Size: ${item.size}` : null, item.color ? `Colour: ${item.color}` : null].filter(Boolean).join(" · ")}</p>}<p className="mt-1 text-xs text-black/40">{images.length} product photo{images.length === 1 ? "" : "s"} saved</p></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function OrdersPage() {
  return <OrdersContent />;
}
