"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AccountActionGrid from "@/components/AccountActionGrid";

const AVATARS = ["🖤", "👑", "✨", "🔥", "💎", "🦁", "🌟", "🎯"];
const accountLinks = [
  { label: "Overview", href: "/account", icon: "⌂" },
  { label: "Settings", href: "/account/settings", icon: "⚙" },
  { label: "Track an order", href: "/account/track", icon: "↗" },
  { label: "Saved addresses", href: "/account/addresses", icon: "⌖" },
  { label: "Help centre", href: "/account/help", icon: "?" },
  { label: "Custom request", href: "/custom-order", icon: "✳" },
];

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

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
        if (!authUser) { redirecting = true; router.replace("/sign-in"); return; }
        const { data: profile, error: profileError } = await supabase.from("profiles").select("full_name, email, role, avatar_url").eq("id", authUser.id).maybeSingle();
        if (profileError) throw profileError;
        if (!cancelled) {
          setUser({ ...authUser, full_name: profile?.full_name, role: profile?.role, avatar_url: profile?.avatar_url });
          setSelectedAvatar(profile?.avatar_url || null);
        }
      } catch (error) {
        if (!cancelled) setLoadError(error instanceof Error ? error.message : "We couldn't load your account.");
      } finally {
        if (!cancelled && !redirecting) setLoading(false);
      }
    }
    void loadUser();
    return () => { cancelled = true; };
  }, [router]);

  async function saveAvatar(avatar: string) {
    if (!user?.id) return;
    setSaving(true);
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { error } = await supabase.from("profiles").update({ avatar_url: avatar }).eq("id", user.id);
    if (!error) {
      setSelectedAvatar(avatar); setUser({ ...user, avatar_url: avatar }); setMessage("Profile avatar updated."); setShowAvatarPicker(false);
    } else setMessage("We couldn't save that change.");
    setSaving(false);
  }

  async function handleSignOut() {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-[#f7f5f0]"><p className="text-sm text-[#68736a]">Preparing your account…</p></div>;
  if (loadError) return <div className="flex min-h-screen items-center justify-center bg-[#f7f5f0] px-5"><section className="w-full max-w-md rounded-2xl border border-[#e6e4dc] bg-white p-7 text-center"><h1 className="mt-3 font-serif text-2xl">We couldn't load your account</h1><p className="mt-3 text-sm text-[#687168]">{loadError}</p><button onClick={() => window.location.reload()} className="mt-6 w-full rounded-full bg-[#263b2e] px-5 py-3 text-sm font-semibold text-white">Try again</button></section></div>;

  const displayName = user?.full_name?.trim() || "there";
  const initials = (user?.full_name || user?.email || "U").trim().charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#202a23] md:flex">
      <aside className="hidden w-[260px] shrink-0 flex-col border-r border-[#e6e4dc] bg-white md:flex">
        <Link href="/" className="flex h-[88px] items-center gap-3 border-b border-[#efeee8] px-7">
          <Image src="/regals-drip-logo.svg" alt="Regal’s Drip" width={48} height={48} className="h-12 w-12 shrink-0 object-contain" priority />
          <span><span className="block font-serif text-[22px] leading-tight tracking-tight">Regal’s Drip</span><span className="mt-1 block text-[9px] font-bold uppercase tracking-[.22em] text-[#8a9389]">Customer space</span></span>
        </Link>
        <div className="px-5 pt-7"><p className="px-3 text-[10px] font-bold uppercase tracking-[.2em] text-[#a0a59b]">Your account</p><nav className="mt-3 space-y-1">{accountLinks.map((item, index) => <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${index === 0 ? "bg-[#edf1eb] font-semibold text-[#263b2e]" : "text-[#687168] hover:bg-[#f7f5f0] hover:text-[#263b2e]"}`}><span className="flex h-7 w-7 items-center justify-center rounded-lg border border-current/10 text-base">{item.icon}</span>{item.label}</Link>)}</nav></div>
        <div className="mt-auto p-5"><Link href="/" className="mt-5 flex items-center gap-2 px-3 py-2 text-sm text-[#7a8178] hover:text-[#263b2e]">← Back to the store</Link></div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-[#e6e4dc] bg-[#f7f5f0]/95 backdrop-blur"><div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12"><div className="flex items-center gap-3 md:hidden"><Link href="/" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#dedfd6] bg-white">←</Link><Image src="/regals-drip-logo.svg" alt="Regal’s Drip" width={40} height={40} className="h-10 w-10 object-contain" priority /></div><div className="hidden md:block"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#9a7963]">Customer portal</p><p className="mt-1 text-sm text-[#687168]">Your details, requests and delivery updates.</p></div><div className="flex items-center gap-3">{user?.role === "admin" && <Link href="/admin" className="hidden rounded-full border border-[#d8dfd6] px-4 py-2 text-xs font-semibold text-[#263b2e] hover:bg-white sm:inline-flex">Admin dashboard ↗</Link>}<button type="button" onClick={() => setShowAccountMenu(true)} aria-label="Open account menu" aria-expanded={showAccountMenu} className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dedfd6] bg-white text-lg text-[#263b2e] shadow-sm transition hover:bg-[#f1efe8]">☰</button></div></div></header>

        <main className="mx-auto max-w-[1440px] px-5 pb-28 pt-7 sm:px-8 sm:pt-10 lg:px-12 lg:pb-12">
          {message && <div className="mb-5 flex items-center justify-between rounded-xl border border-[#d8dfd6] bg-white px-4 py-3 text-sm text-[#263b2e]"><span>{message}</span><button onClick={() => setMessage(null)}>✕</button></div>}
          <section className="relative isolate overflow-hidden rounded-[26px] bg-[#263b2e] px-6 py-8 text-white sm:px-9 sm:py-10 lg:px-12 lg:py-12"><div className="absolute -right-10 -top-24 h-64 w-64 rounded-full border border-white/10"/><div className="relative max-w-2xl"><p className="text-[10px] font-bold uppercase tracking-[.24em] text-[#e5c5a8] sm:text-xs">Your Regal account</p><h1 className="mt-3 font-serif text-4xl leading-[1.04] tracking-[-.04em] sm:text-5xl lg:text-6xl">Good to see you, {displayName}.</h1><p className="mt-4 max-w-xl text-sm leading-6 text-white/70 sm:text-base">Follow delivery updates, manage your details and get help with your next find.</p><div className="mt-7 flex flex-wrap gap-3"><Link href="/account/track" className="inline-flex min-h-11 items-center gap-3 rounded-full bg-[#f2e7d8] px-5 text-xs font-bold uppercase tracking-[.1em] text-[#263b2e] hover:bg-white">Track an order ↗</Link><Link href="/cart" className="inline-flex min-h-11 items-center rounded-full border border-white/25 px-5 text-xs font-bold uppercase tracking-[.1em] text-white hover:bg-white/10">View cart</Link><Link href="/" className="inline-flex min-h-11 items-center rounded-full border border-white/25 px-5 text-xs font-bold uppercase tracking-[.1em] text-white hover:bg-white/10">Continue shopping</Link></div></div></section>
          <div className="mt-8 grid gap-7 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,.75fr)]"><div className="min-w-0"><div className="mb-4 mt-2"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#a65f3e]">Browse</p><h2 className="mt-1 font-serif text-2xl tracking-tight sm:text-3xl">Categories</h2><p className="mt-1 text-sm text-[#687168]">Tap a category to open its pages.</p></div><AccountActionGrid/></div><aside className="space-y-4"><section className="rounded-[22px] border border-[#e6e4dc] bg-white p-6 sm:p-7"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#a65f3e]">Profile</p><h2 className="mt-2 font-serif text-2xl">Your details</h2><div className="mt-5 flex items-center gap-3 border-b border-[#efeee8] pb-5"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#263b2e] text-lg text-white">{selectedAvatar || initials}</div><div className="min-w-0"><p className="truncate text-sm font-semibold">{user?.full_name || "Name not added"}</p><p className="mt-1 truncate text-xs text-[#83887f]">{user?.email}</p></div></div><Link href="/account/settings" className="mt-4 flex w-full items-center justify-center rounded-full border border-[#dfe1d8] py-3 text-xs font-bold uppercase tracking-[.1em] text-[#536056] hover:bg-[#f7f5f0]">Account settings</Link></section><button onClick={handleSignOut} className="flex w-full items-center justify-between rounded-[18px] border border-[#e6e4dc] bg-white px-5 py-4 text-sm text-[#777e74] hover:border-[#d5b9aa] hover:text-[#9a5e3f]"><span>Sign out of your account</span><span>↗</span></button></aside></div>
        </main>
      </div>

      {showAccountMenu && <div className="fixed inset-0 z-[70] bg-black/30" onClick={() => setShowAccountMenu(false)} aria-hidden="true"><aside role="dialog" aria-modal="true" aria-label="Account menu" className="absolute right-0 top-0 flex h-full w-[min(88vw,380px)] flex-col overflow-y-auto bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}><div className="flex items-center justify-between border-b border-[#e6e4dc] px-5 py-5 sm:px-6"><div className="flex min-w-0 items-center gap-3"><button type="button" onClick={() => setShowAvatarPicker(true)} className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#263b2e] text-lg text-white" aria-label="Change avatar">{selectedAvatar || initials}</button><div className="min-w-0"><p className="truncate text-sm font-semibold text-[#202a23]">{user?.full_name || "Your account"}</p><p className="truncate text-xs text-[#83887f]">{user?.email}</p></div></div><button type="button" onClick={() => setShowAccountMenu(false)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f2f0e9] text-lg text-[#263b2e]" aria-label="Close account menu">✕</button></div><div className="px-5 py-6 sm:px-6"><div className="mb-4 flex items-center gap-3 rounded-2xl bg-[#f7f5f0] p-3"><Image src="/regals-drip-logo.svg" alt="Regal’s Drip" width={52} height={52} className="h-13 w-13 object-contain"/><div><p className="font-serif text-lg">Regal’s Drip</p><p className="text-xs text-[#83887f]">Your account menu</p></div></div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#a65f3e]">Your account</p><nav className="mt-3 space-y-1">{accountLinks.filter((item) => item.label !== "Overview").map((item) => <Link key={item.href} href={item.href} onClick={() => setShowAccountMenu(false)} className="flex min-h-12 items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#536056] transition hover:bg-[#f7f5f0] hover:text-[#263b2e]"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#e6e4dc] bg-[#faf9f5] text-base">{item.icon}</span><span className="min-w-0 flex-1">{item.label}</span><span className="text-[#b0b5ad]">→</span></Link>)}</nav><div className="my-5 border-t border-[#efeee8]"/><Link href="/account/settings" onClick={() => setShowAccountMenu(false)} className="flex items-center gap-3 rounded-xl bg-[#edf1eb] px-3 py-3 text-sm font-semibold text-[#263b2e]"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-base">⚙</span><span className="min-w-0 flex-1">Name, password & security</span><span>→</span></Link>{user?.role === "admin" && <Link href="/admin" onClick={() => setShowAccountMenu(false)} className="mt-2 flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#536056] hover:bg-[#f7f5f0]"><span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e6e4dc]">⌘</span><span className="flex-1">Admin dashboard</span><span className="text-[#b0b5ad]">↗</span></Link>}</div><div className="mt-auto border-t border-[#e6e4dc] p-5 sm:p-6"><button type="button" onClick={handleSignOut} className="flex min-h-12 w-full items-center justify-between rounded-xl border border-[#e6e4dc] px-4 py-3 text-sm text-[#777e74] hover:border-[#d5b9aa] hover:text-[#9a5e3f]"><span>Sign out of your account</span><span>↗</span></button></div></aside></div>}

      {showAvatarPicker && <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/35 sm:items-center sm:p-4" onClick={() => setShowAvatarPicker(false)}><section className="w-full max-w-md rounded-t-[28px] bg-white p-6 pb-9 sm:rounded-[24px]" onClick={(e) => e.stopPropagation()}><div className="flex items-center justify-between"><h2 className="font-serif text-2xl">Choose avatar</h2><button onClick={() => setShowAvatarPicker(false)} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f2f0e9]">✕</button></div><div className="mt-5 grid grid-cols-4 gap-3">{AVATARS.map((a) => <button key={a} disabled={saving} onClick={() => saveAvatar(a)} className={`flex h-14 items-center justify-center rounded-2xl text-2xl ${selectedAvatar === a ? "bg-[#263b2e]" : "bg-[#f7f5f0]"}`}>{a}</button>)}</div></section></div>}
    </div>
  );
}
