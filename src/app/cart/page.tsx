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
  type CartItem,
} from "@/lib/cart";
import { whatsappLink, formatPrice } from "@/lib/whatsapp";

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(getCart());
    function onUpdate() {
      setItems(getCart());
    }
    window.addEventListener("cart-updated", onUpdate);
    return () => window.removeEventListener("cart-updated", onUpdate);
  }, []);

  function handleOrder() {
    if (items.length === 0) return;

    const lines = items.map(
      (i) =>
        `• ${i.name} x${i.quantity} — ${formatPrice(i.price * i.quantity)}`
    );
    const total = formatPrice(cartTotal(items));
    const message = `Hi Regal Store! I want to order:\n\n${lines.join("\n")}\n\n*Total: ${total}*\n\nPlease confirm availability and delivery.`;

    window.open(whatsappLink(message), "_blank");
  }

  return (
    <div className="min-h-screen bg-brand-surface">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight text-brand-black mb-6">
          Your Cart
        </h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-black/5 p-12 text-center">
            <p className="text-black/40 mb-4">Your cart is empty</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-brand-blue text-white text-sm font-medium rounded-full"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl border border-black/5 divide-y divide-black/5 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-black/5 flex-shrink-0">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-black/30">
                        —
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate text-brand-black">
                      {item.name}
                    </p>
                    <p className="text-sm text-black/50">
                      {formatPrice(item.price)}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() =>
                          setItems(updateQuantity(item.id, item.quantity - 1))
                        }
                        className="w-7 h-7 rounded-full border border-black/10 flex items-center justify-center text-sm"
                      >
                        −
                      </button>
                      <span className="text-sm font-medium w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          setItems(updateQuantity(item.id, item.quantity + 1))
                        }
                        className="w-7 h-7 rounded-full border border-black/10 flex items-center justify-center text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm text-brand-black">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                    <button
                      onClick={() => setItems(removeFromCart(item.id))}
                      className="text-xs text-red-500 mt-1"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-black/5 p-5 mb-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-black/50">Total</span>
                <span className="text-xl font-semibold text-brand-black">
                  {formatPrice(cartTotal(items))}
                </span>
              </div>
              <button
                onClick={handleOrder}
                className="w-full py-3.5 bg-[#25D366] text-white font-medium rounded-full hover:bg-[#1da851] transition"
              >
                Order via WhatsApp
              </button>
              <button
                onClick={() => {
                  clearCart();
                  setItems([]);
                }}
                className="w-full mt-2 py-2 text-sm text-black/40 hover:text-red-500"
              >
                Clear cart
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
