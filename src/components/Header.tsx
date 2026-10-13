"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cartCount } from "@/lib/cart";

const shopCategories = [
  { label: "Clothing", href: "/search?category=clothing" },
  { label: "Bags", href: "/search?category=bags" },
  { label: "Shoes", href: "/search?category=shoes" },
  { label: "Shop all", href: "/search" },
];

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
    if (!showSidebar) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setShowSidebar(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
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

  const close = () => setShowSidebar(false);

  const categoryLink =
    "flex items-center justify-between px-4 py-3.5 rounded-xl text-[15px] font-medium text-[#202a23] hover:bg-[#f7f5f0] active:bg-[#edf1eb] transition";

  const utilityLink =
    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-[#536056] hover:bg-[#f7f5f0] transition";

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-black/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 bg-[#263b2e] rounded-full flex items-center justify-center shadow-sm group-hover:scale-105 transition">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="text-lg md:text-xl font-semibold tracking-tight text-[#202a23]">
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-full border border-black/8 bg-[#f7f5f0] text-sm focus:outline-none focus:ring-2 focus:ring-[#263b2e]/20 transition"
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
                <svg className="w-5 h-5 text-[#202a23]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <span className="block w-[2.5px] h-[18px] rounded-full bg-[#202a23]" />
                    <span className="block w-[2.5px] h-[18px] rounded-full bg-[#202a23]" />
                    <span className="block w-[2.5px] h-[18px] rounded-full bg-[#202a23]" />
                  </span>
                  {user && count > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#a65f3e] rounded-full ring-2 ring-white" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {showSidebar && (
        <div className="fixed inset-0 z-[60] flex" role="presentation">
          <button
            type="button"
            aria-label="Close navigation menu"
            className="absolute inset-0 cursor-default bg-black/45"
            onClick={close}
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Shop menu"
            className="relative flex h-full w-[min(340px,90vw)] flex-col bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#efeee8] px-5 py-5">
              <div>
                <p className="font-serif text-xl tracking-tight text-[#202a23]">
                  {user ? user.full_name || "Your account" : "Shop Regal"}
                </p>
                <p className="mt-1 text-xs text-[#83887f]">
                  {user
                    ? user.email
                    : "Clothing · Bags · Shoes"}
                </p>
              </div>
              <button
                onClick={close}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f2f0e9] text-sm text-[#536056]"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-2 py-3">
              {/* Categories — primary for guests & shoppers */}
              <p className="px-4 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#a0a59b]">
                Shop
              </p>
              <div className="space-y-0.5">
                {shopCategories.map((cat) => (
                  <Link
                    key={cat.href}
                    href={cat.href}
                    onClick={close}
                    className={categoryLink}
                  >
                    <span>{cat.label}</span>
                    <span className="text-[#b8bdb6]">→</span>
                  </Link>
                ))}
              </div>

              <div className="my-3 border-t border-[#efeee8]" />

              <p className="px-4 pb-1 pt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#a0a59b]">
                Discover
              </p>
              <Link href="/search" onClick={close} className={utilityLink}>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f7f5f0] text-sm">🔍</span>
                Search
              </Link>
              <Link
                href={user ? "/custom-order" : "/sign-in?next=/custom-order"}
                onClick={close}
                className={utilityLink}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f4e9df] text-sm">✨</span>
                Find it for me
              </Link>

              {user && (
                <>
                  <div className="my-3 border-t border-[#efeee8]" />
                  <p className="px-4 pb-1 pt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#a0a59b]">
                    Your space
                  </p>
                  <Link href="/account" onClick={close} className={utilityLink}>
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf1eb] text-sm">👤</span>
                    My account
                  </Link>
                  <Link href="/cart" onClick={close} className={utilityLink}>
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf1eb] text-sm">🛒</span>
                    <span className="flex-1">Bag</span>
                    {count > 0 && (
                      <span className="min-w-[20px] rounded-full bg-[#263b2e] px-1.5 py-0.5 text-center text-[10px] font-bold text-white">
                        {count}
                      </span>
                    )}
                  </Link>
                  <Link href="/account/change-password" onClick={close} className={utilityLink}>
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf1eb] text-sm">🔒</span>
                    Change password
                  </Link>
                  {user.role === "admin" && (
                    <Link href="/admin" onClick={close} className={utilityLink}>
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#dce4dc] text-sm">⚙️</span>
                      Admin dashboard
                    </Link>
                  )}
                </>
              )}

              {!user && (
                <>
                  <div className="my-3 border-t border-[#efeee8]" />
                  <p className="px-4 pb-1 pt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#a0a59b]">
                    Account
                  </p>
                  <Link href="/sign-in" onClick={close} className={utilityLink}>
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf1eb] text-sm">🔑</span>
                    Sign in
                  </Link>
                  <Link href="/sign-up" onClick={close} className={utilityLink}>
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf1eb] text-sm">✦</span>
                    Create account
                  </Link>
                </>
              )}
            </nav>

            <div className="border-t border-[#efeee8] p-4 space-y-2">
              {user ? (
                <button
                  onClick={handleSignOut}
                  className="w-full rounded-xl bg-red-50 py-3 text-sm font-medium text-red-600 hover:bg-red-100"
                >
                  Log out
                </button>
              ) : (
                <>
                  <Link
                    href="/sign-in"
                    onClick={close}
                    className="block w-full rounded-full bg-[#263b2e] py-3.5 text-center text-sm font-semibold text-white hover:bg-[#354e40]"
                  >
                    Sign in to order
                  </Link>
                  <p className="text-center text-[11px] text-[#9a968c]">
                    An account is required to place orders
                  </p>
                </>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
