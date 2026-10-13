"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const AVATARS = ["🖤", "👑", "✨", "🔥", "💎", "🦁", "🌟", "🎯"];

const accountLinks = [
  { label: "Overview", href: "/account", icon: "⌂" },
  { label: "Track an order", href: "/account/track", icon: "↗" },
  { label: "Saved addresses", href: "/account/addresses", icon: "⌖" },
  { label: "Help centre", href: "/account/help", icon: "?" },
  { label: "Custom request", href: "/custom-order", icon: "✳" },
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

  useEffect(() => {
    async function loadUser() {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

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
      setMessage("We couldn't save that change. Please try again.");
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
      <div className="min-h-screen flex items-center justify-center bg-[#f7f5f0]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-full bg-[#dce4dc]" />
          <p className="text-sm text-[#68736a]">Preparing your account…</p>
        </div>
      </div>
    );
  }

  const displayName = user?.full_name?.trim() || "there";
  const initials = (user?.full_name || user?.email || "U").trim().charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#202a23] md:flex">
      <aside className="hidden w-[260px] shrink-0 flex-col border-r border-[#e6e4dc] bg-white md:flex">
        <Link href="/" className="flex h-[88px] items-center gap-3 border-b border-[#efeee8] px-7">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#263b2e] font-serif text-xl text-white">R</span>
          <span>
            <span className="block font-serif text-[22px] leading-tight tracking-tight">Regal Store</span>
            <span className="mt-1 block text-[9px] font-bold uppercase tracking-[.22em] text-[#8a9389]">Customer space</span>
          </span>
        </Link>

        <div className="px-5 pt-7">
          <p className="px-3 text-[10px] font-bold uppercase tracking-[.2em] text-[#a0a59b]">Your account</p>
          <nav className="mt-3 space-y-1">
            {accountLinks.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${index === 0 ? "bg-[#edf1eb] font-semibold text-[#263b2e]" : "text-[#687168] hover:bg-[#f7f5f0] hover:text-[#263b2e]"}`}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-current/10 text-base">{item.icon}</span>
                {item.label}
                {index === 0 && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#a65f3e]" />}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-5">
          <div className="rounded-2xl bg-[#263b2e] p-5 text-white">
            <p className="font-serif text-xl leading-snug">Looking for something special?</p>
            <p className="mt-2 text-xs leading-5 text-white/65">Tell us what you have in mind and we’ll help you make a request.</p>
            <Link href="/custom-order" className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.1em] text-[#e5c5a8] hover:text-white">Make a request <span>↗</span></Link>
          </div>
          <Link href="/" className="mt-5 flex items-center gap-2 px-3 py-2 text-sm text-[#7a8178] hover:text-[#263b2e]">← Back to the store</Link>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-[#e6e4dc] bg-[#f7f5f0]/95 backdrop-blur">
          <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
            <div className="flex items-center gap-3 md:hidden">
              <Link href="/" aria-label="Back to store" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#dedfd6] bg-white">←</Link>
              <span className="font-serif text-xl">Regal Store</span>
            </div>
            <div className="hidden md:block">
              <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#9a7963]">Customer portal</p>
              <p className="mt-1 text-sm text-[#687168]">Your details, requests and delivery updates.</p>
            </div>
            <div className="flex items-center gap-3">
              {user?.role === "admin" && <Link href="/admin" className="hidden rounded-full border border-[#d8dfd6] px-4 py-2 text-xs font-semibold text-[#263b2e] hover:bg-white sm:inline-flex">Admin dashboard ↗</Link>}
              <button onClick={() => setShowSettings(true)} className="flex h-10 items-center gap-2 rounded-full border border-[#dedfd6] bg-white px-3 text-sm hover:border-[#aab8a8]" aria-label="Open account settings">
                <span>⚙</span><span className="hidden sm:inline">Settings</span>
              </button>
              <button onClick={() => setShowAvatarPicker(true)} className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#263b2e] text-lg text-white ring-2 ring-white" aria-label="Change profile avatar">
                {selectedAvatar || initials}
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1440px] px-5 pb-28 pt-7 sm:px-8 sm:pt-10 lg:px-12 lg:pb-12">
          {message && (
            <div className="mb-5 flex items-center justify-between rounded-xl border border-[#d8dfd6] bg-white px-4 py-3 text-sm text-[#263b2e]">
              <span>{message}</span><button onClick={() => setMessage(null)} aria-label="Dismiss message">✕</button>
            </div>
          )}

          <section className="relative isolate overflow-hidden rounded-[26px] bg-[#263b2e] px-6 py-8 text-white sm:px-9 sm:py-10 lg:px-12 lg:py-12">
            <div className="absolute -right-10 -top-24 h-64 w-64 rounded-full border border-white/10 sm:right-16 sm:h-80 sm:w-80" />
            <div className="absolute -right-2 -top-12 h-48 w-48 rounded-full border border-white/10 sm:right-24 sm:h-64 sm:w-64" />
            <div className="relative max-w-2xl">
              <p className="text-[10px] font-bold uppercase tracking-[.24em] text-[#e5c5a8] sm:text-xs">Your Regal account</p>
              <h1 className="mt-3 font-serif text-4xl leading-[1.04] tracking-[-.04em] sm:text-5xl lg:text-6xl">Good to see you, {displayName}.</h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-white/70 sm:text-base sm:leading-7">Your personal space to follow delivery updates, manage your details and get help with your next find.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/account/track" className="inline-flex min-h-11 items-center gap-3 rounded-full bg-[#f2e7d8] px-5 text-xs font-bold uppercase tracking-[.1em] text-[#263b2e] hover:bg-white">Track an order <span>↗</span></Link>
                <Link href="/" className="inline-flex min-h-11 items-center rounded-full border border-white/25 px-5 text-xs font-bold uppercase tracking-[.1em] text-white hover:bg-white/10">Continue shopping</Link>
              </div>
            </div>
            <div className="relative mt-8 flex items-center gap-3 border-t border-white/15 pt-5 sm:absolute sm:bottom-8 sm:right-9 sm:mt-0 sm:border-0 sm:pt-0 lg:bottom-10 lg:right-12">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-lg">{selectedAvatar || initials}</div>
              <div><p className="text-sm font-medium">{user?.full_name || "Regal customer"}</p><p className="mt-0.5 text-xs text-white/55">{user?.email}</p></div>
            </div>
          </section>

          <div className="mt-8 grid gap-7 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,.75fr)]">
            <div className="min-w-0">
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#a65f3e]">Order centre</p>
                  <h2 className="mt-1 font-serif text-2xl tracking-tight sm:text-3xl">Your orders</h2>
                </div>
                <Link href="/account/track" className="pb-1 text-xs font-semibold text-[#536b58] hover:text-[#a65f3e]">Track an order ↗</Link>
              </div>
              <section className="rounded-[22px] border border-[#e6e4dc] bg-white p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f0eee6] text-xl">📦</div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif text-xl">Your order updates will appear here</h3>
                    <p className="mt-2 max-w-lg text-sm leading-6 text-[#777e74]">Orders placed through WhatsApp may need to be confirmed by the store before a tracking record is available. We won’t show made-up order history or delivery statuses.</p>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <Link href="/account/track" className="inline-flex min-h-10 items-center rounded-full bg-[#263b2e] px-4 text-xs font-bold text-white hover:bg-[#354e40]">Open order tracking</Link>
                      <Link href="/account/help" className="inline-flex min-h-10 items-center rounded-full border border-[#dfe1d8] px-4 text-xs font-semibold text-[#536056] hover:bg-[#f7f5f0]">Need help?</Link>
                    </div>
                  </div>
                </div>
              </section>

              <div className="mb-4 mt-8">
                <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#a65f3e]">Your shortcuts</p>
                <h2 className="mt-1 font-serif text-2xl tracking-tight sm:text-3xl">Manage your account</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Link href="/account/addresses" className="group flex items-center gap-4 rounded-[20px] border border-[#e6e4dc] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#b7c3b4] hover:shadow-sm">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf1eb] text-xl text-[#263b2e]">⌖</span>
                  <span className="min-w-0 flex-1"><span className="block font-semibold">Delivery addresses</span><span className="mt-1 block text-xs text-[#83887f]">Review your saved details</span></span>
                  <span className="text-lg text-[#9aa095] transition group-hover:translate-x-1">→</span>
                </Link>
                <Link href="/account/support" className="group flex items-center gap-4 rounded-[20px] border border-[#e6e4dc] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#b7c3b4] hover:shadow-sm">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4e9df] text-xl text-[#9a5e3f]">♡</span>
                  <span className="min-w-0 flex-1"><span className="block font-semibold">Customer support</span><span className="mt-1 block text-xs text-[#83887f]">Get help with a request</span></span>
                  <span className="text-lg text-[#9aa095] transition group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </div>

            <aside className="space-y-4">
              <section className="rounded-[22px] border border-[#e6e4dc] bg-white p-6 sm:p-7">
                <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#a65f3e]">Profile</p>
                <h2 className="mt-2 font-serif text-2xl">Your details</h2>
                <div className="mt-5 flex items-center gap-3 border-b border-[#efeee8] pb-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#263b2e] text-lg text-white">{selectedAvatar || initials}</div>
                  <div className="min-w-0"><p className="truncate text-sm font-semibold">{user?.full_name || "Name not added"}</p><p className="mt-1 truncate text-xs text-[#83887f]">{user?.email}</p></div>
                </div>
                <button onClick={() => setShowSettings(true)} className="mt-4 w-full rounded-full border border-[#dfe1d8] py-3 text-xs font-bold uppercase tracking-[.1em] text-[#536056] hover:bg-[#f7f5f0]">Account settings</button>
              </section>

              <section className="rounded-[22px] border border-[#e6e4dc] bg-[#eee9df] p-6 sm:p-7">
                <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#a65f3e]">A personal touch</p>
                <h2 className="mt-2 font-serif text-2xl leading-tight">Can’t find what you’re looking for?</h2>
                <p className="mt-3 text-sm leading-6 text-[#6d7269]">Send us a product photo, name or link. We can help you check whether it can be sourced.</p>
                <Link href="/custom-order" className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.1em] text-[#263b2e] hover:text-[#a65f3e]">Start a custom request <span>↗</span></Link>
              </section>

              <button onClick={handleSignOut} className="flex w-full items-center justify-between rounded-[18px] border border-[#e6e4dc] bg-white px-5 py-4 text-sm text-[#777e74] hover:border-[#d5b9aa] hover:text-[#9a5e3f]">
                <span>Sign out of your account</span><span>↗</span>
              </button>
            </aside>
          </div>

          <footer className="mt-10 border-t border-[#e6e4dc] pt-5 text-xs text-[#92968d]">
            <div className="flex flex-wrap items-center justify-between gap-3"><span>Regal Store · Customer space</span><div className="flex gap-4"><Link href="/account/policies" className="hover:text-[#263b2e]">Policies</Link><Link href="/account/help" className="hover:text-[#263b2e]">Help centre</Link><Link href="/" className="hover:text-[#263b2e]">Storefront</Link></div></div>
          </footer>
        </main>
      </div>

      {showSettings && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/35 sm:items-center sm:p-4" onClick={() => setShowSettings(false)}>
          <section className="relative w-full max-w-md rounded-t-[28px] bg-white p-6 pb-9 shadow-2xl sm:rounded-[24px]" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#a65f3e]">Your profile</p><h2 className="mt-1 font-serif text-2xl">Account settings</h2></div>
              <button onClick={() => setShowSettings(false)} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f2f0e9]" aria-label="Close settings">✕</button>
            </div>
            <p className="mt-5 break-all text-sm text-[#687168]">{user?.email}</p>
            <div className="mt-5 space-y-2">
              <div className="rounded-xl bg-[#f7f5f0] px-4 py-3.5"><p className="text-sm font-semibold">Account & security</p><p className="mt-1 text-xs text-[#83887f]">Your sign-in email is shown above.</p></div>
              <Link href="/account/addresses" className="block rounded-xl bg-[#f7f5f0] px-4 py-3.5"><p className="text-sm font-semibold">Delivery addresses</p><p className="mt-1 text-xs text-[#83887f]">Open address management ↗</p></Link>
            </div>
            <button onClick={handleSignOut} className="mt-5 w-full rounded-full bg-[#f8eae6] py-3.5 text-sm font-semibold text-[#9c493a] hover:bg-[#f2ddd7]">Sign out</button>
          </section>
        </div>
      )}

      {showAvatarPicker && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/35 sm:items-center sm:p-4" onClick={() => setShowAvatarPicker(false)}>
          <section className="relative w-full max-w-md rounded-t-[28px] bg-white p-6 pb-9 shadow-2xl sm:rounded-[24px]" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#a65f3e]">Personalise</p><h2 className="mt-1 font-serif text-2xl">Profile avatar</h2></div><button onClick={() => setShowAvatarPicker(false)} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f2f0e9]" aria-label="Close avatar picker">✕</button></div>
            <div className="my-6 flex justify-center"><div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#263b2e] text-3xl text-white">{selectedAvatar || initials}</div></div>
            <p className="mb-3 text-center text-xs text-[#83887f]">Choose an avatar</p>
            <div className="flex flex-wrap justify-center gap-3">
              {AVATARS.map((avatar) => <button key={avatar} onClick={() => saveAvatar(avatar)} disabled={saving} aria-label={`Choose avatar ${avatar}`} className={`flex h-12 w-12 items-center justify-center rounded-full text-xl transition disabled:opacity-50 ${selectedAvatar === avatar ? "bg-[#263b2e] text-white ring-2 ring-[#d8dfd6] ring-offset-2" : "bg-[#f0eee6] hover:bg-[#e2e8df]"}`}>{avatar}</button>)}
            </div>
            {saving && <p className="mt-4 text-center text-sm text-[#687168]">Saving your avatar…</p>}
          </section>
        </div>
      )}
    </div>
  );
}
