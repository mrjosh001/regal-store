import Link from "next/link";

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <div className="bg-white border-b border-black/5 sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center">
          <Link href="/account" className="text-sm text-black/50">← Back</Link>
          <span className="ml-4 font-semibold text-sm">Support</span>
        </div>
      </div>
      <main className="max-w-lg mx-auto px-4 py-10 text-center">
        <p className="text-black/40 text-sm mb-6">Need help? Reach out to us.</p>
        <a
          href="https://wa.me/234"
          className="inline-block px-6 py-3 bg-green-600 text-white text-sm font-medium rounded-full"
        >
          Chat on WhatsApp
        </a>
      </main>
    </div>
  );
}
