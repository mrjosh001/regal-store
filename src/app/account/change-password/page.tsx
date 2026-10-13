"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      setTimeout(() => router.push("/account"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f5f0]">
      <div className="border-b border-[#e6e4dc] bg-white">
        <div className="mx-auto flex h-14 max-w-lg items-center gap-3 px-4">
          <Link href="/account" className="text-sm text-[#687168] hover:text-[#263b2e]">← Back</Link>
          <span className="font-semibold text-[#202a23]">Change password</span>
        </div>
      </div>

      <main className="mx-auto max-w-md px-4 py-10">
        <div className="rounded-2xl border border-[#e6e4dc] bg-white p-6 shadow-sm">
          {done ? (
            <p className="text-center text-sm text-[#263b2e]">Password updated. Redirecting…</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-[#687168]">Choose a new password for your Regal Store account.</p>

              <div>
                <label className="mb-1.5 block text-sm font-medium">New password</label>
                <div className="relative">
                  <input
                    type={show ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-black/10 bg-[#f7f5f0] px-4 py-3 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-[#263b2e]/20"
                  />
                  <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#536b58]">
                    {show ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Confirm password</label>
                <input
                  type={show ? "text" : "password"}
                  required
                  minLength={6}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full rounded-xl border border-black/10 bg-[#f7f5f0] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#263b2e]/20"
                />
              </div>

              {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

              <button type="submit" disabled={loading} className="w-full rounded-full bg-[#263b2e] py-3.5 text-sm font-medium text-white disabled:opacity-50">
                {loading ? "Saving…" : "Update password"}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
