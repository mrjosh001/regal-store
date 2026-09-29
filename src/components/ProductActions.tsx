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

  function handleAdd() {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  const waMessage = `Hi Regal Store! I want to order:\n\n*${product.name}*\nPrice: ${formatPrice(product.price)}\n\nPlease confirm availability.`;

  return (
    <div className="mt-auto space-y-3">
      <button
        onClick={handleAdd}
        className="flex items-center justify-center w-full py-3.5 bg-brand-blue text-white font-medium rounded-full hover:bg-brand-blue-dark transition"
      >
        {added ? "Added to cart ✓" : "Add to Cart"}
      </button>
      <a
        href={whatsappLink(waMessage)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#25D366] text-white font-medium rounded-full hover:bg-[#1da851] transition"
      >
        Order via WhatsApp
      </a>
      <Link
        href="/custom-order"
        className="flex items-center justify-center w-full py-3.5 border border-black/10 text-brand-black font-medium rounded-full hover:border-brand-blue hover:text-brand-blue transition"
      >
        Request similar item
      </Link>
    </div>
  );
}
