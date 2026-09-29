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
          .select("full_name, role, avatar_url")
          .eq("id", user.id)
          .single();

        setUser({
          ...user,
          full_name: profile?.full_name,
          role: profile?.role,
          avatar_url: profile?.avatar_url,
        });
      }

      setLoading(false);
    }

    getUser();
  }, []);

  useEffect(() => {
    if (showSidebar) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showSidebar]);

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
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-black/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 bg-brand-blue rounded-full flex items-center justify-center shadow-sm shadow-brand-blue/30 group-hover:scale-105 transition">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="text-lg md:text-xl font-semibold tracking-tight text-brand-black">
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-full border border-black/8 bg-brand-surface/80 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/25 focus:border-brand-blue/30 transition"
                />
                <svg
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/35"
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

            <div className="flex items-center gap-1.5">
              <Link
                href="/search"
                className="md:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 transition"
                aria-label="Search"
              >
                <svg className="w-5 h-5 text-brand-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </Link>

              {loading ? (
                <div className="w-10 h-10 bg-black/5 rounded-full animate-pulse" />
              ) : (
                <button
                  onClick={() => setShowSidebar(true)}
                  className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 transition"
                  aria-label="Open menu"
                >
                  <span className="flex items-center justify-center gap-[4.5px]">
                    <span className="block w-[2.5px] h-[18px] rounded-full bg-brand-black" />
                    <span className="block w-[2.5px] h-[18px] rounded-full bg-brand-black" />
                    <span className="block w-[2.5px] h-[18px] rounded-full bg-brand-black" />
                  </span>
                  {count > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-blue rounded-full ring-2 ring-white" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {showSidebar && (
        <div className="fixed inset-0 z-[60] flex">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSidebar(false)}
          />
          <div className="relative bg-white w-[min(300px,88vw)] h-full shadow-2xl flex flex-col">
            <div className="p-5 bg-gradient-to-br from-brand-blue to-brand-blue-dark text-white">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-semibold backdrop-blur">
                    {user.avatar_url || (user.full_name || user.email || "U")[0].toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate">
                      {user.full_name || "Customer"}
                    </p>
                    <p className="text-xs text-white/70 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => setShowSidebar(false)}
                    className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-sm"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Welcome</p>
                    <p className="text-xs text-white/70 mt-0.5">Sign in for a better experience</p>
                  </div>
                  <button
                    onClick={() => setShowSidebar(false)}
                    className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-sm"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
              {user ? (
                <Link
                  href="/account"
                  onClick={() => setShowSidebar(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-brand-black hover:bg-brand-blue/5 active:bg-brand-blue/10 transition"
                >
                  <span className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center text-sm">👤</span>
                  My Account
                </Link>
              ) : (
                <Link
                  href="/sign-in"
                  onClick={() => setShowSidebar(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-brand-black hover:bg-brand-blue/5 transition"
                >
                  <span className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center text-sm">🔑</span>
                  Sign in
                </Link>
              )}

              <Link
                href="/cart"
                onClick={() => setShowSidebar(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-brand-black hover:bg-brand-blue/5 transition"
              >
                <span className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center text-sm">🛒</span>
                <span className="flex-1">Cart</span>
                {count > 0 && (
                  <span className="bg-brand-blue text-white text-[10px] font-bold min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center">
                    {count}
                  </span>
                )}
              </Link>

              <Link
                href="/custom-order"
                onClick={() => setShowSidebar(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-brand-black hover:bg-brand-blue/5 transition"
              >
                <span className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center text-sm">✨</span>
                Custom Order
              </Link>

              <Link
                href="/search"
                onClick={() => setShowSidebar(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-brand-black hover:bg-brand-blue/5 transition"
              >
                <span className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center text-sm">🔍</span>
                Search
              </Link>

              <div className="my-2 border-t border-black/5" />

              <Link
                href="/"
                onClick={() => setShowSidebar(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-brand-black hover:bg-brand-blue/5 transition"
              >
                <span className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center text-sm">🏠</span>
                Store Home
              </Link>

              {user?.role === "admin" && (
                <Link
                  href="/admin"
                  onClick={() => setShowSidebar(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-brand-blue hover:bg-brand-blue/5 transition"
                >
                  <span className="w-8 h-8 rounded-lg bg-brand-blue/15 flex items-center justify-center text-sm">⚙️</span>
                  Admin Dashboard
                </Link>
              )}
            </nav>

            {user && (
              <div className="p-4 border-t border-black/5">
                <button
                  onClick={handleSignOut}
                  className="w-full py-3 text-red-500 text-sm font-medium rounded-xl bg-red-50 hover:bg-red-100 active:scale-[0.98] transition"
                >
                  Log out
                </button>
              </div>
            )}

            {!user && (
              <div className="p-4 border-t border-black/5">
                <Link
                  href="/sign-in"
                  onClick={() => setShowSidebar(false)}
                  className="block w-full py-3 text-center bg-brand-blue text-white text-sm font-medium rounded-xl hover:bg-brand-blue-dark transition"
                >
                  Sign in to Regal Store
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
