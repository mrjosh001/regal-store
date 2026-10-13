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
  sizes?: string[] | null;
  colors?: string[] | null;
  is_available?: boolean | null;
  stock_quantity?: number | null;
};

const categories = ["All", "Clothing", "Bags", "Shoes"];

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
          if (active === "Clothing") return category === "clothing" || category === "fashion";
          if (active === "Bags") return category === "bag" || category === "bags";
          return category === active.toLowerCase();
        });

  const newProducts = filtered.filter((product) => product.is_new).slice(0, 4);

  return (
    <>
      <div className="sticky top-14 z-40 border-b border-black/[0.05] bg-[#f7f5f0]/85 backdrop-blur-xl md:top-16">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-16">
          <div className="scrollbar-hide flex gap-2 overflow-x-auto py-3.5">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                aria-pressed={active === category}
                onClick={() => setActive(category)}
                className={`min-h-10 shrink-0 rounded-full px-5 text-sm font-medium transition ${
                  active === category
                    ? "bg-[#263b2e] text-white shadow-md shadow-[#263b2e]/15"
                    : "border border-black/[0.08] bg-white text-black/60 hover:border-black/20"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-16" id="products">
        {newProducts.length > 0 && active === "All" && (
          <section className="pb-6 pt-12">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a65f3e]">
                  Fresh arrivals
                </p>
                <h2 className="mt-1 font-serif text-3xl tracking-tight text-[#24372d] sm:text-4xl">
                  Just in
                </h2>
              </div>
              <span className="text-xs text-black/40">New to Regal</span>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5">
              {newProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </section>
        )}

        <section className="pb-16 pt-10">
          <div className="mb-6 flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a65f3e]">
                {active === "All" ? "The collection" : "Category"}
              </p>
              <h2 className="mt-1 font-serif text-3xl tracking-tight text-[#24372d] sm:text-4xl">
                {active === "All" ? "Explore the edit" : active}
              </h2>
            </div>
            <span className="shrink-0 text-sm tabular-nums text-black/40">
              {filtered.length} {filtered.length === 1 ? "piece" : "pieces"}
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-3xl border border-black/[0.06] bg-white px-6 py-16 text-center">
              <p className="font-serif text-2xl text-[#24372d]">Nothing here yet</p>
              <p className="mt-2 text-sm text-black/45">Try another category or browse all.</p>
              <button
                type="button"
                onClick={() => setActive("All")}
                className="mt-6 rounded-full bg-[#263b2e] px-6 py-3 text-sm font-semibold text-white"
              >
                View all
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-4">
              {filtered.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const off = product.compare_at_price
    ? discountPercent(product.price, product.compare_at_price)
    : null;

  return (
    <Link
      href={`/products/${product.id}`}
      className="group block min-w-0 animate-rise-in"
      style={{ animationDelay: `${Math.min(index * 40, 320)}ms` }}
    >
      <div className="relative mb-3 aspect-[3/4] overflow-hidden rounded-2xl border border-black/[0.04] bg-[#ebe6dc] shadow-sm transition duration-500 group-hover:shadow-xl group-hover:shadow-black/[0.08] sm:rounded-3xl">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, 25vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-black/30">
            No image
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5">
          {off && (
            <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-[#1d1d1f] shadow-sm">
              −{off}%
            </span>
          )}
          {product.is_new && (
            <span className="rounded-full bg-[#263b2e] px-2.5 py-1 text-[10px] font-semibold text-white">
              New
            </span>
          )}
          {(product.stock_quantity === 0 || product.is_available === false) && (
            <span className="rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-semibold text-white">
              Sold out
            </span>
          )}
        </div>
      </div>
      <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-black/40">
        {["fashion", "clothing"].includes((product.category || "").toLowerCase())
          ? "Clothing"
          : ["bag", "bags"].includes((product.category || "").toLowerCase())
            ? "Bags"
            : product.category || "Curated"}
      </p>
      <h3 className="mb-1 line-clamp-2 text-sm font-medium leading-snug text-[#24372d] transition group-hover:text-[#263b2e] sm:text-[15px]">
        {product.name}
      </h3>
      <div className="flex flex-wrap items-baseline gap-x-2">
        <p className="text-sm font-semibold text-[#24372d]">{formatPrice(product.price)}</p>
        {off && product.compare_at_price && (
          <p className="text-xs text-black/35 line-through">{formatPrice(product.compare_at_price)}</p>
        )}
      </div>
    </Link>
  );
}
