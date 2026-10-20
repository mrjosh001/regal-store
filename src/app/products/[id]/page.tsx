import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import ProductExperience from "@/components/ProductExperience";

type Props = { params: Promise<{ id: string }> };

type Product = {
  id: string;
  name: string;
  price: number;
  compare_at_price?: number | null;
  image_url: string | null;
  image_urls?: string[] | null;
  category: string | null;
  is_new: boolean | null;
  sizes?: string[] | null;
  colors?: string[] | null;
  is_available?: boolean | null;
  stock_quantity?: number | null;
  description: string | null;
};

const SITE_URL = "https://regalsdrip.store";

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(price);
}

function isStoreCategory(category: string | null | undefined) {
  return ["clothing", "fashion", "shoes", "bag", "bags"].includes((category || "").toLowerCase());
}

function categoryName(category: string | null | undefined) {
  const normalized = (category || "").toLowerCase();
  if (normalized === "fashion" || normalized === "clothing") return "Clothing";
  if (normalized === "shoes") return "Shoes";
  if (normalized === "bag" || normalized === "bags") return "Bags";
  return "Product";
}

async function getProduct(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, price, compare_at_price, image_url, image_urls, category, is_new, sizes, colors, is_available, stock_quantity, description")
    .eq("id", id)
    .maybeSingle();

  if (!error && data && isStoreCategory(data.category)) return data as Product;

  if (error?.message && ["compare_at_price", "image_urls", "sizes", "colors", "is_available", "stock_quantity"].some((field) => error.message?.includes(field))) {
    const fallback = await supabase
      .from("products")
      .select("id, name, price, image_url, category, is_new, description")
      .eq("id", id)
      .maybeSingle();
    if (fallback.data && isStoreCategory(fallback.data.category)) {
      return { ...fallback.data, compare_at_price: null, image_urls: fallback.data.image_url ? [fallback.data.image_url] : [], sizes: [], colors: [], is_available: null, stock_quantity: null } as Product;
    }
  }

  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: "Product not found", robots: { index: false, follow: false } };

  const title = product.name;
  const description = product.description?.trim()
    ? product.description.trim().slice(0, 155)
    : `Shop ${product.name} at Regal’s Drip. View the price and contact us to confirm product availability and delivery details.`;
  const images = product.image_urls?.length ? product.image_urls : product.image_url ? [product.image_url] : [];

  return {
    title,
    description,
    alternates: { canonical: `/products/${product.id}` },
    openGraph: { title, description, type: "website", url: `/products/${product.id}`, images: images.map((url) => ({ url, alt: product.name })) },
    twitter: { card: images.length ? "summary_large_image" : "summary", title, description, images },
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
  const images = product.image_urls?.length ? product.image_urls : product.image_url ? [product.image_url] : [];
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || undefined,
    image: images.length ? images : undefined,
    category: categoryLabel,
    url: productUrl,
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "NGN",
      price: String(product.price),
      availability: product.is_available === false || product.stock_quantity === 0
        ? "https://schema.org/OutOfStock"
        : product.stock_quantity != null && product.stock_quantity > 0
          ? "https://schema.org/InStock"
          : product.is_available === true
            ? "https://schema.org/InStock"
            : undefined,
    },
  };

  return (
    <div className="min-h-screen bg-brand-surface">
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema).replace(/</g, "\\u003c") }} />
      <main className="mx-auto max-w-5xl px-4 py-8 md:py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center gap-2 sm:gap-3">
          <Link href="/search" className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-black/10 bg-white px-4 text-sm font-medium text-[#202a23] shadow-sm hover:border-black/20">← Back</Link>
          <Link href="/" className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-[#263b2e] px-4 text-sm font-medium text-white hover:bg-[#354e40]">Home</Link>
          <span className="inline-flex min-h-10 items-center text-sm text-black/40">{categoryLabel}</span>
        </div>

        <ProductExperience product={product} />

        <div className="mt-8 grid gap-2 md:grid-cols-2">
          <div className="md:pr-6">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-brand-blue">{categoryLabel}</p>
            <h1 className="mb-3 text-2xl font-semibold tracking-tight text-brand-black md:text-3xl">{product.name}</h1>
            <div className="mb-6 flex items-baseline gap-3">
              <p className="text-2xl font-semibold text-brand-black">{formatPrice(product.price)}</p>
              {onSale && compare && <p className="text-lg text-black/40 line-through">{formatPrice(compare)}</p>}
              {off && <span className="rounded-full bg-red-500 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">-{off}% OFF</span>}
            </div>
            {product.description?.trim() ? (
              <p className="mb-8 text-sm leading-relaxed text-black/60 md:text-base">{product.description}</p>
            ) : (
              <p className="mb-8 text-sm text-black/50">Need more details? Contact our team before ordering so we can confirm the information available for this item.</p>
            )}
          </div>
          <div className="md:pl-6">
            {product.stock_quantity != null && product.stock_quantity > 0 && product.is_available !== false ? (
              <p className="mb-4 inline-flex rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800">{product.stock_quantity} in stock</p>
            ) : product.stock_quantity === 0 || product.is_available === false ? (
              <p className="mb-4 inline-flex rounded-full bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700">Sold out</p>
            ) : null}
            <div className="space-y-2 border-t border-black/5 pt-6 text-sm text-black/55">
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
