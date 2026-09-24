import Link from "next/link";

export default function CustomOrderPage() {
  return (
    <div className="min-h-screen bg-canvas-cream flex flex-col">
      <header className="border-b border-hairline bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="text-xl font-semibold tracking-tight">Regal Store</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg bg-white rounded-2xl border border-hairline p-8 shadow-sm">
          <h1 className="text-2xl font-medium tracking-tight mb-2 text-center">
            Request a Custom Order
          </h1>
          <p className="text-shade-50 text-sm text-center mb-8">
            Can&apos;t find what you want? Send us the details and we&apos;ll source it for you.
          </p>

          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Your Name</label>
              <input
                type="text"
                placeholder="Full name"
                className="w-full px-4 py-3 rounded-xl border border-hairline bg-canvas-cream text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">WhatsApp / Phone</label>
              <input
                type="tel"
                placeholder="08012345678"
                className="w-full px-4 py-3 rounded-xl border border-hairline bg-canvas-cream text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">What do you want?</label>
              <textarea
                rows={4}
                placeholder="Describe the product, brand, size, color, or paste a link..."
                className="w-full px-4 py-3 rounded-xl border border-hairline bg-canvas-cream text-sm focus:outline-none focus:ring-2 focus:ring-black/10 resize-none"
              />
            </div>
            <button
              type="button"
              className="w-full py-3.5 bg-black text-white font-medium rounded-pill hover:bg-shade-70 transition-colors mt-2"
            >
              Submit Request
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link href="/" className="text-sm text-shade-50 hover:text-black">
              ← Back to shop
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
