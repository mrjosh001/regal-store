"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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
    router.refresh();
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = search.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  }

  return (
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

          <div className="flex items-center gap-3">
            <Link
              href="/search"
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-brand-blue/10"
            >
              🔍
            </Link>

            {loading ? (
              <div className="w-20 h-9 bg-black/5 rounded-full animate-pulse" />
            ) : user ? (
              <>
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="text-sm font-medium text-brand-blue hover:text-brand-blue-dark hidden sm:block"
                  >
                    Admin
                  </Link>
                )}

                <Link
                  href="/account"
                  className="flex items-center gap-2 hover:opacity-80 transition"
                >
                  <div className="w-8 h-8 bg-brand-blue/10 text-brand-blue rounded-full flex items-center justify-center text-sm font-semibold">
                    {(user.full_name || user.email || "U")[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium hidden sm:block max-w-[120px] truncate text-brand-black">
                    {user.full_name || user.email?.split("@")[0]}
                  </span>
                </Link>

                <button
                  onClick={handleSignOut}
                  className="text-sm px-4 py-2 border border-black/10 rounded-full hover:bg-black/5 transition text-brand-black"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                href="/sign-in"
                className="px-5 py-2.5 bg-brand-blue text-white text-sm font-medium rounded-full hover:bg-brand-blue-dark transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
