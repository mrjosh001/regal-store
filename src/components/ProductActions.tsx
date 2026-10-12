"use client";

import { useState } from "react";
import Link from "next/link";
import { addToCart } from "@/lib/cart";
import { whatsappLink, formatPrice } from "@/lib/whatsapp";

type Props = {
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
  };
};

export default function ProductActions({ product }: Props) {
  const [added, setAdded] = useState(false);
  const [showWhatsAppSetup, setShowWhatsAppSetup] = useState(false);

  function handleAdd() {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  const waMessage = `Hi Regal Store! I want to order:\n\n*${product.name}*\nPrice: ${formatPrice(product.price)}\n\nPlease confirm availability.`;
  const orderLink = whatsappLink(waMessage);

  return (
    <div className="mt-auto space-y-3">
      <button
        type="button"
        onClick={handleAdd}
        className="flex min-h-12 w-full items-center justify-center rounded-full bg-[#1769e0] py-3.5 font-semibold text-white shadow-lg shadow-blue-600/15 hover:bg-[#0957c3]"
      >
        {added ? "Added to cart ✓" : "Add to cart"}
      </button>
      {orderLink ? (
        <a
          href={orderLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3.5 font-semibold text-white hover:bg-[#1da851]"
        >
          Order via WhatsApp <span aria-hidden="true">↗</span>
        </a>
      ) : (
        <button
          type="button"
          onClick={() => setShowWhatsAppSetup((current) => !current)}
          className="flex min-h-12 w-full items-center justify-center rounded-full border border-black/10 bg-white py-3.5 font-semibold text-[#1d1d1f] hover:bg-black/[.03]"
        >
          WhatsApp ordering unavailable
        </button>
      )}
      {!orderLink && showWhatsAppSetup && (
        <p role="status" className="rounded-xl bg-amber-50 p-3 text-sm leading-6 text-amber-900">
          Regal Store needs to configure its business WhatsApp number before this order link can be used. You can still add this item to your cart.
        </p>
      )}
      <Link
        href="/custom-order"
        className="flex min-h-12 w-full items-center justify-center rounded-full border border-black/10 bg-white py-3.5 font-semibold text-[#1d1d1f] hover:border-black/20 hover:bg-black/[.02]"
      >
        Request a similar item
      </Link>
    </div>
  );
}
