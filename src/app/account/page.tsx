"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/sign-in");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email, role, avatar_url")
        .eq("id", user.id)
        .single();

      setUser({
        ...user,
        full_name: profile?.full_name,
        role: profile?.role,
        avatar_url: profile?.avatar_url,
      });
      setLoading(false);
    }

    loadUser();
  }, [router]);

  async function handleSignOut() {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f7]">
        <p className="text-black/40">Loading account...</p>
      </div>
    );
  }

  const orderStatuses = [
    { label: "To Pay", icon: "💳", active: true },
    { label: "Confirmed", icon: "✓" },
    { label: "Processing", icon: "📦" },
    { label: "Shipped", icon: "🚚" },
    { label: "To Receive", icon: "📬" },
    { label: "Completed", icon: "★" },
    { label: "Refund", icon: "↩" },
    { label: "Custom", icon: "✦" },
  ];

  const quickLinks = [
    { label: "Shipping Address", icon: "📍", href: "#" },
    { label: "Track Order", icon: "🔍", href: "#" },
    { label: "Help Center", icon: "🎧", href: "#" },
    { label: "Custom Order", icon: "✨", href: "/custom-order" },
    { label: "Policies", icon: "📄", href: "#" },
    { label: "Support", icon: "💬", href: "#" },
  ];

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      {/* Top bar */}
      <div className="bg-white border-b border-black/5 sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-sm text-black/50 hover:text-black flex items-center gap-1">
            ← Back to store
          </Link>
          <button
            onClick={() => setShowSettings(true)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5"
          >
            ⚙️
          </button>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Profile header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setShowAvatarPicker(true)}
            className="relative w-16 h-16 rounded-full bg-black/10 flex items-center justify-center text-2xl font-semibold text-black/60"
          >
            {(user?.full_name || user?.email || "U")[0].toUpperCase()}
            <span className="absolute bottom-0 right-0 w-5 h-5 bg-black rounded-full flex items-center justify-center text-white text-[10px]">
              ✎
            </span>
          </button>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              {user?.full_name || "Customer"}
            </h1>
            <p className="text-sm text-black/40">{user?.email}</p>
            {user?.role === "admin" && (
              <Link
                href="/admin"
                className="inline-block mt-1 text-xs font-medium bg-black text-white px-2.5 py-0.5 rounded-full"
              >
                Admin Dashboard →
              </Link>
            )}
          </div>
        </div>

        {/* Order Status Grid */}
        <div className="bg-white rounded-2xl border border-black/5 p-5 mb-4">
          <div className="grid grid-cols-4 gap-4">
            {orderStatuses.map((item) => (
              <button
                key={item.label}
                className="flex flex-col items-center gap-1.5 group"
              >
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center text-lg transition ${
                    item.active
                      ? "bg-black text-white"
                      : "bg-black/5 text-black/50 group-hover:bg-black/10"
                  }`}
                >
                  {item.icon}
                </div>
                <span
                  className={`text-[11px] font-medium ${
                    item.active ? "text-black" : "text-black/40"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-2xl border border-black/5 p-5 mb-4">
          <div className="grid grid-cols-4 gap-4">
            {quickLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center gap-1.5 group"
              >
                <div className="w-11 h-11 rounded-full bg-black/5 flex items-center justify-center text-lg group-hover:bg-black/10 transition">
                  {item.icon}
                </div>
                <span className="text-[11px] font-medium text-black/50 text-center leading-tight">
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Empty state for orders */}
        <div className="bg-white rounded-2xl border border-black/5 p-8 text-center">
          <p className="text-black/30 text-sm">No active orders right now</p>
          <Link
            href="/"
            className="inline-block mt-4 px-5 py-2.5 bg-black text-white text-sm font-medium rounded-full"
          >
            Start Shopping
          </Link>
        </div>
      </main>

      {/* Settings Sheet */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowSettings(false)}
          />
          <div className="relative bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-6 pb-10 animate-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-black/40 mb-4">{user?.email}</p>

            <div className="space-y-2">
              <button className="w-full text-left px-4 py-3.5 rounded-xl bg-black/[0.03] hover:bg-black/[0.06] transition">
                <p className="text-sm font-medium">Account & Security</p>
                <p className="text-xs text-black/40">Email and password</p>
              </button>
              <button className="w-full text-left px-4 py-3.5 rounded-xl bg-black/[0.03] hover:bg-black/[0.06] transition">
                <p className="text-sm font-medium">Delivery Preference</p>
                <p className="text-xs text-black/40">Default delivery method</p>
              </button>
              <button className="w-full text-left px-4 py-3.5 rounded-xl bg-black/[0.03] hover:bg-black/[0.06] transition">
                <p className="text-sm font-medium">Addresses</p>
                <p className="text-xs text-black/40">Manage shipping addresses</p>
              </button>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full mt-6 py-3.5 text-red-500 text-sm font-medium rounded-xl bg-red-50 hover:bg-red-100 transition"
            >
              Log out
            </button>
          </div>
        </div>
      )}

      {/* Avatar Picker Sheet */}
      {showAvatarPicker && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowAvatarPicker(false)}
          />
          <div className="relative bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-6 pb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Profile Picture</h2>
              <button
                onClick={() => setShowAvatarPicker(false)}
                className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full bg-black/10 flex items-center justify-center text-4xl font-semibold text-black/50">
                {(user?.full_name || user?.email || "U")[0].toUpperCase()}
              </div>
            </div>

            <button className="w-full py-3.5 bg-black text-white text-sm font-medium rounded-full mb-4">
              Upload a Photo
            </button>

            <p className="text-xs text-black/40 text-center mb-3">Or choose an avatar</p>
            <div className="flex justify-center gap-3">
              {["🖤", "👑", "✨", "🔥", "💎"].map((emoji) => (
                <button
                  key={emoji}
                  className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center text-xl hover:bg-black/10 transition"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
