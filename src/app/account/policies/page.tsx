import Link from "next/link";

export default function PoliciesPage() {
  return (
    <div className="min-h-screen bg-brand-surface">
      <div className="bg-white border-b border-black/5 sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center">
          <Link href="/account" className="text-sm text-black/50 hover:text-brand-blue">
            ← Back
          </Link>
          <span className="ml-4 font-semibold text-sm text-brand-black">Policies</span>
        </div>
      </div>
      <main className="max-w-lg mx-auto px-4 py-8 space-y-4 text-sm text-black/60">
        <p><strong className="text-brand-black">Returns:</strong> Contact us within 7 days of delivery for return requests.</p>
        <p><strong className="text-brand-black">Shipping:</strong> Delivery times vary by location across Nigeria.</p>
        <p><strong className="text-brand-black">Payment:</strong> Pay after order confirmation via bank transfer or agreed method.</p>
        <div className="pt-4 text-center">
          <Link href="/account" className="inline-block px-6 py-3 bg-brand-blue text-white text-sm font-medium rounded-full">
            Back to Account
          </Link>
        </div>
      </main>
    </div>
  );
}
