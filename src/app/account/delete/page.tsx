"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DeleteAccountPage() {
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (confirmText.trim().toUpperCase() !== "DELETE") {
      setError('Type DELETE to confirm.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error: rpcError } = await supabase.rpc("delete_own_account");
      if (rpcError) throw rpcError;
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete account.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f5f0]">
      <div className="border-b border-[#e6e4dc] bg-white">
        <div className="mx-auto flex h-14 max-w-lg items-center gap-3 px-4">
          <Link href="/account" className="text-sm text-[#687168] hover:text-[#263b2e]">
            ← Back
          </Link>
          <span className="font-semibold text-[#202a23]">Delete account</span>
        </div>
      </div>

      <main className="mx-auto max-w-md px-4 py-10">
        <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
          <h1 className="font-serif text-2xl text-[#202a23]">Delete your account</h1>
          <p className="mt-3 text-sm leading-6 text-[#687168]">
            This removes your profile from Regal Store and signs you out. Type{" "}
            <strong>DELETE</strong> to confirm.
          </p>

          <input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type DELETE"
            className="mt-5 w-full rounded-xl border border-black/10 bg-[#f7f5f0] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
          />

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <button
            type="button"
            disabled={loading}
            onClick={handleDelete}
            className="mt-5 w-full rounded-full bg-red-600 py-3.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Deleting…" : "Permanently delete my account"}
          </button>
        </div>
      </main>
    </div>
  );
}
