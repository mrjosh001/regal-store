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
  is_available?: boolean | null;
  stock_quantity?: number | null;
  created_at?: string | null;
};

const CATEGORY_MAP: Record<string, string> = {
  clothing: "Clothing",
  fashion: "Clothing",
  bag: "Bags",
  bags: "Bags",
  shoes: "Shoes",
  shoe: "Shoes",
};

function normalizeCategory(raw: string | null | undefined): string {
  if (!raw) return "Other";
  const key = raw.toLowerCase().trim();
  return CATEGORY_MAP[key] || raw;
}

function categoryFromParam(param: string | null): string {
  if (!param) return "All";
  const key = param.toLowerCase().trim();
  return CATEGORY_MAP[key] || (param.charAt(0).toUpperCase() + param.slice(1));
}

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
  const categoryParam = searchParams.get("category");
  const [query, setQuery] = useState(q);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(() => categoryFromParam(categoryParam));
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    setQuery(q);
  }, [q]);

  useEffect(() => {
    setActiveCategory(categoryFromParam(categoryParam));
  }, [categoryParam]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      let request = supabase
        .from("products")
        .select("id, name, price, image_url, category, is_new, is_available, stock_quantity, created_at")
        .order("created_at", { ascending: false });

      const searchTerm = q.trim().replace(/[,%()_*]/g, " ").replace(/\s+/g, " ").slice(0, 80);
      if (searchTerm) {
        request = request.or(
          `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`
        );
      }

      // Server-side category filter when linked from menu
      if (categoryParam) {
        const key = categoryParam.toLowerCase().trim();
        if (key === "clothing" || key === "fashion") {
          request = request.or("category.ilike.clothing,category.ilike.fashion");
        } else if (key === "bags" || key === "bag") {
          request = request.or("category.ilike.bag,category.ilike.bags");
        } else if (key === "shoes" || key === "shoe") {
          request = request.or("category.ilike.shoe,category.ilike.shoes");
        }
      }

      const { data } = await request;
      setProducts(
        (data || [])
          .map((product) => ({
            ...product,
            category: normalizeCategory(product.category),
            is_available: product.is_available ?? null,
            stock_quantity: product.stock_quantity ?? null,
          }))
          .filter((product) =>
            ["Clothing", "Bags", "Shoes"].includes(product.category || "")
          )
      );
      setLoading(false);
    }

    load();
  }, [q, categoryParam]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (activeCategory !== "All") {
      params.set("category", activeCategory.toLowerCase());
    }
    window.location.href = `/search?${params.toString()}`;
  }

  function selectCategory(category: string) {
    setActiveCategory(category);
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (category !== "All") params.set("category", category.toLowerCase());
    window.history.replaceState(null, "", `/search?${params.toString()}`);
  }

  const filteredProducts = products.filter(
    (product) => activeCategory === "All" || product.category === activeCategory
  );
  const visibleProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "name") return a.name.localeCompare(b.name);
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  });

  const title =
    activeCategory !== "All"
      ? activeCategory
      : q
        ? `Results for "${q}"`
        : "All products";

  return (
    <div className="min-h-screen bg-[#f7f5f0]">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <form onSubmit={handleSearch} className="mb-8 max-w-xl animate-rise-in">
          <div className="relative">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-full border border-black/10 bg-white py-3.5 pl-11 pr-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#263b2e]/20"
              autoFocus
            />
            <svg
              className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40"
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

        <div className="mb-6 flex items-end justify-between gap-3 animate-rise-in" style={{ animationDelay: "40ms" }}>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a65f3e]">
              Catalogue
            </p>
            <h1 className="mt-1 font-serif text-2xl tracking-tight text-[#202a23] sm:text-3xl">
              {title}
            </h1>
          </div>
          <span className="pb-1 text-sm text-black/40">
            {loading
              ? "…"
              : `${visibleProducts.length} ${visibleProducts.length === 1 ? "piece" : "pieces"}`}
          </span>
        </div>

        {!loading && (
          <div className="mb-8 space-y-4 animate-rise-in" style={{ animationDelay: "80ms" }}>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1" aria-label="Filter by category">
              {["All", "Clothing", "Bags", "Shoes"].map((category) => (
                <button
                  key={category}
                  type="button"
                  aria-pressed={activeCategory === category}
                  onClick={() => selectCategory(category)}
                  className={`min-h-10 shrink-0 rounded-full px-5 text-sm font-medium transition ${
                    activeCategory === category
                      ? "bg-[#263b2e] text-white shadow-md shadow-[#263b2e]/20"
                      : "border border-black/10 bg-white text-black/65 hover:border-black/25"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="search-sort" className="text-sm text-black/55">
                Sort by
              </label>
              <select
                id="search-sort"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="min-h-10 rounded-xl border border-black/10 bg-white px-3 text-sm text-[#202a23]"
              >
                <option value="newest">Newest first</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5 lg:grid-cols-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="mb-3 aspect-[3/4] rounded-2xl bg-black/5" />
                <div className="mb-2 h-3 w-1/3 rounded bg-black/5" />
                <div className="mb-1 h-4 w-2/3 rounded bg-black/5" />
                <div className="h-4 w-1/4 rounded bg-black/5" />
              </div>
            ))}
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="py-16 text-center animate-rise-in">
            <p className="mb-1 font-medium text-black/50">No products in this category</p>
            <p className="mb-6 text-sm text-black/30">
              Try another category or request a custom find.
            </p>
            <Link
              href="/custom-order"
              className="inline-block rounded-full bg-[#263b2e] px-6 py-3 text-sm font-medium text-white"
            >
              Find it for me
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5 lg:grid-cols-4">
            {visibleProducts.map((product, index) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group block animate-rise-in"
                style={{ animationDelay: `${Math.min(index * 45, 360)}ms` }}
              >
                <div className="relative mb-3 aspect-[3/4] overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition duration-500 group-hover:shadow-lg group-hover:shadow-black/5">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                      sizes="(max-width: 640px) 50vw, 25vw"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-black/20">
                      No image
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5">
                    {product.is_new && (
                      <span className="rounded-md bg-[#263b2e] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                        New
                      </span>
                    )}
                    {product.is_available === false && (
                      <span className="rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                        Sold out
                      </span>
                    )}
                  </div>
                </div>
                <p className="mb-0.5 text-[11px] uppercase tracking-wide text-black/40">
                  {product.category || "Product"}
                </p>
                <h3 className="mb-1 line-clamp-2 text-sm font-medium text-[#202a23] transition-colors group-hover:text-[#263b2e]">
                  {product.name}
                </h3>
                <p className="text-sm font-semibold text-[#202a23]">{formatPrice(product.price)}</p>
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
        <div className="flex min-h-screen items-center justify-center bg-[#f7f5f0]">
          <p className="text-black/40">Loading...</p>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
