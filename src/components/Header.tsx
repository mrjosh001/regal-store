"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cartCount } from "@/lib/cart";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [count, setCount] = useState(0);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    setCount(cartCount());
    function onCart() {
      setCount(cartCount());
    }
    window.addEventListener("cart-updated", onCart);
    return () => window.removeEventListener("cart-updated", onCart);
  }, []);

  useEffect(() => {
    async function getUser() {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", user.id)
          .single();

        setUser({
          ...user,
          full_name: profile?.full_name,
          role: profile?.role,
        });
      }

      setLoading(false);
    }

    getUser();
  }, []);

  async function handleSignOut() {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setShowSidebar(false);
    router.refresh();
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = search.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-brand-blue rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="text-xl font-semibold tracking-tight text-brand-black">
                Regal Store
              </span>
            </Link>

            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-full border border-black/10 bg-brand-surface text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue/40"
                />
                <svg
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40"
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

            <div className="flex items-center gap-2">
              <Link
                href="/search"
                className="md:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-brand-blue/10"
              >
                🔍
              </Link>

              {loading ? (
                <div className="w-9 h-9 bg-black/5 rounded-full animate-pulse" />
              ) : user ? (
                <button
                  onClick={() => setShowSidebar(true)}
                  className="w-9 h-9 bg-brand-blue/10 text-brand-blue rounded-full flex items-center justify-center text-sm font-semibold hover:bg-brand-blue/20 transition"
                >
                  {(user.full_name || user.email || "U")[0].toUpperCase()}
                </button>
              ) : (
                <Link
                  href="/sign-in"
                  className="px-4 py-2 bg-brand-blue text-white text-sm font-medium rounded-full hover:bg-brand-blue-dark transition-colors"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Left sidebar */}
      {showSidebar && (
        <div className="fixed inset-0 z-[60] flex">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowSidebar(false)}
          />
          <div className="relative bg-white w-72 max-w-[85vw] h-full shadow-xl flex flex-col animate-in slide-in-from-left">
            <div className="p-5 border-b border-black/5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center text-lg font-semibold">
                  {(user?.full_name || user?.email || "U")[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-brand-black truncate">
                    {user?.full_name || "Customer"}
                  </p>
                  <p className="text-xs text-black/40 truncate">{user?.email}</p>
                </div>
              </div>
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              <Link
                href="/account"
                onClick={() => setShowSidebar(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-brand-blue/5"
              >
                <span>👤</span> My Account
              </Link>
              <Link
                href="/cart"
                onClick={() => setShowSidebar(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-brand-blue/5"
              >
                <span>🛒</span> Cart
                {count > 0 && (
                  <span className="ml-auto bg-brand-blue text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {count}
                  </span>
                )}
              </Link>
              <Link
                href="/custom-order"
                onClick={() => setShowSidebar(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-brand-blue/5"
              >
                <span>✨</span> Custom Order
              </Link>
              <Link
                href="/search"
                onClick={() => setShowSidebar(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-brand-blue/5"
              >
                <span>🔍</span> Search
              </Link>
              {user?.role === "admin" && (
                <Link
                  href="/admin"
                  onClick={() => setShowSidebar(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-brand-blue/5"
                >
                  <span>⚙️</span> Admin Dashboard
                </Link>
              )}
              <Link
                href="/"
                onClick={() => setShowSidebar(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-brand-blue/5"
              >
                <span>🏠</span> Store Home
              </Link>
            </nav>

            <div className="p-4 border-t border-black/5">
              <button
                onClick={handleSignOut}
                className="w-full py-3 text-red-500 text-sm font-medium rounded-xl bg-red-50 hover:bg-red-100"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
