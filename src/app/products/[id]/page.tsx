import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(price);
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from("products")
    .select("id, name, price, image_url, category, is_new, description")
    .eq("id", id)
    .single();

  if (error || !product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-canvas-cream">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="text-xl font-semibold tracking-tight">Regal Store</span>
            </Link>
            <Link
              href="/"
              className="text-sm font-medium text-shade-50 hover:text-black"
            >
              ← Back to shop
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid md:grid-cols-2 gap-10">
          {/* Image */}
          <div className="relative aspect-[4/5] bg-white rounded-2xl overflow-hidden border border-hairline">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-shade-40">
                No image
              </div>
            )}
            {product.is_new && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-aloe-10 text-ink text-xs font-medium rounded-pill">
                New
              </span>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <p className="text-sm text-shade-50 mb-2">{product.category || "Uncategorized"}</p>
            <h1 className="text-2xl md:text-3xl font-medium tracking-tight mb-4">
              {product.name}
            </h1>
            <p className="text-2xl font-semibold mb-6">{formatPrice(product.price)}</p>

            {product.description && (
              <p className="text-shade-50 leading-relaxed mb-8">{product.description}</p>
            )}

            <div className="mt-auto space-y-3">
              <button className="w-full py-3.5 bg-black text-white font-medium rounded-pill hover:bg-shade-70 transition-colors">
                Add to Cart
              </button>
              <button className="w-full py-3.5 border border-hairline font-medium rounded-pill hover:border-black transition-colors">
                Request this item
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
