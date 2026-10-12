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

const categories = ["All", "Clothing", "Shoes"];

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

export default function ProductGrid({
  products,
  initialCategory = "All",
}: {
  products: Product[];
  initialCategory?: string;
}) {
  const [active, setActive] = useState(() =>
    categories.includes(initialCategory) ? initialCategory : "All"
  );

  const filtered =
    active === "All"
      ? products
      : products.filter((product) => {
          const category = product.category?.toLowerCase();
          return active === "Clothing"
            ? category === "clothing" || category === "fashion"
            : category === active.toLowerCase();
        });

  const newProducts = filtered.filter((product) => product.is_new).slice(0, 4);

  return (
    <>
      <div className="glass-surface sticky top-14 z-40 border-b border-black/[.05] md:top-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="scrollbar-hide flex gap-2 overflow-x-auto py-3">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                aria-pressed={active === category}
                onClick={() => setActive(category)}
                className={`min-h-10 shrink-0 rounded-full px-4 text-sm font-medium ${
                  active === category
                    ? "bg-[#1d1d1f] text-white shadow-sm"
                    : "border border-black/[.07] bg-white/80 text-black/65 hover:border-black/20 hover:text-[#1d1d1f]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10" id="products">
        {newProducts.length > 0 && active === "All" && (
          <section className="pb-5 pt-10">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.18em] text-brand-blue">Fresh arrivals</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-[-.04em] text-[#1d1d1f]">Just in</h2>
              </div>
              <span className="text-sm text-black/45">New to Regal</span>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {newProducts.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          </section>
        )}

        <section className="pb-14 pt-8">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.18em] text-brand-blue">
                {active === "All" ? "The collection" : "Category"}
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-[-.04em] text-[#1d1d1f]">
                {active === "All" ? "Explore the collection" : active}
              </h2>
            </div>
            <span className="shrink-0 text-sm tabular-nums text-black/45">{filtered.length} {filtered.length === 1 ? "item" : "items"}</span>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-3xl border border-black/[.06] bg-white px-6 py-14 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5f5f7] text-xl">⌕</span>
              <p className="mt-4 font-semibold text-[#1d1d1f]">Nothing in this category just yet.</p>
              <p className="mt-1 text-sm text-black/50">Try another category or explore all products.</p>
              <button type="button" onClick={() => setActive("All")} className="mt-5 rounded-full bg-[#1d1d1f] px-5 py-3 text-sm font-semibold text-white hover:bg-black">View all products</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-9 lg:grid-cols-4">
              {filtered.map((product) => <ProductCard key={product.id} product={product} />)}
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
    <Link href={`/products/${product.id}`} className="group block min-w-0">
      <div className="relative mb-3 aspect-[4/5] overflow-hidden rounded-2xl border border-black/[.04] bg-white shadow-sm sm:rounded-3xl">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035] motion-reduce:transform-none"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#f5f5f7] text-sm text-black/35">Image coming soon</div>
        )}
        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5 sm:left-3 sm:top-3">
          {off && <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-[#1d1d1f] shadow-sm backdrop-blur">Save {off}%</span>}
          {product.is_new && <span className="rounded-full bg-[#1d1d1f]/90 px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm backdrop-blur">New</span>}
        </div>
        <span className="absolute bottom-3 right-3 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-white text-lg text-[#1d1d1f] opacity-0 shadow-md transition duration-200 group-hover:translate-y-0 group-hover:opacity-100 max-sm:hidden" aria-hidden="true">↗</span>
      </div>
      <div className="px-0.5">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[.15em] text-black/40">{product.category?.toLowerCase() === "fashion" ? "Clothing" : product.category || "Curated find"}</p>
        <h3 className="mb-1.5 line-clamp-2 text-sm font-medium leading-snug text-[#1d1d1f] transition-colors group-hover:text-brand-blue sm:text-[15px]">{product.name}</h3>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <p className="text-sm font-semibold tracking-tight text-[#1d1d1f] sm:text-base">{formatPrice(product.price)}</p>
          {off && product.compare_at_price && <p className="text-xs text-black/40 line-through">{formatPrice(product.compare_at_price)}</p>}
        </div>
      </div>
    </Link>
  );
}
