import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Header from "@/components/Header";

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

  const whatsappMessage = encodeURIComponent(
    `Hi Regal Store! I want to order:\n\n*${product.name}*\nPrice: ${formatPrice(product.price)}\n\nPlease confirm availability.`
  );
  const whatsappUrl = `https://wa.me/234?text=${whatsappMessage}`;

  return (
    <div className="min-h-screen bg-brand-surface">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-black/50 hover:text-brand-blue mb-6 transition"
        >
          ← Back to shop
        </Link>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Image */}
          <div className="relative aspect-[3/4] bg-white rounded-2xl overflow-hidden border border-black/5">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-black/30">
                No image
              </div>
            )}
            {product.is_new && (
              <span className="absolute top-4 left-4 px-2.5 py-1 bg-brand-blue text-white text-[11px] font-semibold uppercase tracking-wider rounded-md">
                New
              </span>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <p className="text-xs uppercase tracking-wider text-brand-blue font-medium mb-2">
              {product.category || "Product"}
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-brand-black mb-3">
              {product.name}
            </h1>
            <p className="text-2xl font-semibold text-brand-black mb-6">
              {formatPrice(product.price)}
            </p>

            {product.description ? (
              <p className="text-black/60 leading-relaxed mb-8 text-sm md:text-base">
                {product.description}
              </p>
            ) : (
              <p className="text-black/40 text-sm mb-8">
                Premium quality product, carefully sourced for Regal Store customers.
              </p>
            )}

            <div className="mt-auto space-y-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#25D366] text-white font-medium rounded-full hover:bg-[#1da851] transition"
              >
                <span>Order via WhatsApp</span>
              </a>
              <Link
                href="/custom-order"
                className="flex items-center justify-center w-full py-3.5 border border-black/10 text-brand-black font-medium rounded-full hover:border-brand-blue hover:text-brand-blue transition"
              >
                Request similar item
              </Link>
            </div>

            <div className="mt-8 pt-6 border-t border-black/5 space-y-2 text-sm text-black/40">
              <p>✓ Sourced from trusted suppliers</p>
              <p>✓ Nationwide delivery available</p>
              <p>✓ Chat with us before you pay</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
