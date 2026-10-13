"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/callback?next=/account/change-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send reset email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f5f0] flex flex-col">
      <header className="border-b border-[#e6e4dc] bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#263b2e] text-sm font-bold text-white">R</span>
            <span className="font-semibold text-[#202a23]">Regal Store</span>
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-[#e6e4dc] bg-white p-8 shadow-sm">
          {sent ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#edf1eb] text-[#263b2e]">✓</div>
              <h1 className="text-xl font-semibold text-[#202a23]">Check your email</h1>
              <p className="mt-3 text-sm leading-6 text-[#687168]">
                If an account exists for <strong>{email}</strong>, we sent a link to reset your password.
              </p>
              <Link href="/sign-in" className="mt-6 inline-block rounded-full bg-[#263b2e] px-6 py-3 text-sm font-medium text-white">
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-semibold tracking-tight text-[#202a23]">Forgot password</h1>
              <p className="mt-2 text-sm text-[#687168]">Enter your email and we&apos;ll send a reset link.</p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-black/10 bg-[#f7f5f0] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#263b2e]/20"
                  />
                </div>
                {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-[#263b2e] py-3.5 text-sm font-medium text-white disabled:opacity-50"
                >
                  {loading ? "Sending…" : "Send reset link"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-[#687168]">
                <Link href="/sign-in" className="font-medium text-[#263b2e] hover:underline">← Back to sign in</Link>
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
