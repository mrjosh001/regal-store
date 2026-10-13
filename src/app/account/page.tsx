"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cartCount } from "@/lib/cart";

const AVATARS = ["🖤", "👑", "✨", "🔥", "💎", "🦁", "🌟", "🎯"];

const quickActions = [
  {
    label: "Continue shopping",
    href: "/",
    desc: "Browse clothing, bags and shoes",
    icon: "🛍️",
    tone: "bg-[#edf1eb] text-[#263b2e]",
  },
  {
    label: "Your cart",
    href: "/cart",
    desc: "Review items before ordering",
    icon: "🛒",
    tone: "bg-[#eef2f8] text-[#1e4d8c]",
  },
  {
    label: "Track an order",
    href: "/account/track",
    desc: "Check delivery updates",
    icon: "📦",
    tone: "bg-[#f4e9df] text-[#9a5e3f]",
  },
  {
    label: "Saved addresses",
    href: "/account/addresses",
    desc: "Manage delivery details",
    icon: "📍",
    tone: "bg-[#f0eee8] text-[#5a5e56]",
  },
  {
    label: "Custom request",
    href: "/custom-order",
    desc: "Ask us to source a piece",
    icon: "✨",
    tone: "bg-[#f7efe6] text-[#a65f3e]",
  },
  {
    label: "Help centre",
    href: "/account/help",
    desc: "Sizing, orders and support",
    icon: "💬",
    tone: "bg-[#eef0f4] text-[#3d4654]",
  },
  {
    label: "Change password",
    href: "/account/change-password",
    desc: "Update your sign-in security",
    icon: "🔒",
    tone: "bg-[#edf1eb] text-[#263b2e]",
  },
  {
    label: "Delete account",
    href: "/account/delete",
    desc: "Remove your profile anytime",
    icon: "🗑️",
    tone: "bg-[#fdecec] text-[#b42318]",
  },
];

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [itemsInCart, setItemsInCart] = useState(0);

  useEffect(() => {
    setItemsInCart(cartCount());
    function onCart() {
      setItemsInCart(cartCount());
    }
    window.addEventListener("cart-updated", onCart);
    return () => window.removeEventListener("cart-updated", onCart);
  }, []);

  useEffect(() => {
    let redirecting = false;
    let cancelled = false;

    async function loadUser() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;

        const authUser = authData.user;
        if (!authUser) {
          redirecting = true;
          router.replace("/sign-in");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("full_name, email, role, avatar_url, created_at")
          .eq("id", authUser.id)
          .maybeSingle();
        if (profileError) throw profileError;

        if (!cancelled) {
          setUser({
            ...authUser,
            full_name: profile?.full_name,
            role: profile?.role,
            avatar_url: profile?.avatar_url,
            created_at: profile?.created_at,
          });
          setSelectedAvatar(profile?.avatar_url || null);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error ? error.message : "We couldn't load your account."
          );
        }
      } finally {
        if (!cancelled && !redirecting) setLoading(false);
      }
    }

    void loadUser();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function saveAvatar(avatar: string) {
    if (!user?.id) return;
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
      setMessage("Profile avatar updated.");
      setShowAvatarPicker(false);
    } else {
      setMessage("We couldn't save that change.");
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
      <div className="flex min-h-screen items-center justify-center bg-[#f4f2ec]">
        <p className="text-sm text-[#68736a]">Preparing your space…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f2ec] px-5">
        <section className="w-full max-w-md rounded-3xl border border-[#e6e4dc] bg-white p-8 text-center">
          <h1 className="font-serif text-2xl">Account unavailable</h1>
          <p className="mt-3 text-sm text-[#687168]">{loadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 w-full rounded-full bg-[#263b2e] py-3 text-sm font-semibold text-white"
          >
            Try again
          </button>
        </section>
      </div>
    );
  }

  const displayName = user?.full_name?.trim() || "there";
  const initials = (user?.full_name || user?.email || "U").trim().charAt(0).toUpperCase();
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-NG", {
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-[#f4f2ec] text-[#202a23]">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-[#f4f2ec]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#263b2e] text-sm font-bold text-white">
              R
            </span>
            <span className="font-semibold tracking-tight">My Regal</span>
          </Link>
          <div className="flex items-center gap-2">
            {user?.role === "admin" && (
              <Link
                href="/admin"
                className="hidden rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold sm:inline"
              >
                Admin
              </Link>
            )}
            <Link
              href="/cart"
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-sm"
            >
              🛒
              {itemsInCart > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#263b2e] px-1 text-[10px] font-bold text-white">
                  {itemsInCart}
                </span>
              )}
            </Link>
            <button
              onClick={() => setShowAvatarPicker(true)}
              className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[#263b2e] text-sm text-white"
            >
              {selectedAvatar || initials}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-24 pt-8 sm:px-6 sm:pt-12">
        {message && (
          <div className="mb-5 flex items-center justify-between rounded-2xl border border-[#d8dfd6] bg-white px-4 py-3 text-sm">
            <span>{message}</span>
            <button onClick={() => setMessage(null)}>✕</button>
          </div>
        )}

        {/* Welcome hero */}
        <section className="relative overflow-hidden rounded-[28px] bg-[#1a2820] px-6 py-8 text-white sm:px-10 sm:py-12">
          <div className="pointer-events-none absolute -right-16 top-0 h-56 w-56 rounded-full bg-[#e8d5b5]/10 blur-3xl" />
          <div className="relative">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#e8d5b5]">
              Customer space
            </p>
            <h1 className="mt-3 font-serif text-3xl leading-tight tracking-tight sm:text-5xl">
              Hello, {displayName}
            </h1>
            <p className="mt-3 max-w-md text-sm leading-6 text-white/65">
              Orders, cart, addresses and support — everything in one calm place.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex min-h-11 items-center rounded-full bg-white px-5 text-xs font-bold uppercase tracking-[0.1em] text-[#1a2820]"
              >
                Shop now
              </Link>
              <Link
                href="/cart"
                className="inline-flex min-h-11 items-center rounded-full border border-white/25 px-5 text-xs font-bold uppercase tracking-[0.1em] text-white"
              >
                Cart{itemsInCart > 0 ? ` (${itemsInCart})` : ""}
              </Link>
            </div>
            {memberSince && (
              <p className="mt-6 text-[11px] text-white/40">Member since {memberSince}</p>
            )}
          </div>
        </section>

        {/* Icon action grid — Baymard pattern */}
        <section className="mt-10">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a65f3e]">
                Quick actions
              </p>
              <h2 className="mt-1 font-serif text-2xl sm:text-3xl">What do you need?</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="group flex flex-col rounded-2xl border border-black/[0.05] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5"
              >
                <span
                  className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl text-xl ${action.tone}`}
                >
                  {action.icon}
                </span>
                <span className="text-sm font-semibold leading-snug text-[#202a23]">
                  {action.label}
                </span>
                <span className="mt-1 text-[11px] leading-4 text-[#83887f]">{action.desc}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Profile strip */}
        <section className="mt-10 grid gap-4 sm:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-black/[0.05] bg-white p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a65f3e]">Profile</p>
            <div className="mt-4 flex items-center gap-4">
              <button
                onClick={() => setShowAvatarPicker(true)}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-[#263b2e] text-xl text-white"
              >
                {selectedAvatar || initials}
              </button>
              <div className="min-w-0">
                <p className="truncate font-semibold">{user?.full_name || "Add your name"}</p>
                <p className="mt-0.5 truncate text-sm text-[#83887f]">{user?.email}</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                onClick={() => setShowSettings(true)}
                className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold"
              >
                Settings
              </button>
              <Link
                href="/account/change-password"
                className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold"
              >
                Password
              </Link>
            </div>
          </div>

          <div className="rounded-2xl bg-[#263b2e] p-6 text-white">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e8d5b5]">
              Need a find?
            </p>
            <h3 className="mt-2 font-serif text-2xl leading-tight">We’ll source it for you</h3>
            <p className="mt-2 text-sm text-white/60">
              Send a photo, name or link — we’ll check availability.
            </p>
            <Link
              href="/custom-order"
              className="mt-5 inline-flex text-xs font-bold uppercase tracking-[0.1em] text-[#e8d5b5]"
            >
              Start request →
            </Link>
          </div>
        </section>

        <button
          onClick={handleSignOut}
          className="mt-8 w-full rounded-2xl border border-red-100 bg-white py-4 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          Sign out
        </button>

        <p className="mt-6 text-center text-xs text-[#92968d]">
          <Link href="/" className="hover:text-[#263b2e]">
            ← Back to storefront
          </Link>
        </p>
      </main>

      {/* Settings sheet */}
      {showSettings && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 sm:items-center sm:p-4"
          onClick={() => setShowSettings(false)}
        >
          <section
            className="w-full max-w-md rounded-t-3xl bg-white p-6 pb-10 sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl">Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f2f0e9]"
              >
                ✕
              </button>
            </div>
            <div className="mt-5 space-y-2">
              <Link href="/account/change-password" className="block rounded-xl bg-[#f7f5f0] px-4 py-3.5 text-sm font-semibold">
                Change password
              </Link>
              <Link href="/account/addresses" className="block rounded-xl bg-[#f7f5f0] px-4 py-3.5 text-sm font-semibold">
                Delivery addresses
              </Link>
              <Link href="/account/delete" className="block rounded-xl bg-red-50 px-4 py-3.5 text-sm font-semibold text-red-600">
                Delete account
              </Link>
            </div>
          </section>
        </div>
      )}

      {showAvatarPicker && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 sm:items-center sm:p-4"
          onClick={() => setShowAvatarPicker(false)}
        >
          <section
            className="w-full max-w-md rounded-t-3xl bg-white p-6 pb-10 sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl">Choose avatar</h2>
              <button
                onClick={() => setShowAvatarPicker(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f2f0e9]"
              >
                ✕
              </button>
            </div>
            <div className="mt-5 grid grid-cols-4 gap-3">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  disabled={saving}
                  onClick={() => saveAvatar(a)}
                  className={`flex h-14 items-center justify-center rounded-2xl text-2xl ${
                    selectedAvatar === a ? "bg-[#263b2e] ring-2 ring-[#263b2e]/30" : "bg-[#f7f5f0]"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
