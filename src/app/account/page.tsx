"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const AVATARS = ["🖤", "👑", "✨", "🔥", "💎", "🦁", "🌟", "🎯"];

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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
      setSelectedAvatar(profile?.avatar_url || null);
      setLoading(false);
    }

    loadUser();
  }, [router]);

  async function saveAvatar(avatar: string) {
    setSaving(true);
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();

    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: avatar })
      .eq("id", user.id);

    if (!error) {
      setSelectedAvatar(avatar);
      setUser({ ...user, avatar_url: avatar });
      setMessage("Avatar updated");
      setShowAvatarPicker(false);
    } else {
      setMessage(error.message);
    }
    setSaving(false);
  }

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
    { label: "To Pay", icon: "💳", href: "/account/orders?status=to-pay" },
    { label: "Confirmed", icon: "✓", href: "/account/orders?status=confirmed" },
    { label: "Processing", icon: "📦", href: "/account/orders?status=processing" },
    { label: "Shipped", icon: "🚚", href: "/account/orders?status=shipped" },
    { label: "To Receive", icon: "📬", href: "/account/orders?status=to-receive" },
    { label: "Completed", icon: "★", href: "/account/orders?status=completed" },
    { label: "Refund", icon: "↩", href: "/account/orders?status=refund" },
    { label: "Custom", icon: "✦", href: "/custom-order" },
  ];

  const quickLinks = [
    { label: "Shipping Address", icon: "📍", href: "/account/addresses" },
    { label: "Track Order", icon: "🔍", href: "/account/track" },
    { label: "Help Center", icon: "🎧", href: "/account/help" },
    { label: "Custom Order", icon: "✨", href: "/custom-order" },
    { label: "Policies", icon: "📄", href: "/account/policies" },
    { label: "Support", icon: "💬", href: "/account/support" },
  ];

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      {/* Top bar */}
      <div className="bg-white border-b border-black/5 sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => setShowDrawer(true)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 text-lg"
          >
            ☰
          </button>
          <span className="font-semibold text-sm">My Account</span>
          <button
            onClick={() => setShowSettings(true)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5"
          >
            ⚙️
          </button>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 py-6">
        {message && (
          <div className="mb-4 px-4 py-2.5 bg-black text-white text-sm rounded-xl flex justify-between">
            <span>{message}</span>
            <button onClick={() => setMessage(null)}>✕</button>
          </div>
        )}

        {/* Profile header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setShowAvatarPicker(true)}
            className="relative w-16 h-16 rounded-full bg-black/10 flex items-center justify-center text-2xl"
          >
            {selectedAvatar || (user?.full_name || user?.email || "U")[0].toUpperCase()}
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
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center gap-1.5 group"
              >
                <div className="w-11 h-11 rounded-full bg-black/5 flex items-center justify-center text-lg group-hover:bg-black/10 transition">
                  {item.icon}
                </div>
                <span className="text-[11px] font-medium text-black/50 text-center">
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-2xl border border-black/5 p-5 mb-4">
          <div className="grid grid-cols-3 gap-4">
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

        {/* Empty state */}
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

      {/* LEFT DRAWER */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowDrawer(false)} />
          <div className="relative bg-white w-72 h-full shadow-xl flex flex-col">
            <div className="p-5 border-b border-black/5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-black/10 flex items-center justify-center text-xl">
                  {selectedAvatar || (user?.full_name || "U")[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-sm">{user?.full_name || "Customer"}</p>
                  <p className="text-xs text-black/40">{user?.email}</p>
                </div>
              </div>
            </div>

            <nav className="flex-1 p-3 space-y-1">
              <Link href="/" onClick={() => setShowDrawer(false)} className="block px-4 py-3 rounded-xl text-sm font-medium hover:bg-black/5">
                🏠 Home / Store
              </Link>
              <Link href="/account" onClick={() => setShowDrawer(false)} className="block px-4 py-3 rounded-xl text-sm font-medium bg-black/5">
                👤 My Account
              </Link>
              <Link href="/custom-order" onClick={() => setShowDrawer(false)} className="block px-4 py-3 rounded-xl text-sm font-medium hover:bg-black/5">
                ✨ Custom Order
              </Link>
              {user?.role === "admin" && (
                <Link href="/admin" onClick={() => setShowDrawer(false)} className="block px-4 py-3 rounded-xl text-sm font-medium hover:bg-black/5">
                  ⚙️ Admin Dashboard
                </Link>
              )}
              <button
                onClick={() => {
                  setShowDrawer(false);
                  setShowSettings(true);
                }}
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium hover:bg-black/5"
              >
                🔧 Settings
              </button>
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

      {/* Settings Sheet */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowSettings(false)} />
          <div className="relative bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-6 pb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Settings</h2>
              <button onClick={() => setShowSettings(false)} className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center">
                ✕
              </button>
            </div>
            <p className="text-sm text-black/40 mb-4">{user?.email}</p>
            <div className="space-y-2">
              <div className="px-4 py-3.5 rounded-xl bg-black/[0.03]">
                <p className="text-sm font-medium">Account & Security</p>
                <p className="text-xs text-black/40">Email and password</p>
              </div>
              <div className="px-4 py-3.5 rounded-xl bg-black/[0.03]">
                <p className="text-sm font-medium">Delivery Preference</p>
                <p className="text-xs text-black/40">Coming soon</p>
              </div>
              <div className="px-4 py-3.5 rounded-xl bg-black/[0.03]">
                <p className="text-sm font-medium">Addresses</p>
                <p className="text-xs text-black/40">Coming soon</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full mt-6 py-3.5 text-red-500 text-sm font-medium rounded-xl bg-red-50"
            >
              Log out
            </button>
          </div>
        </div>
      )}

      {/* Avatar Picker */}
      {showAvatarPicker && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAvatarPicker(false)} />
          <div className="relative bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-6 pb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Profile Picture</h2>
              <button onClick={() => setShowAvatarPicker(false)} className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center">
                ✕
              </button>
            </div>

            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full bg-black/10 flex items-center justify-center text-4xl">
                {selectedAvatar || (user?.full_name || "U")[0].toUpperCase()}
              </div>
            </div>

            <p className="text-xs text-black/40 text-center mb-3">Choose an avatar</p>
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {AVATARS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => saveAvatar(emoji)}
                  disabled={saving}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition ${
                    selectedAvatar === emoji
                      ? "bg-black text-white"
                      : "bg-black/5 hover:bg-black/10"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {saving && <p className="text-center text-sm text-black/40">Saving...</p>}
          </div>
        </div>
      )}
    </div>
  );
}
