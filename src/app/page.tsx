import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";
import ProductGrid from "@/components/ProductGrid";
import { whatsappLink } from "@/lib/whatsapp";
import LandingMarquee from "@/components/LandingMarquee";

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
  stock_quantity?: number | null;
};

type HomePageProps = {
  searchParams: Promise<{ category?: string }>;
};

const CATEGORIES = [
  {
    name: "Clothing",
    slug: "clothing",
    eyebrow: "Wear it your way",
    description: "Easy pieces. Strong looks.",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Bags",
    slug: "bags",
    eyebrow: "Carry a little confidence",
    description: "Everyday carry, elevated.",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Shoes",
    slug: "shoes",
    eyebrow: "Start from the ground up",
    description: "The finishing touch.",
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1000&q=85",
  },
];

function normaliseCategory(value: string | null | undefined) {
  const category = (value || "").toLowerCase();
  if (["fashion", "clothing"].includes(category)) return "Clothing";
  if (["bag", "bags"].includes(category)) return "Bags";
  if (category === "shoes") return "Shoes";
  return value || "";
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const initialCategory = CATEGORIES.some((item) => item.name === params.category)
    ? params.category!
    : "All";

  let productList: Product[] = [];
  let hasFetchError = false;

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      hasFetchError = true;
    } else {
      const supabase = await createClient();
      const primary = await supabase
        .from("products")
        .select("id, name, price, compare_at_price, image_url, category, is_new, sizes, colors, is_available, stock_quantity")
        .order("created_at", { ascending: false });

      if (primary.error) {
        const fallback = await supabase
          .from("products")
          .select("id, name, price, image_url, category, is_new")
          .order("created_at", { ascending: false });

        if (fallback.error) {
          hasFetchError = true;
        } else {
          productList = (fallback.data || [])
            .filter((product) =>
              ["clothing", "fashion", "shoes", "bag", "bags"].includes(
                (product.category || "").toLowerCase()
              )
            )
            .map((product) => ({
              ...product,
              category: normaliseCategory(product.category),
              compare_at_price: null,
              sizes: [],
              colors: [],
              is_available: null,
              stock_quantity: null,
            }));
        }
      } else {
        productList = ((primary.data || []) as Product[])
          .filter((product) =>
            ["clothing", "fashion", "shoes", "bag", "bags"].includes(
              (product.category || "").toLowerCase()
            )
          )
          .map((product) => ({
            ...product,
            category: normaliseCategory(product.category),
            sizes: product.sizes || [],
            colors: product.colors || [],
            is_available: product.is_available ?? null,
            stock_quantity: product.stock_quantity ?? null,
          }));
      }
    }
  } catch {
    hasFetchError = true;
  }

  const onSale = productList.filter(
    (product) => product.compare_at_price && product.compare_at_price > product.price
  );
  const categoryTiles = CATEGORIES.map((category) => ({
    ...category,
    product: productList.find(
      (product) => product.category === category.name && product.image_url
    ),
  }));
  const heroProduct = productList.find((product) => product.image_url);
  const wa = whatsappLink("Hello Regal Store, I need help choosing a product.");

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#202a23]">
      <div className="relative z-20 overflow-hidden bg-[#1a2820] px-4 py-2.5 text-center">
        <p className="relative text-[10px] font-semibold uppercase tracking-[0.2em] text-white/90 sm:text-xs">
          Clothing · Bags · Shoes <span className="mx-2 text-[#e8d5b5]/80">/</span> Everyday style, thoughtfully found
        </p>
      </div>

      <Header />

      <main>
        <section className="relative isolate min-h-[88vh] overflow-hidden md:min-h-[92vh]">
          <div className="absolute inset-0">
            <img
              src={
                heroProduct?.image_url ||
                "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=2000&q=90"
              }
              alt={heroProduct ? heroProduct.name : "Regal Store fashion"}
              className="h-full w-full object-cover animate-ken-burns"
              fetchPriority="high"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0f1814]/88 via-[#0f1814]/55 to-[#0f1814]/25" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f1814]/80 via-transparent to-[#0f1814]/20" />
          </div>

          <div className="pointer-events-none absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-[#a65f3e]/20 blur-[100px] animate-float-orb" aria-hidden />
          <div className="pointer-events-none absolute -right-16 bottom-1/4 h-80 w-80 rounded-full bg-[#e8d5b5]/15 blur-[110px] animate-float-orb" style={{ animationDelay: "-4s" }} aria-hidden />

          <div className="relative mx-auto flex min-h-[88vh] max-w-[1440px] flex-col justify-end px-5 pb-16 pt-28 sm:px-8 sm:pb-20 md:min-h-[92vh] md:justify-center md:pb-24 lg:px-16">
            <div className="max-w-2xl animate-rise-in">
              <div className="mb-6 inline-flex items-center gap-3 rounded-full liquid-glass px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white/95 sm:text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-[#e8d5b5]" />
                The Regal Store edit
              </div>
              <h1 className="font-serif text-[3.4rem] leading-[0.96] tracking-[-0.04em] text-white sm:text-6xl lg:text-[5.5rem]">
                A little more <span className="italic text-[#e8d5b5]">you.</span>
                <br />Every day.
              </h1>
              <p className="mt-6 max-w-md text-sm leading-7 text-white/75 sm:text-base sm:leading-8">
                The pieces you reach for, the details that pull a look together, and the finds that feel like they were waiting for you.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="#shop-the-edit" className="btn-shimmer inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-7 text-xs font-bold uppercase tracking-[0.12em] text-[#1a2820] shadow-lg shadow-black/20 hover:bg-[#f7f5f0]">
                  Shop the collection <span aria-hidden>↗</span>
                </Link>
                <Link href="/custom-order" className="inline-flex min-h-12 items-center justify-center rounded-full liquid-glass px-7 text-xs font-bold uppercase tracking-[0.12em] text-white hover:bg-white/20">
                  Find it for me
                </Link>
              </div>
            </div>

            {heroProduct && (
              <div className="mt-10 max-w-xs animate-rise-in rounded-2xl liquid-glass p-4 text-white sm:absolute sm:bottom-20 sm:right-8 sm:mt-0 lg:right-16" style={{ animationDelay: "120ms" }}>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/60">Featured find</p>
                <p className="mt-1.5 font-serif text-lg leading-snug">{heroProduct.name}</p>
                <Link href={`/products/${heroProduct.id}`} className="mt-3 inline-flex text-xs font-semibold text-[#e8d5b5] hover:text-white">View piece →</Link>
              </div>
            )}
          </div>
        </section>

        <section className="relative z-10 -mt-8 px-4 sm:-mt-10 sm:px-8 lg:px-16">
          <div className="mx-auto grid max-w-[1440px] gap-3 sm:grid-cols-3">
            {[
              { n: "01", t: "Discover", c: "Explore clothing, bags and shoes curated for everyday style." },
              { n: "02", t: "Ask us", c: "Check sizing, availability and details before you commit." },
              { n: "03", t: "Order clearly", c: "Confirm everything with us — then pay with confidence." },
            ].map((step, i) => (
              <div key={step.n} className="liquid-glass-frost animate-rise-in rounded-2xl p-5 sm:p-6" style={{ animationDelay: `${i * 80}ms` }}>
                <span className="font-serif text-lg italic text-[#a65f3e]">{step.n}</span>
                <p className="mt-2 text-sm font-semibold text-[#24372d]">{step.t}</p>
                <p className="mt-1 text-xs leading-5 text-[#73746c]">{step.c}</p>
              </div>
            ))}
          </div>
        </section>

        <LandingMarquee />

        <section className="mx-auto max-w-[900px] px-6 py-16 text-center sm:py-20">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#a65f3e]">The idea</p>
          <h2 className="mt-4 font-serif text-3xl leading-tight tracking-tight text-[#24372d] sm:text-5xl">
            Style should feel personal — not rushed.
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-[#66695f] sm:text-base">
            Browse at your pace. Ask questions. Confirm details. Then order when it feels right.
          </p>
        </section>

        <section id="shop-the-edit" className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 sm:py-12 lg:px-16">
          <div className="mb-8 flex items-end justify-between gap-4 sm:mb-12">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#a65f3e] sm:text-xs">Make it yours</p>
              <h2 className="mt-2 font-serif text-3xl tracking-[-0.03em] text-[#24372d] sm:text-5xl">Shop by mood.</h2>
            </div>
            <Link href="/search" className="hidden pb-1 text-xs font-semibold text-[#536b58] hover:text-[#24372d] sm:block">View all →</Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
            {categoryTiles.map((category, index) => (
              <Link
                key={category.name}
                href={`/search?category=${category.slug}`}
                className={`group relative isolate min-h-[340px] overflow-hidden rounded-3xl bg-[#ddd0bf] sm:min-h-[440px] ${index === 1 ? "sm:translate-y-8" : ""}`}
              >
                <img
                  src={category.product?.image_url || category.image}
                  alt={category.product?.name || category.name}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
                  <span className="inline-block rounded-full liquid-glass px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-white">{category.eyebrow}</span>
                  <div className="mt-3 flex items-end justify-between gap-3 text-white">
                    <div>
                      <h3 className="font-serif text-3xl sm:text-4xl">{category.name}</h3>
                      <p className="mt-1 text-xs text-white/80">{category.description}</p>
                    </div>
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full liquid-glass text-lg transition group-hover:bg-white group-hover:text-[#24372d]">↗</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {hasFetchError ? (
          <section id="products" className="mx-auto max-w-[1440px] px-5 pb-16 sm:px-8 lg:px-16">
            <div className="rounded-3xl border border-[#e8e0d5] bg-white px-6 py-14 text-center">
              <p className="font-serif text-2xl text-[#24372d]">The collection is taking a moment.</p>
              <Link href="/custom-order" className="mt-5 inline-flex min-h-11 items-center rounded-full bg-[#24372d] px-5 text-xs font-bold uppercase tracking-[0.12em] text-white">Request a product</Link>
            </div>
          </section>
        ) : productList.length === 0 ? (
          <section id="products" className="mx-auto max-w-[1440px] px-5 pb-16 sm:px-8 lg:px-16">
            <div className="rounded-3xl border border-[#e8e0d5] bg-white px-6 py-14 text-center">
              <p className="font-serif text-2xl text-[#24372d]">Your next great find starts here.</p>
              <Link href="/custom-order" className="mt-5 inline-flex min-h-11 items-center rounded-full bg-[#24372d] px-5 text-xs font-bold uppercase tracking-[0.12em] text-white">Make a request</Link>
            </div>
          </section>
        ) : (
          <>
            {onSale.length > 0 && (
              <section className="mx-auto max-w-[1440px] px-5 pb-8 sm:px-8 lg:px-16">
                <div className="relative overflow-hidden rounded-3xl bg-[#24372d] p-6 text-white sm:flex sm:items-center sm:justify-between sm:p-10">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#dfb78d]">A good find for less</p>
                    <h2 className="mt-2 font-serif text-3xl sm:text-4xl">Special prices, while they last.</h2>
                  </div>
                  <Link href="#products" className="mt-5 inline-flex min-h-11 items-center rounded-full border border-white/35 px-5 text-xs font-bold uppercase tracking-[0.12em] text-white sm:mt-0">Explore offers ↗</Link>
                </div>
              </section>
            )}
            <ProductGrid products={productList} initialCategory={initialCategory} />
          </>
        )}

        <section className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 sm:py-20 lg:px-16">
          <div className="grid overflow-hidden rounded-3xl bg-[#e7ded1] md:grid-cols-[1fr_0.85fr]">
            <div className="flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-14">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#a65f3e] sm:text-xs">Looking for something specific?</p>
              <h2 className="mt-3 max-w-lg font-serif text-3xl leading-tight tracking-[-0.035em] text-[#24372d] sm:text-5xl">Tell us what you have in mind.</h2>
              <p className="mt-4 max-w-lg text-sm leading-7 text-[#66695f]">Share a product name, photo or link. We’ll help you check whether we can source it.</p>
              <Link href="/custom-order" className="btn-shimmer mt-7 inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-full bg-[#24372d] px-7 text-xs font-bold uppercase tracking-[0.12em] text-white hover:bg-[#354e40]">Make a custom request <span>↗</span></Link>
            </div>
            <div className="relative min-h-[240px] md:min-h-[380px]">
              <img
                src={categoryTiles.find((c) => c.name === "Bags")?.product?.image_url || "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=85"}
                alt="Everyday bag"
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#1a2820] text-white">
        <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 sm:py-16 lg:px-16">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.7fr_0.8fr_1fr]">
            <div>
              <Link href="/" className="inline-flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 font-serif text-lg">R</span>
                <span className="font-serif text-2xl tracking-tight">Regal Store</span>
              </Link>
              <p className="mt-4 max-w-xs text-sm leading-6 text-white/55">Clothing, bags and shoes for the days that make up your life.</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#dfb78d]">Explore</p>
              <div className="mt-4 space-y-3 text-sm text-white/60">
                {CATEGORIES.map((c) => (
                  <Link key={c.name} href={`/search?category=${c.slug}`} className="block hover:text-white">{c.name}</Link>
                ))}
                <Link href="/search" className="block hover:text-white">Search the store</Link>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#dfb78d]">Customer care</p>
              <div className="mt-4 space-y-3 text-sm text-white/60">
                <Link href="/account/help" className="block hover:text-white">Help centre</Link>
                <Link href="/custom-order" className="block hover:text-white">Custom request</Link>
                <Link href="/account/support" className="block hover:text-white">Contact us</Link>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#dfb78d]">Talk to us</p>
              <p className="mt-4 text-sm leading-6 text-white/55">Questions about an item or delivery? Confirm details before payment.</p>
              <a href={wa || "/account/support"} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 border-b border-[#dfb78d]/60 pb-1 text-sm font-semibold text-[#dfb78d] hover:text-white">WhatsApp ↗</a>
            </div>
          </div>
          <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/35 sm:flex-row sm:justify-between">
            <span>© {new Date().getFullYear()} Regal Store. All rights reserved.</span>
            <Link href="/account/policies" className="hover:text-white/60">Policies</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
