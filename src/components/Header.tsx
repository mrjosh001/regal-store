"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Get profile for full name and role
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

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="text-xl font-semibold tracking-tight">Regal Store</span>
          </Link>

          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="search"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-black/10 bg-[#faf9f7] text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
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
          </div>

          <div className="flex items-center gap-3">
            {loading ? (
              <div className="w-20 h-9 bg-black/5 rounded-full animate-pulse" />
            ) : user ? (
              <>
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="text-sm font-medium text-black/60 hover:text-black hidden sm:block"
                  >
                    Admin
                  </Link>
                )}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-black/10 rounded-full flex items-center justify-center text-sm font-medium">
                    {(user.full_name || user.email || "U")[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium hidden sm:block max-w-[120px] truncate">
                    {user.full_name || user.email?.split("@")[0]}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-sm px-4 py-2 border border-black/10 rounded-full hover:bg-black/5 transition"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                href="/sign-in"
                className="px-5 py-2.5 bg-black text-white text-sm font-medium rounded-full hover:bg-black/80 transition-colors"
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
