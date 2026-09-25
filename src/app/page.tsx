import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";

type Product = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  category: string | null;
  is_new: boolean | null;
};

const categories = ["All", "Fashion", "Electronics", "Home", "Accessories", "Beauty"];

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(price);
}

export default async function HomePage() {
  let productList: Product[] = [];
  let fetchError: string | null = null;

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      fetchError = "Supabase environment variables are missing.";
    } else {
      const supabase = await createClient();

      const { data: products, error } = await supabase
        .from("products")
        .select("id, name, price, image_url, category, is_new")
        .order("created_at", { ascending: false });

      if (error) {
        fetchError = error.message;
      } else {
        productList = products || [];
      }
    }
  } catch (err: any) {
    fetchError = err?.message || "Unknown error";
  }

  const newProducts = productList.filter((p) => p.is_new).slice(0, 4);
  const trending = productList.slice(0, 8);

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <Header />

      {/* Hero */}
      <section className="relative bg-black text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.2em] text-white/50 mb-4">
              Nigeria's Trusted Import Marketplace
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
                className="px-7 py-3.5 bg-white text-black text-sm font-medium rounded-full hover:bg-white/90 transition"
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

      {/* Categories */}
      <div className="sticky top-16 z-40 bg-[#faf9f7]/90 backdrop-blur-md border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto py-3.5 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  cat === "All"
                    ? "bg-black text-white"
                    : "bg-white border border-black/8 text-black/70 hover:border-black/30"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="products">
        {/* New Ins */}
        {newProducts.length > 0 && (
          <section className="pt-12 pb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium tracking-tight">New Ins</h2>
              <span className="text-xs text-black/40 uppercase tracking-wider">Just dropped</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-5">
              {newProducts.map((product) => (
                <ProductCard key={product.id} product={product} formatPrice={formatPrice} />
              ))}
            </div>
          </section>
        )}

        {/* Trending */}
        <section className="py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium tracking-tight">Trending Today</h2>
            <span className="text-sm text-black/40">{productList.length} products</span>
          </div>

          {fetchError ? (
            <div className="text-center py-16">
              <p className="text-red-600 font-medium mb-1">Could not load products</p>
              <p className="text-black/40 text-sm">{fetchError}</p>
            </div>
          ) : productList.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                🛍️
              </div>
              <p className="text-black/50 font-medium mb-1">No products yet</p>
              <p className="text-black/30 text-sm">
                Products will appear here once added from the Admin Dashboard.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
              {trending.map((product) => (
                <ProductCard key={product.id} product={product} formatPrice={formatPrice} />
              ))}
            </div>
          )}
        </section>

        {/* Custom Order CTA */}
        <section className="py-8 mb-12">
          <div className="bg-white rounded-3xl border border-black/5 p-6 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-wider text-black/40 mb-2">Can't find it?</p>
              <h3 className="text-xl font-medium tracking-tight mb-1">Request a custom order</h3>
              <p className="text-sm text-black/50 max-w-md">
                Send us a photo or link of what you want — we'll source it for you.
              </p>
            </div>
            <Link
              href="/custom-order"
              className="px-6 py-3 bg-black text-white text-sm font-medium rounded-full whitespace-nowrap hover:bg-black/80 transition"
            >
              Request Now →
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-black/5 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-black rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">R</span>
                </div>
                <span className="font-semibold">Regal Store</span>
              </div>
              <p className="text-sm text-black/40 max-w-xs">
                Premium products, carefully selected and delivered across Nigeria.
              </p>
            </div>
            <div className="flex gap-10 text-sm text-black/50">
              <div className="space-y-2">
                <p className="font-medium text-black">Shop</p>
                <p>Fashion</p>
                <p>Electronics</p>
                <p>Home</p>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-black">Support</p>
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

function ProductCard({
  product,
  formatPrice,
}: {
  product: Product;
  formatPrice: (n: number) => string;
}) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group block"
    >
      <div className="relative aspect-[3/4] bg-[#f0eeeb] rounded-2xl overflow-hidden mb-3">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-black/20 text-sm">
            No image
          </div>
        )}
        {product.is_new && (
          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-white text-black text-[10px] font-semibold uppercase tracking-wider rounded-md shadow-sm">
            New
          </span>
        )}
      </div>
      <div className="px-0.5">
        <p className="text-[11px] text-black/40 mb-0.5 uppercase tracking-wide">
          {product.category || "Product"}
        </p>
        <h3 className="text-sm font-medium leading-snug line-clamp-2 mb-1 group-hover:underline underline-offset-2">
          {product.name}
        </h3>
        <p className="text-sm font-semibold tracking-tight">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}
