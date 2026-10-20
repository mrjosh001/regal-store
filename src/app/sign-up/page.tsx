"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function SignUpPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function getSupabase() {
    const { createClient } = await import("@/lib/supabase/client");
    return createClient();
  }

  function getSiteOrigin() {
    if (typeof window === "undefined") return "https://regalsdrip.store";
    return process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }
    const supabase = await getSupabase();
    const callbackUrl = `${getSiteOrigin()}/auth/callback?flow=signup`;
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim() },
        emailRedirectTo: callbackUrl,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setSuccess(true);
    setLoading(false);
  }

  async function handleGoogleSignIn() {
    setLoading(true);
    setError(null);
    const supabase = await getSupabase();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${getSiteOrigin()}/auth/callback?next=/account` },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f7f5f0] px-4">
        <div className="w-full max-w-md rounded-2xl border border-[#e6e4dc] bg-white p-8 text-center shadow-sm">
          <Image src="/regals-drip-logo.svg" alt="Regal’s Drip" width={96} height={96} className="mx-auto mb-5 h-24 w-24 object-contain" priority />
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#6c796e]">Almost there</p>
          <h1 className="mb-2 text-2xl font-semibold tracking-tight text-[#202a23]">Verify your email</h1>
          <p className="mb-5 text-sm leading-6 text-[#687168]">We sent a confirmation link to <strong className="text-[#202a23]">{email}</strong>.</p>
          <div className="mb-6 rounded-xl bg-[#f7f5f0] px-4 py-4 text-left text-sm leading-6 text-[#536056]">
            <p className="font-semibold text-[#202a23]">Before you sign in</p>
            <ol className="mt-2 list-decimal space-y-1.5 pl-4">
              <li>Open the confirmation email from Regal’s Drip.</li>
              <li>If it is missing, check <strong>Spam, Junk, or Promotions</strong>.</li>
              <li>Tap <strong>Confirm my email</strong>. You’ll be returned to the Regal’s Drip sign-in page.</li>
            </ol>
          </div>
          <Link href="/sign-in" className="inline-flex w-full items-center justify-center rounded-full bg-[#263b2e] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[#354e40]">Go to Sign in</Link>
          <p className="mt-4 text-xs leading-5 text-[#83887f]">Didn’t receive it? Give it a minute, check your spam folder, and make sure <strong>{email}</strong> is correct.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f5f0]">
      <header className="border-b border-[#e6e4dc] bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/regals-drip-logo.svg" alt="Regal’s Drip" width={48} height={48} className="h-12 w-12 object-contain" priority />
              <span className="text-xl font-semibold tracking-tight text-[#202a23]">Regal’s Drip</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-[#e6e4dc] bg-white p-8 shadow-sm">
            <div className="mb-8 text-center"><h1 className="mb-2 text-2xl font-semibold tracking-tight text-[#202a23]">Create account</h1><p className="text-sm text-[#687168]">Join Regal’s Drip today</p></div>
            <button onClick={handleGoogleSignIn} disabled={loading} className="flex w-full items-center justify-center gap-3 rounded-xl border border-black/10 px-4 py-3 text-sm font-medium hover:bg-[#f7f5f0] disabled:opacity-50">
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>
            <div className="relative my-6"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-black/10" /></div><div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-black/40">or continue with email</span></div></div>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div><label className="mb-1.5 block text-sm font-medium text-[#202a23]">Full Name</label><input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" required autoComplete="name" className="w-full rounded-xl border border-black/10 bg-[#f7f5f0] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#263b2e]/20" /></div>
              <div><label className="mb-1.5 block text-sm font-medium text-[#202a23]">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" className="w-full rounded-xl border border-black/10 bg-[#f7f5f0] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#263b2e]/20" /></div>
              <div><label className="mb-1.5 block text-sm font-medium text-[#202a23]">Password</label><div className="relative"><input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" required minLength={6} autoComplete="new-password" className="w-full rounded-xl border border-black/10 bg-[#f7f5f0] px-4 py-3 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-[#263b2e]/20"/><button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#536b58]">{showPassword ? "Hide" : "Show"}</button></div></div>
              {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
              <button type="submit" disabled={loading} className="mt-2 w-full rounded-full bg-[#263b2e] py-3.5 font-medium text-white hover:bg-[#354e40] disabled:opacity-50">{loading ? "Creating account..." : "Create account"}</button>
            </form>
            <p className="mt-6 text-center text-sm text-[#687168]">Already have an account? <Link href="/sign-in" className="font-medium text-[#263b2e] hover:underline">Sign in</Link></p>
          </div>
          <div className="mt-6 text-center"><Link href="/" className="text-sm text-black/40 hover:text-[#263b2e]">← Back to shop</Link></div>
        </div>
      </main>
    </div>
  );
}
