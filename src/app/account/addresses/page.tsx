import Link from "next/link";

export default function AddressesPage() {
  return (
    <div className="min-h-screen bg-brand-surface">
      <div className="bg-white border-b border-black/5 sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center">
          <Link href="/account" className="text-sm text-black/50 hover:text-brand-blue">
            ← Back
          </Link>
          <span className="ml-4 font-semibold text-sm text-brand-black">Shipping Address</span>
        </div>
      </div>
      <main className="max-w-lg mx-auto px-4 py-12 text-center">
        <p className="text-black/40 text-sm mb-2">No addresses saved</p>
        <p className="text-black/30 text-xs mb-6">Add a delivery address when you place your first order.</p>
        <Link href="/account" className="inline-block px-6 py-3 bg-brand-blue text-white text-sm font-medium rounded-full">
          Back to Account
        </Link>
      </main>
    </div>
  );
}
