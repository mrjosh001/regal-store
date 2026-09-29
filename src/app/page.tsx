import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";
import ProductGrid from "@/components/ProductGrid";

type Product = {
  id: string;
  name: string;
  price: number;
  compare_at_price?: number | null;
  image_url: string | null;
  category: string | null;
  is_new: boolean | null;
};

const CATEGORIES = [
  { name: "Fashion", emoji: "👗", desc: "Style that stands out" },
  { name: "Electronics", emoji: "📱", desc: "Gadgets & devices" },
  { name: "Home", emoji: "🏠", desc: "Living essentials" },
  { name: "Accessories", emoji: "⌚", desc: "Finishing touches" },
  { name: "Beauty", emoji: "✨", desc: "Glow & care" },
  { name: "Sports", emoji: "⚡", desc: "Move better" },
];

export default async function HomePage() {
  let productList: Product[] = [];
  let fetchError: string | null = null;

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      fetchError = "Supabase environment variables are missing.";
    } else {
      const supabase = await createClient();

      const primary = await supabase
        .from("products")
        .select("id, name, price, compare_at_price, image_url, category, is_new")
        .order("created_at", { ascending: false });

      if (primary.error) {
        const fallback = await supabase
          .from("products")
          .select("id, name, price, image_url, category, is_new")
          .order("created_at", { ascending: false });

        if (fallback.error) {
          fetchError = fallback.error.message;
        } else {
          productList = (fallback.data || []).map((p) => ({
            ...p,
            compare_at_price: null,
          }));
        }
      } else {
        productList = (primary.data || []) as Product[];
      }
    }
  } catch (err: any) {
    fetchError = err?.message || "Unknown error";
  }

  const onSale = productList.filter(
    (p) => p.compare_at_price && p.compare_at_price > p.price
  );

  return (
    <div className="min-h-screen bg-brand-surface">
      <Header />

      {/* Hero — clean, bold, reference-inspired */}
      <section className="relative bg-brand-black text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative">
          <div className="max-w-xl">
            <p className="text-[11px] uppercase tracking-[0.25em] text-brand-blue font-medium mb-4">
              Nigeria&apos;s Trusted Import Marketplace
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-[3.5rem] font-semibold tracking-tight leading-[1.08] mb-5">
              Discover products<br />
              you&apos;ll love.
            </h1>
            <p className="text-white/55 text-base md:text-lg mb-8 max-w-md leading-relaxed">
              Curated fashion, electronics & lifestyle goods — sourced globally, delivered to your door.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="#products"
                className="px-7 py-3.5 bg-brand-blue text-white text-sm font-medium rounded-full hover:bg-brand-blue-dark transition shadow-lg shadow-brand-blue/25"
              >
                Shop Now →
              </Link>
              <Link
                href="/custom-order"
                className="px-7 py-3.5 border border-white/25 text-white text-sm font-medium rounded-full hover:bg-white/10 transition"
              >
                Custom Order
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="bg-white border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { icon: "🚚", title: "Nationwide Delivery", sub: "Across Nigeria" },
              { icon: "💬", title: "Order on WhatsApp", sub: "Chat before you pay" },
              { icon: "✓", title: "Quality Sourced", sub: "Trusted suppliers" },
              { icon: "🔒", title: "Secure & Simple", sub: "No hidden fees" },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <div>
                  <p className="text-sm font-medium text-brand-black">{item.title}</p>
                  <p className="text-xs text-black/40">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by category */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg md:text-xl font-semibold tracking-tight text-brand-black">
            Shop by Category
          </h2>
          <Link href="#products" className="text-sm text-brand-blue font-medium hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={`/?category=${encodeURIComponent(cat.name)}#products`}
              className="group bg-white rounded-2xl border border-black/5 p-4 hover:border-brand-blue/30 hover:shadow-md transition text-center"
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-brand-blue/8 flex items-center justify-center text-2xl group-hover:bg-brand-blue/15 transition">
                {cat.emoji}
              </div>
              <p className="text-sm font-medium text-brand-black group-hover:text-brand-blue transition">
                {cat.name}
              </p>
              <p className="text-[11px] text-black/40 mt-0.5">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Products */}
      {fetchError ? (
        <div className="text-center py-16 max-w-md mx-auto px-4">
          <p className="text-red-600 font-medium mb-2">Could not load products</p>
          <p className="text-black/50 text-sm">{fetchError}</p>
        </div>
      ) : productList.length === 0 ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16" id="products">
          <div className="bg-white rounded-3xl border border-black/5 py-16 text-center">
            <div className="w-16 h-16 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              🛍️
            </div>
            <p className="text-brand-black font-medium mb-1">Store is getting ready</p>
            <p className="text-black/40 text-sm mb-6 max-w-xs mx-auto">
              Products will appear here once added from the Admin Dashboard.
            </p>
            <Link
              href="/custom-order"
              className="inline-block px-6 py-3 bg-brand-blue text-white text-sm font-medium rounded-full"
            >
              Request a Custom Order
            </Link>
          </div>
        </section>
      ) : (
        <>
          {onSale.length > 0 && (
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
              <div className="rounded-2xl bg-gradient-to-r from-brand-black to-brand-blue p-6 md:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/60 mb-1">Limited offers</p>
                  <h3 className="text-xl font-semibold">On Sale Now</h3>
                  <p className="text-sm text-white/60 mt-1">{onSale.length} products with special prices</p>
                </div>
                <Link
                  href="#products"
                  className="px-5 py-2.5 bg-white text-brand-black text-sm font-medium rounded-full hover:bg-white/90 transition whitespace-nowrap"
                >
                  Shop Sale →
                </Link>
              </div>
            </section>
          )}
          <ProductGrid products={productList} />
        </>
      )}

      {/* Custom order CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-8">
        <div className="bg-white rounded-3xl border border-black/5 p-6 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-brand-blue font-medium mb-2">
              Can&apos;t find it?
            </p>
            <h3 className="text-xl font-semibold tracking-tight mb-1 text-brand-black">
              Request a custom order
            </h3>
            <p className="text-sm text-black/50 max-w-md">
              Send us a photo or link — we&apos;ll source it and deliver across Nigeria.
            </p>
          </div>
          <Link
            href="/custom-order"
            className="px-6 py-3 bg-brand-blue text-white text-sm font-medium rounded-full whitespace-nowrap hover:bg-brand-blue-dark transition"
          >
            Request Now →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-brand-blue rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">R</span>
                </div>
                <span className="font-semibold">Regal Store</span>
              </div>
              <p className="text-sm text-white/40 max-w-xs">
                Premium products, carefully selected and delivered across Nigeria.
              </p>
            </div>
            <div>
              <p className="text-sm font-medium mb-3">Shop</p>
              <div className="space-y-2 text-sm text-white/40">
                <p>Fashion</p>
                <p>Electronics</p>
                <p>Home</p>
                <p>Accessories</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-3">Support</p>
              <div className="space-y-2 text-sm text-white/40">
                <Link href="/account/help" className="block hover:text-white">Help Center</Link>
                <Link href="/account/track" className="block hover:text-white">Track Order</Link>
                <Link href="/custom-order" className="block hover:text-white">Custom Order</Link>
                <Link href="/account/support" className="block hover:text-white">Contact</Link>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-3">Order via WhatsApp</p>
              <p className="text-sm text-white/40 mb-3">
                Browse here, complete your order on WhatsApp — simple and secure.
              </p>
            </div>
          </div>
          <div className="pt-6 border-t border-white/10 text-sm text-white/30 flex flex-col sm:flex-row justify-between gap-2">
            <span>© {new Date().getFullYear()} Regal Store. All rights reserved.</span>
            <span>Made for Nigeria</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
