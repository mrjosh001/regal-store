"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import {
  getCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  cartTotal,
  cartItemKey,
  saveCart,
  type CartItem,
} from "@/lib/cart";
import { whatsappLink, formatPrice } from "@/lib/whatsapp";

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [whatsAppUnavailable, setWhatsAppUnavailable] = useState(false);

  useEffect(() => {
    setItems(getCart());
    function onUpdate() {
      setItems(getCart());
    }
    window.addEventListener("cart-updated", onUpdate);
    return () => window.removeEventListener("cart-updated", onUpdate);
  }, []);

  const [inventoryMessage, setInventoryMessage] = useState<string | null>(null);

  async function handleOrder() {
    if (items.length === 0) return;
    setInventoryMessage(null);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const productIds = [...new Set(items.map((item) => item.id))];
      const { data, error } = await supabase.from("products").select("id, name, stock_quantity, is_available").in("id", productIds);
      if (error) throw error;
      const liveProducts = new Map((data || []).map((product) => [product.id, product]));
      const issues: string[] = [];
      const requestedByProduct = new Map<string, number>();
      for (const item of items) {
        requestedByProduct.set(item.id, (requestedByProduct.get(item.id) || 0) + item.quantity);
      }
      for (const [productId, requestedQuantity] of requestedByProduct) {
        const item = items.find((candidate) => candidate.id === productId)!;
        const product = liveProducts.get(productId);
        if (!product) { issues.push(`${item.name} is no longer listed.`); continue; }
        if (product.is_available === false || product.stock_quantity === 0) { issues.push(`${item.name} is currently sold out or unavailable.`); continue; }
        if (product.stock_quantity != null && requestedQuantity > product.stock_quantity) {
          issues.push(`${item.name}: only ${product.stock_quantity} in stock across all sizes/colours; your cart requests ${requestedQuantity}.`);
        }
      }
      if (issues.length) {
        setInventoryMessage(`Please update your cart before ordering: ${issues.join(" ")}`);
        const refreshedItems = items.map((item) => {
          const latest = liveProducts.get(item.id);
          return latest ? { ...item, stock_quantity: latest.stock_quantity } : item;
        });
        saveCart(refreshedItems);
        setItems(refreshedItems);
        return;
      }
    } catch {
      setInventoryMessage("We could not verify live stock just now. Please try again before sending your order.");
      return;
    }

    const lines = items.map(
      (item) => {
        const options = [item.size ? `Size: ${item.size}` : null, item.color ? `Colour: ${item.color}` : null].filter(Boolean);
        return `• ${item.name}${options.length ? ` (${options.join(", ")})` : ""} x${item.quantity} — ${formatPrice(item.price * item.quantity)}`;
      }
    );
    const total = formatPrice(cartTotal(items));
    const message = `Hi Regal Store! I want to order:\n\n${lines.join("\n")}\n\n*Total: ${total}*\n\nPlease confirm availability and delivery.`;
    const link = whatsappLink(message);

    if (!link) {
      setWhatsAppUnavailable(true);
      return;
    }

    setWhatsAppUnavailable(false);
    window.open(link, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        <Link href="/" className="text-sm font-medium text-black/50 hover:text-[#1769e0]">← Continue shopping</Link>
        {inventoryMessage && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800">{inventoryMessage}</p>}
        <div className="mb-6 mt-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-brand-blue">Your selection</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-[-.04em] text-[#1d1d1f]">Your cart</h1>
          </div>
          {items.length > 0 && <span className="text-sm text-black/45">{items.reduce((sum, item) => sum + item.quantity, 0)} items</span>}
        </div>

        {items.length === 0 ? (
          <div className="rounded-3xl border border-black/[.06] bg-white p-10 text-center sm:p-14">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f5f5f7] text-2xl">⌑</span>
            <p className="mt-4 font-semibold text-[#1d1d1f]">Your cart is taking a break.</p>
            <p className="mt-1 text-sm text-black/50">Explore the collection and add something you like.</p>
            <Link href="/" className="mt-5 inline-flex min-h-11 items-center rounded-full bg-[#1769e0] px-5 text-sm font-semibold text-white hover:bg-[#0957c3]">Explore products ↗</Link>
          </div>
        ) : (
          <>
            <div className="divide-y divide-black/[.06] overflow-hidden rounded-3xl border border-black/[.06] bg-white">
              {items.map((item) => (
                <div key={cartItemKey(item)} className="flex items-center gap-3 p-4 sm:gap-4 sm:p-5">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#f5f5f7] sm:h-24 sm:w-24">
                    {item.image_url ? <Image src={item.image_url} alt={item.name} fill className="object-cover" sizes="96px" unoptimized /> : <div className="flex h-full items-center justify-center text-xs text-black/35">No image</div>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/products/${item.id}`} className="line-clamp-2 text-sm font-semibold leading-5 text-[#1d1d1f] hover:text-brand-blue">{item.name}</Link>
                    <p className="mt-1 text-sm text-black/55">{formatPrice(item.price)}</p>
                    {(item.size || item.color) && <p className="mt-1 text-xs text-black/45">{[item.size ? `Size: ${item.size}` : null, item.color ? `Colour: ${item.color}` : null].filter(Boolean).join(" · ")}</p>}
                    <div className="mt-3 inline-flex items-center gap-3 rounded-full border border-black/[.08] px-2 py-1">
                      <button type="button" aria-label={`Decrease quantity of ${item.name}`} onClick={() => setItems(updateQuantity(cartItemKey(item), item.quantity - 1))} className="flex h-7 w-7 items-center justify-center rounded-full text-lg hover:bg-[#f5f5f7]">−</button>
                      <span className="w-4 text-center text-sm font-semibold tabular-nums">{item.quantity}</span>
                      <button type="button" aria-label={`Increase quantity of ${item.name}`} disabled={item.stock_quantity != null && items.filter((other) => other.id === item.id).reduce((sum, other) => sum + other.quantity, 0) >= item.stock_quantity} onClick={() => setItems(updateQuantity(cartItemKey(item), item.quantity + 1))} className="flex h-7 w-7 items-center justify-center rounded-full text-lg hover:bg-[#f5f5f7] disabled:cursor-not-allowed disabled:opacity-30">+</button>
                    </div>
                    {item.stock_quantity != null && <p className="mt-1 text-xs text-black/45">{item.stock_quantity} in stock</p>}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-[#1d1d1f]">{formatPrice(item.price * item.quantity)}</p>
                    <button type="button" onClick={() => setItems(removeFromCart(cartItemKey(item)))} className="mt-2 text-xs text-black/40 underline underline-offset-2 hover:text-red-600">Remove</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-3xl border border-black/[.06] bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-black/55">Subtotal</span>
                <span className="text-2xl font-semibold tracking-[-.04em] text-[#1d1d1f]">{formatPrice(cartTotal(items))}</span>
              </div>
              <p className="mt-2 text-xs leading-5 text-black/45">Delivery and final availability are confirmed by the store before payment.</p>
              <button type="button" onClick={handleOrder} className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3.5 font-semibold text-white hover:bg-[#1da851]">Continue to WhatsApp ↗</button>
              {whatsAppUnavailable && <p role="alert" className="mt-3 rounded-xl bg-amber-50 p-3 text-sm leading-6 text-amber-900">WhatsApp ordering is not configured yet. Your cart is still saved on this device; the order message has not been sent.</p>}
              <button type="button" onClick={() => { clearCart(); setItems([]); setWhatsAppUnavailable(false); }} className="mt-3 w-full py-2 text-sm text-black/45 hover:text-red-600">Clear cart</button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
