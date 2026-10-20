"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

type OrderItem = { product_id?: string | null; name: string; price: number; quantity: number; size?: string | null; color?: string | null; image_urls?: string[] };
type Order = { id: string; status: string; channel: string; total: number; items: OrderItem[]; created_at: string };

function OrdersContent() {
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status") || "all";
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: auth } = await supabase.auth.getUser();
        if (!auth.user) { if (!cancelled) setError("Please sign in to view your orders."); return; }
        let query = supabase.from("order_requests").select("id, status, channel, total, items, created_at").eq("user_id", auth.user.id).order("created_at", { ascending: false });
        if (statusFilter !== "all") query = query.eq("status", statusFilter);
        const { data, error: queryError } = await query;
        if (queryError) throw queryError;
        if (!cancelled) setOrders((data || []).map((row: any) => ({ ...row, items: Array.isArray(row.items) ? row.items : [] })) as Order[]);
      } catch (err) { if (!cancelled) setError(err instanceof Error ? err.message : "We couldn't load your orders."); }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [statusFilter]);

  if (loading) return <div className="min-h-screen bg-brand-surface"><div className="mx-auto max-w-lg px-4 py-20 text-center text-sm text-black/45">Loading orders…</div></div>;
  if (error) return <div className="min-h-screen bg-brand-surface"><div className="mx-auto max-w-lg px-4 py-20 text-center"><p className="text-sm text-black/55">{error}</p><Link href="/sign-in" className="mt-5 inline-flex rounded-full bg-brand-blue px-5 py-3 text-sm font-semibold text-white">Sign in</Link></div></div>;

  return <div className="min-h-screen bg-brand-surface"><div className="sticky top-0 z-40 border-b border-black/5 bg-white"><div className="mx-auto flex h-14 max-w-2xl items-center px-4"><Link href="/account" className="text-sm text-black/50">← Back</Link><span className="ml-4 font-semibold text-sm text-brand-black capitalize">{statusFilter.replace("-", " ")} Orders</span></div></div>
    <main className="mx-auto max-w-2xl px-4 py-7 sm:py-10"><div className="mb-6"><p className="text-xs font-semibold uppercase tracking-[.18em] text-[#a65f3e]">Customer order history</p><h1 className="mt-1 font-serif text-3xl tracking-tight text-brand-black">Your orders</h1><p className="mt-1 text-sm text-black/50">Every order keeps the product image links that were sent with your WhatsApp request.</p></div>
      {!orders.length ? <div className="rounded-3xl border border-black/[.06] bg-white p-10 text-center"><p className="font-semibold text-[#1d1d1f]">No orders in this status yet.</p><p className="mt-1 text-sm text-black/45">When you place a WhatsApp order, it will appear here.</p><Link href="/" className="mt-5 inline-flex rounded-full bg-brand-blue px-5 py-3 text-sm font-semibold text-white">Start shopping</Link></div> : <div className="space-y-4">{orders.map((order) => <article key={order.id} className="overflow-hidden rounded-3xl border border-black/[.06] bg-white p-5 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/[.06] pb-4"><div><p className="text-xs text-black/45">Order request</p><p className="mt-1 font-mono text-xs text-black/55">{order.id.slice(0, 8).toUpperCase()}</p></div><div className="text-right"><span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold capitalize text-amber-900">{order.status.replaceAll("_", " ")}</span><p className="mt-1 text-xs text-black/40">{new Date(order.created_at).toLocaleString()}</p></div></div>
          <div className="mt-4 space-y-5">{order.items.map((item, index) => <div key={`${order.id}-${index}`} className="flex gap-4"><div className="flex max-w-[190px] gap-2 overflow-x-auto pb-1">{(item.image_urls || []).map((url, imageIndex) => <div key={`${url}-${imageIndex}`} className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-[#f5f5f7]"><Image src={url} alt={`${item.name} image ${imageIndex + 1}`} fill className="object-cover" sizes="80px" unoptimized /></div>)}{!(item.image_urls || []).length && <div className="flex h-24 w-20 shrink-0 items-center justify-center rounded-xl bg-[#f5f5f7] text-[10px] text-black/35">No image</div>}</div><div className="min-w-0 flex-1"><Link href={item.product_id ? `/products/${item.product_id}` : "/"} className="text-sm font-semibold text-[#1d1d1f]">{item.name}</Link><p className="mt-1 text-sm text-black/55">{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(item.price)} × {item.quantity}</p>{(item.size || item.color) && <p className="mt-1 text-xs text-black/45">{[item.size ? `Size: ${item.size}` : null, item.color ? `Colour: ${item.color}` : null].filter(Boolean).join(" · ")}</p>}<p className="mt-2 text-xs text-black/40">{(item.image_urls || []).length} product image{(item.image_urls || []).length === 1 ? "" : "s"} saved with this order.</p></div></div>)}</div>
          <div className="mt-5 flex items-center justify-between border-t border-black/[.06] pt-4"><span className="text-sm text-black/50">Order total</span><span className="text-lg font-semibold text-[#1d1d1f]">{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(order.total)}</span></div>
        </article>)}</div>}
    </main></div>;
}

export default function OrdersPage() { return <Suspense fallback={<div className="min-h-screen bg-brand-surface" />}><OrdersContent /></Suspense>; }
