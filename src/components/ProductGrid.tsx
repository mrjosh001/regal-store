"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  price: number;
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
      {/* Categories */}
      <div className="sticky top-16 z-40 bg-brand-surface/90 backdrop-blur-md border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto py-3.5 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  active === cat
                    ? "bg-brand-blue text-white"
                    : "bg-white border border-black/8 text-black/70 hover:border-brand-blue/40 hover:text-brand-blue"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="products">
        {/* New Ins */}
        {newProducts.length > 0 && active === "All" && (
          <section className="pt-12 pb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium tracking-tight text-brand-black">New Ins</h2>
              <span className="text-xs text-brand-blue font-medium uppercase tracking-wider">
                Just dropped
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-5">
              {newProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Main grid */}
        <section className="py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium tracking-tight text-brand-black">
              {active === "All" ? "Trending Today" : active}
            </h2>
            <span className="text-sm text-black/40">{filtered.length} products</span>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-black/40 text-sm">No products in this category yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
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
  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="relative aspect-[3/4] bg-white rounded-2xl overflow-hidden mb-3 border border-black/5">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-black/20 text-sm">
            No image
          </div>
        )}
        {product.is_new && (
          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-brand-blue text-white text-[10px] font-semibold uppercase tracking-wider rounded-md">
            New
          </span>
        )}
      </div>
      <div className="px-0.5">
        <p className="text-[11px] text-black/40 mb-0.5 uppercase tracking-wide">
          {product.category || "Product"}
        </p>
        <h3 className="text-sm font-medium leading-snug line-clamp-2 mb-1 text-brand-black group-hover:text-brand-blue transition-colors">
          {product.name}
        </h3>
        <p className="text-sm font-semibold tracking-tight text-brand-black">
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
}
