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

export default async function HomePage() {
  let productList: Product[] = [];
  let fetchError: string | null = null;

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      fetchError = "Supabase environment variables are missing.";
    } else {
      const supabase = await createClient();

      // Try with compare_at_price; fall back if column not yet added
      let { data: products, error } = await supabase
        .from("products")
        .select("id, name, price, compare_at_price, image_url, category, is_new")
        .order("created_at", { ascending: false });

      if (error) {
        const fallback = await supabase
          .from("products")
          .select("id, name, price, image_url, category, is_new")
          .order("created_at", { ascending: false });
        products = fallback.data;
        error = fallback.error;
      }

      if (error) {
        fetchError = error.message;
      } else {
        productList = products || [];
      }
    }
  } catch (err: any) {
    fetchError = err?.message || "Unknown error";
  }

  return (
    <div className="min-h-screen bg-brand-surface">
      <Header />

      <section className="relative bg-brand-black text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.2em] text-white/50 mb-4">
              Nigeria&apos;s Trusted Import Marketplace
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight leading-[1.1] mb-6">
              Premium products.<br />
              Delivered to your door.
            </h1>
            <p className="text-white/60 text-base mb-8 max-w-md">
              Curated fashion, electronics and lifestyle goods from trusted global brands.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="#products"
                className="px-7 py-3.5 bg-brand-blue text-white text-sm font-medium rounded-full hover:bg-brand-blue-dark transition"
              >
                Shop Now
              </Link>
              <Link
                href="/custom-order"
                className="px-7 py-3.5 border border-white/30 text-white text-sm font-medium rounded-full hover:bg-white/10 transition"
              >
                Custom Order
              </Link>
            </div>
          </div>
        </div>
      </section>

      {fetchError ? (
        <div className="text-center py-20 max-w-md mx-auto px-4">
          <p className="text-red-600 font-medium mb-2">Could not load products</p>
          <p className="text-black/50 text-sm">{fetchError}</p>
        </div>
      ) : productList.length === 0 ? (
        <>
          <div className="sticky top-16 z-40 bg-brand-surface/90 backdrop-blur-md border-b border-black/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {["All", "Fashion", "Electronics", "Home", "Accessories", "Beauty"].map((cat) => (
                  <span
                    key={cat}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                      cat === "All"
                        ? "bg-brand-blue text-white"
                        : "bg-white border border-black/8 text-black/70"
                    }`}
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              🛍️
            </div>
            <p className="text-black/50 font-medium mb-1">No products yet</p>
            <p className="text-black/30 text-sm">
              Products will appear here once added from the Admin Dashboard.
            </p>
          </div>
        </>
      ) : (
        <ProductGrid products={productList} />
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-12">
        <div className="bg-white rounded-3xl border border-black/5 p-6 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
          <div>
            <p className="text-xs uppercase tracking-wider text-brand-blue font-medium mb-2">
              Can&apos;t find it?
            </p>
            <h3 className="text-xl font-medium tracking-tight mb-1 text-brand-black">
              Request a custom order
            </h3>
            <p className="text-sm text-black/50 max-w-md">
              Send us a photo or link of what you want — we&apos;ll source it for you.
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

      <footer className="border-t border-black/5 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-brand-blue rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">R</span>
                </div>
                <span className="font-semibold text-brand-black">Regal Store</span>
              </div>
              <p className="text-sm text-black/40 max-w-xs">
                Premium products, carefully selected and delivered across Nigeria.
              </p>
            </div>
            <div className="flex gap-10 text-sm text-black/50">
              <div className="space-y-2">
                <p className="font-medium text-brand-black">Shop</p>
                <p>Fashion</p>
                <p>Electronics</p>
                <p>Home</p>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-brand-black">Support</p>
                <p>Help Center</p>
                <p>Track Order</p>
                <p>Contact</p>
              </div>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-black/5 text-sm text-black/30">
            © {new Date().getFullYear()} Regal Store. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
