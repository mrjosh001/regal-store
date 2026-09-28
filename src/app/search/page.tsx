"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";

type Product = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  category: string | null;
  is_new: boolean | null;
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(price);
}

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const [query, setQuery] = useState(q);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setQuery(q);
  }, [q]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      let request = supabase
        .from("products")
        .select("id, name, price, image_url, category, is_new")
        .order("created_at", { ascending: false });

      if (q.trim()) {
        request = request.or(
          `name.ilike.%${q.trim()}%,description.ilike.%${q.trim()}%,category.ilike.%${q.trim()}%`
        );
      }

      const { data } = await request;
      setProducts(data || []);
      setLoading(false);
    }

    load();
  }, [q]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    window.location.href = `/search?${params.toString()}`;
  }

  return (
    <div className="min-h-screen bg-brand-surface">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSearch} className="mb-8 max-w-xl">
          <div className="relative">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-11 pr-4 py-3 rounded-full border border-black/10 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue/40"
              autoFocus
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </form>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-medium text-brand-black">
            {q ? `Results for "${q}"` : "All products"}
          </h1>
          <span className="text-sm text-black/40">
            {loading ? "..." : `${products.length} products`}
          </span>
        </div>

        {loading ? (
          <p className="text-black/40 text-sm py-12 text-center">Searching...</p>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-black/50 font-medium mb-1">No products found</p>
            <p className="text-black/30 text-sm mb-6">
              Try a different search or request a custom order.
            </p>
            <Link
              href="/custom-order"
              className="inline-block px-6 py-3 bg-brand-blue text-white text-sm font-medium rounded-full"
            >
              Request Custom Order
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
            {products.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`} className="group block">
                <div className="relative aspect-[3/4] bg-white rounded-2xl overflow-hidden mb-3 border border-black/5">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      sizes="(max-width: 640px) 50vw, 25vw"
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
                <p className="text-[11px] text-black/40 mb-0.5 uppercase tracking-wide">
                  {product.category || "Product"}
                </p>
                <h3 className="text-sm font-medium line-clamp-2 mb-1 text-brand-black group-hover:text-brand-blue transition-colors">
                  {product.name}
                </h3>
                <p className="text-sm font-semibold text-brand-black">{formatPrice(product.price)}</p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-brand-surface">
          <p className="text-black/40">Loading...</p>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
