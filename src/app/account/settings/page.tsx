"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AccountSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!authData.user) {
          router.replace("/sign-in?next=/account/settings");
          return;
        }
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("id", authData.user.id)
          .maybeSingle();
        if (!cancelled) {
          setUserId(authData.user.id);
          setEmail(profile?.email || authData.user.email || "");
          setFullName(profile?.full_name || "");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load settings.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const name = fullName.trim();
      if (!name) {
        setError("Please enter your name.");
        setSaving(false);
        return;
      }
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ full_name: name })
        .eq("id", userId);
      if (updateError) throw updateError;
      // Keep auth metadata in sync when possible
      await supabase.auth.updateUser({ data: { full_name: name } });
      setMessage("Your name has been updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your name.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f5f0]">
        <p className="text-sm text-[#687168]">Loading settings…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#202a23]">
      <header className="sticky top-0 z-20 border-b border-[#e6e4dc] bg-[#f7f5f0]/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-lg items-center gap-3 px-4">
          <Link
            href="/account"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#dedfd6] bg-white text-sm"
          >
            ←
          </Link>
          <h1 className="font-serif text-xl">Account settings</h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-5 px-4 py-6 pb-28">
        {message && (
          <p className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {message}
          </p>
        )}
        {error && (
          <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <section className="rounded-[20px] border border-[#e6e4dc] bg-white p-5">
          <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#a65f3e]">Profile</p>
          <h2 className="mt-1 font-serif text-2xl">Your name</h2>
          <p className="mt-1 text-sm text-[#687168]">This is how we greet you in the app.</p>
          <form onSubmit={saveName} className="mt-4 space-y-3">
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name"
              required
              className="w-full rounded-xl border border-black/10 bg-[#f7f5f0] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#263b2e]/20"
            />
            <p className="text-xs text-[#83887f]">Signed in as {email || "—"}</p>
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-full bg-[#263b2e] py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save name"}
            </button>
          </form>
        </section>

        <section className="overflow-hidden rounded-[20px] border border-[#e6e4dc] bg-white">
          <Link
            href="/account/change-password"
            className="flex items-center justify-between border-b border-[#efeee8] px-4 py-4"
          >
            <span>
              <span className="block text-sm font-semibold">Change password</span>
              <span className="mt-0.5 block text-xs text-[#83887f]">Update your sign-in password</span>
            </span>
            <span className="text-[#b0b5ad]">→</span>
          </Link>
          <Link
            href="/account/delete"
            className="flex items-center justify-between px-4 py-4"
          >
            <span>
              <span className="block text-sm font-semibold text-red-600">Delete account</span>
              <span className="mt-0.5 block text-xs text-red-500/80">Permanently remove your profile</span>
            </span>
            <span className="text-red-300">→</span>
          </Link>
        </section>

        <Link href="/account" className="block text-center text-sm text-[#687168] hover:text-[#263b2e]">
          ← Back to account
        </Link>
      </main>
    </div>
  );
}
