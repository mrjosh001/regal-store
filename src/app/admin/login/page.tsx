"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data, error: signError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (signError) throw signError;
      const userId = data.user?.id;
      if (!userId) throw new Error("Sign-in failed.");
      const { data: profile, error: profileError } = await supabase.from("profiles").select("role, banned_at, deleted_at").eq("id", userId).maybeSingle();
      if (profileError) throw profileError;
      if (profile?.banned_at || profile?.deleted_at) { await supabase.auth.signOut(); throw new Error("This account has been suspended. Contact the store owner."); }
      if (profile?.role !== "admin") { await supabase.auth.signOut(); throw new Error("This account is not an admin. Use the customer sign-in instead."); }
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-white/10 bg-[#1c222b] p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <Image src="/regals-drip-logo.svg" alt="Regal’s Drip" width={72} height={72} className="mx-auto mb-4 h-[72px] w-[72px] object-contain" priority />
          <h1 className="text-2xl font-semibold tracking-tight text-white">Admin sign in</h1>
          <p className="mt-2 text-sm text-white/50">Staff access only · Regal’s Drip control room</p>
          {searchParams.get("error") === "forbidden" && <p className="mt-3 rounded-xl bg-red-500/15 px-3 py-2 text-xs text-red-300">You need an admin account to open the dashboard.</p>}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="mb-1.5 block text-sm font-medium text-white/80">Work email</label><input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#1769e0]/40" placeholder="admin@regal.store" /></div>
          <div><label className="mb-1.5 block text-sm font-medium text-white/80">Password</label><div className="relative"><input type={showPassword ? "text" : "password"} required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-16 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#1769e0]/40" placeholder="••••••••"/><button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-white/50">{showPassword ? "Hide" : "Show"}</button></div></div>
          {error && <p className="rounded-xl bg-red-500/15 px-4 py-3 text-sm text-red-300">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-full bg-[#1769e0] py-3.5 text-sm font-semibold text-white hover:bg-[#0957c3] disabled:opacity-50">{loading ? "Signing in…" : "Enter dashboard"}</button>
        </form>
        <p className="mt-6 text-center text-xs text-white/40">Customers should use <Link href="/sign-in" className="text-white/70 underline hover:text-white">customer sign-in</Link></p>
      </div>
      <p className="mt-6 text-center"><Link href="/" className="text-sm text-white/40 hover:text-white/70">← Back to store</Link></p>
    </div>
  );
}

export default function AdminLoginPage() {
  return <div className="flex min-h-screen flex-col items-center justify-center bg-[#12151c] px-4 py-12"><Suspense fallback={<p className="text-white/50">Loading…</p>}><AdminLoginForm /></Suspense></div>;
}
