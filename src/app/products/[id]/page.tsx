import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import ProductActions from "@/components/ProductActions";

type Props = {
  params: Promise<{ id: string }>;
};

type Product = {
  id: string;
  name: string;
  price: number;
  compare_at_price?: number | null;
  image_url: string | null;
  category: string | null;
  is_new: boolean | null;
  sizes?: string[] | null;
  colors?: string[] | null;
  is_available?: boolean | null;
  description: string | null;
};

const SITE_URL = "https://regal-store.vercel.app";

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(price);
}

function isStoreCategory(category: string | null | undefined) {
  return ["clothing", "fashion", "shoes"].includes((category || "").toLowerCase());
}

function categoryName(category: string | null | undefined) {
  const normalized = (category || "").toLowerCase();
  if (normalized === "fashion" || normalized === "clothing") return "Clothing";
  if (normalized === "shoes") return "Shoes";
  return "Product";
}

async function getProduct(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, price, compare_at_price, image_url, category, is_new, sizes, colors, is_available, description")
    .eq("id", id)
    .maybeSingle();

  if (!error && data && isStoreCategory(data.category)) {
    return data as Product;
  }

  // Older databases may not yet have compare_at_price; keep the product page usable.
  if (error?.message && ["compare_at_price", "sizes", "colors", "is_available"].some((field) => error.message?.includes(field))) {
    const fallback = await supabase
      .from("products")
      .select("id, name, price, image_url, category, is_new, description")
      .eq("id", id)
      .maybeSingle();
    if (fallback.data && isStoreCategory(fallback.data.category)) {
      return { ...fallback.data, compare_at_price: null, sizes: [], colors: [], is_available: null } as Product;
    }
  }

  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: "Product not found",
      robots: { index: false, follow: false },
    };
  }

  const title = product.name;
  const description = product.description?.trim()
    ? product.description.trim().slice(0, 155)
    : `Shop ${product.name} at Regal Store. View the price and contact us to confirm product availability and delivery details.`;

  return {
    title,
    description,
    alternates: { canonical: `/products/${product.id}` },
    openGraph: {
      title,
      description,
      type: "website",
      url: `/products/${product.id}`,
      images: product.image_url ? [{ url: product.image_url, alt: product.name }] : undefined,
    },
    twitter: {
      card: product.image_url ? "summary_large_image" : "summary",
      title,
      description,
      images: product.image_url ? [product.image_url] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) notFound();

  const categoryLabel = categoryName(product.category);
  const compare = product.compare_at_price;
  const onSale = typeof compare === "number" && compare > product.price;
  const off = onSale && compare ? Math.round(((compare - product.price) / compare) * 100) : null;
  const productUrl = `${SITE_URL}/products/${product.id}`;
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || undefined,
    image: product.image_url ? [product.image_url] : undefined,
    category: categoryLabel,
    url: productUrl,
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "NGN",
      price: String(product.price),
      availability: product.is_available === false
        ? "https://schema.org/OutOfStock"
        : product.is_available === true
          ? "https://schema.org/InStock"
          : undefined,
    },
  };

  return (
    <div className="min-h-screen bg-brand-surface">
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema).replace(/</g, "\\u003c") }}
      />

      <main className="mx-auto max-w-5xl px-4 py-8 md:py-12 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1 text-sm text-black/50 transition hover:text-brand-blue"
        >
          ← Back to shop
        </Link>

        <div className="grid gap-8 md:grid-cols-2 md:gap-12">
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-black/5 bg-white">
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
              <div className="flex h-full w-full items-center justify-center text-black/30">
                Product photo coming soon
              </div>
            )}
            <div className="absolute left-4 top-4 flex flex-col gap-1.5">
              {off && (
                <span className="rounded-md bg-red-500 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                  -{off}% OFF
                </span>
              )}
              {product.is_new && (
                <span className="rounded-md bg-brand-blue px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                  New
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-brand-blue">
              {categoryLabel}
            </p>
            <h1 className="mb-3 text-2xl font-semibold tracking-tight text-brand-black md:text-3xl">
              {product.name}
            </h1>
            <div className="mb-6 flex items-baseline gap-3">
              <p className="text-2xl font-semibold text-brand-black">{formatPrice(product.price)}</p>
              {onSale && compare && (
                <p className="text-lg text-black/40 line-through">{formatPrice(compare)}</p>
              )}
            </div>

            {product.description?.trim() ? (
              <p className="mb-8 text-sm leading-relaxed text-black/60 md:text-base">
                {product.description}
              </p>
            ) : (
              <p className="mb-8 text-sm text-black/50">
                Need more details? Contact our team before ordering so we can confirm the information available for this item.
              </p>
            )}

            <ProductActions product={product} />

            <div className="mt-8 space-y-2 border-t border-black/5 pt-6 text-sm text-black/55">
              <p>✓ Confirm delivery options before payment</p>
              <p>✓ Confirm availability, size, and colour before payment</p>
              <p>✓ Ask our team questions before placing your order</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
