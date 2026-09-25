import Link from "next/link";

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <div className="bg-white border-b border-black/5 sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center">
          <Link href="/account" className="text-sm text-black/50">← Back</Link>
          <span className="ml-4 font-semibold text-sm">Help Center</span>
        </div>
      </div>
      <main className="max-w-lg mx-auto px-4 py-8 space-y-4">
        {["How to place an order", "Delivery times", "Payment methods", "Returns & Refunds", "Contact support"].map((q) => (
          <div key={q} className="bg-white rounded-xl border border-black/5 p-4">
            <p className="text-sm font-medium">{q}</p>
          </div>
        ))}
      </main>
    </div>
  );
}
