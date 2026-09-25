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

const categories = ["All", "Fashion", "Electronics", "Home", "Accessories"];

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
        console.error("Supabase error:", error.message);
      } else {
        productList = products || [];
      }
    }
  } catch (err: any) {
    fetchError = err?.message || "Unknown error connecting to database";
    console.error("Server error:", err);
  }

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <Header />

      {/* Hero / Banner */}
      <section className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-widest text-white/50 mb-2">
                Nigeria&apos;s trusted import marketplace
              </p>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight leading-tight">
                Discover premium products<br />delivered to your door
              </h1>
            </div>
            <Link
              href="/custom-order"
              className="self-start px-6 py-3 border border-white/40 text-white rounded-full text-sm font-medium hover:bg-white hover:text-black transition-colors"
            >
              Request a custom order
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <div className="sticky top-16 z-40 bg-[#faf9f7]/95 backdrop-blur border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  cat === "All"
                    ? "bg-black text-white"
                    : "bg-white border border-black/10 text-black hover:border-black"
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
          <span className="text-sm text-black/40">{productList.length} products</span>
        </div>

        {fetchError ? (
          <div className="text-center py-20 max-w-md mx-auto">
            <p className="text-red-600 font-medium mb-2">Could not load products</p>
            <p className="text-black/50 text-sm">{fetchError}</p>
          </div>
        ) : productList.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-black/40 text-lg">No products yet.</p>
            <p className="text-black/30 text-sm mt-2">
              Products will appear here once added from the Admin Dashboard.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {productList.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group bg-white rounded-2xl overflow-hidden border border-black/5 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative aspect-[4/5] bg-black/5 overflow-hidden">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-black/30 text-sm">
                      No image
                    </div>
                  )}
                  {product.is_new && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      New
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs text-black/40 mb-1">{product.category || "Uncategorized"}</p>
                  <h3 className="text-sm font-medium leading-snug mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-base font-semibold">{formatPrice(product.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-black/5 mt-16">
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
            <div className="text-sm text-black/40">
              © {new Date().getFullYear()} Regal Store. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
