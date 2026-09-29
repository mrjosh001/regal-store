"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  price: number;
  compare_at_price?: number | null;
  image_url: string | null;
  category: string | null;
  is_new: boolean | null;
};

const categories = ["All", "Fashion", "Electronics", "Home", "Accessories", "Beauty"];

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(price);
}

function discountPercent(price: number, compare: number) {
  if (!compare || compare <= price) return null;
  return Math.round(((compare - price) / compare) * 100);
}

export default function ProductGrid({ products }: { products: Product[] }) {
  const [active, setActive] = useState("All");

  const filtered =
    active === "All"
      ? products
      : products.filter(
          (p) => p.category?.toLowerCase() === active.toLowerCase()
        );

  const newProducts = filtered.filter((p) => p.is_new).slice(0, 4);
  const rest = filtered;

  return (
    <>
      <div className="sticky top-14 md:top-16 z-40 bg-brand-surface/90 backdrop-blur-xl border-b border-black/[0.05]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  active === cat
                    ? "bg-brand-blue text-white shadow-sm shadow-brand-blue/25"
                    : "bg-white border border-black/8 text-black/65 hover:border-brand-blue/40 hover:text-brand-blue"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="products">
        {newProducts.length > 0 && active === "All" && (
          <section className="pt-10 pb-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold tracking-tight text-brand-black">New Ins</h2>
              <span className="text-[11px] text-brand-blue font-semibold uppercase tracking-wider">
                Just dropped
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
              {newProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        <section className="py-8 pb-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold tracking-tight text-brand-black">
              {active === "All" ? "Trending Today" : active}
            </h2>
            <span className="text-sm text-black/35">{filtered.length} items</span>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-black/35 text-sm">No products in this category yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {rest.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function ProductCard({ product }: { product: Product }) {
  const off = product.compare_at_price
    ? discountPercent(product.price, product.compare_at_price)
    : null;

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="relative aspect-[3/4] bg-white rounded-2xl overflow-hidden mb-2.5 border border-black/[0.04] shadow-sm">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-black/15 text-sm bg-gradient-to-b from-black/[0.02] to-black/[0.04]">
            No image
          </div>
        )}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          {off && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold uppercase tracking-wide rounded-md shadow-sm">
              -{off}%
            </span>
          )}
          {product.is_new && (
            <span className="px-2 py-0.5 bg-brand-blue text-white text-[10px] font-bold uppercase tracking-wide rounded-md shadow-sm">
              New
            </span>
          )}
        </div>
      </div>
      <div className="px-0.5">
        <p className="text-[10px] text-black/35 mb-0.5 uppercase tracking-wide font-medium">
          {product.category || "Product"}
        </p>
        <h3 className="text-[13px] font-medium leading-snug line-clamp-2 mb-1 text-brand-black group-hover:text-brand-blue transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold tracking-tight text-brand-black">
            {formatPrice(product.price)}
          </p>
          {off && product.compare_at_price && (
            <p className="text-xs text-black/30 line-through">
              {formatPrice(product.compare_at_price)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
