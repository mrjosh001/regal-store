import Image from "next/image";

// Temporary mock products (we will replace this with Supabase data later)
const products = [
  {
    id: 1,
    name: "Classic Oversized Polo",
    price: 12500,
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&h=500&fit=crop",
    category: "Fashion",
    isNew: true,
  },
  {
    id: 2,
    name: "Wireless Earbuds Pro",
    price: 18900,
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=500&fit=crop",
    category: "Electronics",
    isNew: true,
  },
  {
    id: 3,
    name: "Leather Crossbody Bag",
    price: 9800,
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=500&fit=crop",
    category: "Fashion",
    isNew: false,
  },
  {
    id: 4,
    name: "Minimalist Watch",
    price: 15500,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=500&fit=crop",
    category: "Accessories",
    isNew: true,
  },
  {
    id: 5,
    name: "Cotton Linen Shirt",
    price: 8700,
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=500&fit=crop",
    category: "Fashion",
    isNew: false,
  },
  {
    id: 6,
    name: "Portable Power Bank",
    price: 11200,
    image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=500&fit=crop",
    category: "Electronics",
    isNew: false,
  },
  {
    id: 7,
    name: "Suede Loafers",
    price: 14500,
    image: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=400&h=500&fit=crop",
    category: "Fashion",
    isNew: true,
  },
  {
    id: 8,
    name: "Ceramic Diffuser",
    price: 6900,
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=500&fit=crop",
    category: "Home",
    isNew: false,
  },
];

const categories = ["All", "Fashion", "Electronics", "Home", "Accessories"];

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(price);
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="text-xl font-semibold tracking-tight">Regal Store</span>
            </div>

            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <input
                  type="search"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-pill border border-hairline bg-canvas-cream text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                />
                <svg
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-shade-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            <button className="px-5 py-2.5 bg-black text-white text-sm font-medium rounded-pill hover:bg-shade-70 transition-colors">
              Sign in
            </button>
          </div>
        </div>
      </header>

      {/* Hero / Banner */}
      <section className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-widest text-shade-40 mb-2">
                Nigeria&apos;s trusted import marketplace
              </p>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight leading-tight">
                Discover premium products<br />delivered to your door
              </h1>
            </div>
            <button className="self-start px-6 py-3 border border-white/40 text-white rounded-pill text-sm font-medium hover:bg-white hover:text-black transition-colors">
              Request a custom order
            </button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <div className="sticky top-16 z-40 bg-canvas-cream/95 backdrop-blur border-b border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`px-4 py-2 rounded-pill text-sm font-medium whitespace-nowrap transition-colors ${
                  cat === "All"
                    ? "bg-black text-white"
                    : "bg-white border border-hairline text-ink hover:border-black"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-medium tracking-tight">Trending today</h2>
          <span className="text-sm text-shade-50">{products.length} products</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <article
              key={product.id}
              className="group bg-white rounded-xl overflow-hidden border border-hairline hover:shadow-lg transition-shadow duration-300"
            >
              <div className="relative aspect-[4/5] bg-shade-30/30 overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                {product.isNew && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-aloe-10 text-ink text-xs font-medium rounded-pill">
                    New
                  </span>
                )}
              </div>
              <div className="p-4">
                <p className="text-xs text-shade-50 mb-1">{product.category}</p>
                <h3 className="text-sm font-medium leading-snug mb-2 line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-base font-semibold">{formatPrice(product.price)}</p>
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-hairline mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-black rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">R</span>
                </div>
                <span className="font-semibold">Regal Store</span>
              </div>
              <p className="text-sm text-shade-50 max-w-xs">
                Premium products, carefully selected and delivered across Nigeria.
              </p>
            </div>
            <div className="text-sm text-shade-50">
              © {new Date().getFullYear()} Regal Store. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}