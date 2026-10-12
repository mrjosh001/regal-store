import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";
import ProductGrid from "@/components/ProductGrid";
import { whatsappLink } from "@/lib/whatsapp";

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
    eyebrow: "Wear it your way",
    description: "Easy pieces. Strong looks.",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Bags",
    eyebrow: "Carry a little confidence",
    description: "Everyday carry, elevated.",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Shoes",
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
            .filter((product) => ["clothing", "fashion", "shoes", "bag", "bags"].includes((product.category || "").toLowerCase()))
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
          .filter((product) => ["clothing", "fashion", "shoes", "bag", "bags"].includes((product.category || "").toLowerCase()))
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
    product: productList.find((product) => product.category === category.name && product.image_url),
  }));
  const heroProduct = productList.find((product) => product.image_url);

  return (
    <div className="min-h-screen bg-[#fbf8f3] text-[#24231f]">
      <div className="bg-[#24372d] px-4 py-2.5 text-center text-[10px] font-semibold uppercase tracking-[.18em] text-white sm:text-xs">
        Clothing · Bags · Shoes <span className="mx-2 text-[#d9b989]">/</span> Everyday style, thoughtfully found
      </div>
      <Header />

      <main>
        <section className="overflow-hidden bg-[#f1eadf]">
          <div className="mx-auto grid max-w-[1440px] items-stretch md:min-h-[620px] md:grid-cols-[.92fr_1.08fr]">
            <div className="flex flex-col justify-center px-6 py-14 sm:px-10 sm:py-20 lg:px-16 lg:py-24">
              <p className="mb-5 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.24em] text-[#536b58] sm:text-xs">
                <span className="h-px w-8 bg-[#536b58]" /> The Regal Store edit
              </p>
              <h1 className="max-w-xl font-serif text-[3.35rem] leading-[.98] tracking-[-.055em] text-[#24372d] sm:text-7xl lg:text-[5.7rem]">
                A little more
                <br />
                <span className="italic text-[#a65f3e]">you.</span> Every day.
              </h1>
              <p className="mt-6 max-w-md text-sm leading-7 text-[#5e6259] sm:text-base sm:leading-8">
                The pieces you reach for, the details that pull a look together, and the finds that feel like they were waiting for you.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="#shop-the-edit"
                  className="inline-flex min-h-12 items-center justify-center gap-3 bg-[#24372d] px-6 text-xs font-bold uppercase tracking-[.12em] text-white hover:bg-[#354e40]"
                >
                  Shop the collection <span aria-hidden="true">↗</span>
                </Link>
                <Link
                  href="/custom-order"
                  className="inline-flex min-h-12 items-center justify-center border border-[#24372d]/25 px-6 text-xs font-bold uppercase tracking-[.12em] text-[#24372d] hover:bg-white/50"
                >
                  Find it for me
                </Link>
              </div>
              <div className="mt-10 flex items-center gap-3 text-xs text-[#66695f]">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#24372d]/20 text-[#24372d]">✳</span>
                <span>Browse at your pace. Message us to confirm details before ordering.</span>
              </div>
            </div>

            <div className="relative min-h-[390px] overflow-hidden bg-[#d7c9b5] sm:min-h-[500px] md:min-h-full">
              <img
                src={heroProduct?.image_url || "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=90"}
                alt={heroProduct ? heroProduct.name : "Fashion styling inspiration"}
                className="absolute inset-0 h-full w-full object-cover"
                fetchPriority="high"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1b261e]/50 via-transparent to-black/5" />
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 text-white sm:bottom-8 sm:left-8 sm:right-8">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[.22em] text-white/75">Your next favourite</p>
                  <p className="mt-2 max-w-xs font-serif text-2xl leading-tight sm:text-3xl">Good style lives in the details.</p>
                </div>
                <Link href="#shop-the-edit" aria-label="Explore the collection" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f1eadf] text-xl text-[#24372d] hover:bg-white">↘</Link>
              </div>
              <div className="absolute right-5 top-5 hidden border border-white/50 bg-[#fbf8f3]/90 px-4 py-3 text-[#24372d] backdrop-blur sm:block">
                <p className="text-[9px] font-bold uppercase tracking-[.2em]">REGAL</p>
                <p className="mt-1 font-serif text-xl italic">The everyday edit</p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[#e8e0d5] bg-[#fbf8f3]">
          <div className="mx-auto grid max-w-[1440px] grid-cols-1 divide-y divide-[#e8e0d5] px-6 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-10 lg:px-16">
            {[
              { number: "01", title: "Discover", copy: "Explore clothing, bags and shoes." },
              { number: "02", title: "Ask us", copy: "Check sizing, availability and details." },
              { number: "03", title: "Order with clarity", copy: "Confirm the details before payment." },
            ].map((step) => (
              <div key={step.number} className="flex items-start gap-4 py-5 sm:px-6 sm:py-7 first:sm:pl-0 last:sm:pr-0">
                <span className="pt-0.5 font-serif text-lg italic text-[#a65f3e]">{step.number}</span>
                <div>
                  <p className="text-sm font-semibold text-[#24372d]">{step.title}</p>
                  <p className="mt-1 text-xs leading-5 text-[#73746c]">{step.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="shop-the-edit" className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 sm:py-20 lg:px-16">
          <div className="mb-7 flex items-end justify-between gap-4 sm:mb-9">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.24em] text-[#a65f3e] sm:text-xs">Make it yours</p>
              <h2 className="mt-2 font-serif text-3xl tracking-[-.03em] text-[#24372d] sm:text-5xl">Shop by mood. Shop by moment.</h2>
            </div>
            <span className="hidden pb-1 text-xs text-[#77776e] sm:block">Three ways to find your next favourite</span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
            {categoryTiles.map((category, index) => (
              <Link
                key={category.name}
                href={`/?category=${encodeURIComponent(category.name)}#products`}
                className={`group relative isolate min-h-[330px] overflow-hidden bg-[#ddd0bf] sm:min-h-[420px] ${index === 1 ? "sm:translate-y-7" : ""}`}
              >
                <img
                  src={category.product?.image_url || category.image}
                  alt={category.product?.name || category.name}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-black/0 transition group-hover:from-black/75" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-7">
                  <p className="text-[9px] font-bold uppercase tracking-[.22em] text-white/75">{category.eyebrow}</p>
                  <div className="mt-2 flex items-end justify-between gap-3">
                    <div>
                      <h3 className="font-serif text-3xl sm:text-4xl">{category.name}</h3>
                      <p className="mt-1 text-xs text-white/80">{category.description}</p>
                    </div>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/65 text-lg transition group-hover:bg-white group-hover:text-[#24372d]">↗</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {hasFetchError ? (
          <section id="products" className="mx-auto max-w-[1440px] px-5 pb-16 sm:px-8 lg:px-16">
            <div className="border border-[#e8e0d5] bg-white px-6 py-14 text-center">
              <p className="font-serif text-2xl text-[#24372d]">The collection is taking a moment.</p>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#73746c]">Please try again shortly, or send us a request and we’ll help you look.</p>
              <Link href="/custom-order" className="mt-5 inline-flex min-h-11 items-center bg-[#24372d] px-5 text-xs font-bold uppercase tracking-[.12em] text-white hover:bg-[#354e40]">Request a product</Link>
            </div>
          </section>
        ) : productList.length === 0 ? (
          <section id="products" className="mx-auto max-w-[1440px] px-5 pb-16 sm:px-8 lg:px-16">
            <div className="border border-[#e8e0d5] bg-white px-6 py-14 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f1eadf] font-serif text-2xl text-[#a65f3e]">R</span>
              <p className="mt-4 font-serif text-2xl text-[#24372d]">Your next great find starts here.</p>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#73746c]">We’re refreshing the clothing, bags and shoes collection. Check back soon or ask us to source something specific.</p>
              <Link href="/custom-order" className="mt-5 inline-flex min-h-11 items-center bg-[#24372d] px-5 text-xs font-bold uppercase tracking-[.12em] text-white hover:bg-[#354e40]">Make a request</Link>
            </div>
          </section>
        ) : (
          <>
            {onSale.length > 0 && (
              <section className="mx-auto max-w-[1440px] px-5 pb-8 sm:px-8 lg:px-16">
                <div className="flex flex-col justify-between gap-4 bg-[#24372d] p-6 text-white sm:flex-row sm:items-center sm:p-9">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#dfb78d]">A good find for less</p>
                    <h2 className="mt-2 font-serif text-3xl sm:text-4xl">Special prices, while they last.</h2>
                    <p className="mt-2 text-sm text-white/65">{onSale.length} {onSale.length === 1 ? "item has" : "items have"} a reduced price.</p>
                  </div>
                  <Link href="#products" className="inline-flex min-h-11 items-center justify-center self-start border border-white/35 px-5 text-xs font-bold uppercase tracking-[.12em] text-white hover:bg-white hover:text-[#24372d] sm:self-auto">Explore offers ↗</Link>
                </div>
              </section>
            )}
            <ProductGrid products={productList} initialCategory={initialCategory} />
          </>
        )}

        <section className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 sm:py-16 lg:px-16">
          <div className="grid overflow-hidden bg-[#e7ded1] md:grid-cols-[1fr_.8fr]">
            <div className="flex flex-col justify-center px-6 py-9 sm:px-10 sm:py-12">
              <p className="text-[10px] font-bold uppercase tracking-[.24em] text-[#a65f3e] sm:text-xs">Looking for something specific?</p>
              <h2 className="mt-3 max-w-lg font-serif text-3xl leading-tight tracking-[-.035em] text-[#24372d] sm:text-5xl">Tell us what you have in mind.</h2>
              <p className="mt-4 max-w-lg text-sm leading-7 text-[#66695f]">Share a product name, photo or link. We’ll help you check whether we can source it. No need to know exactly what you’re looking for yet.</p>
              <Link href="/custom-order" className="mt-6 inline-flex min-h-12 items-center justify-center gap-3 self-start bg-[#24372d] px-6 text-xs font-bold uppercase tracking-[.12em] text-white hover:bg-[#354e40]">Make a custom request <span>↗</span></Link>
            </div>
            <div className="relative min-h-[230px] bg-[#c9b59d] md:min-h-[360px]">
              <img
                src={categoryTiles.find((category) => category.name === "Bags")?.product?.image_url || "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=85"}
                alt="A bag for everyday use"
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#1d2b23] text-white">
        <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 sm:py-14 lg:px-16">
          <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-[1.4fr_.7fr_.8fr_1fr]">
            <div>
              <Link href="/" className="inline-flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/50 font-serif text-lg">R</span>
                <span className="font-serif text-2xl tracking-tight">Regal Store</span>
              </Link>
              <p className="mt-4 max-w-xs text-sm leading-6 text-white/60">Clothing, bags and shoes for the days that make up your life. Thoughtful finds, easy browsing, personal support.</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#dfb78d]">Explore</p>
              <div className="mt-4 space-y-3 text-sm text-white/65">
                {CATEGORIES.map((category) => <Link key={category.name} href={`/?category=${encodeURIComponent(category.name)}#products`} className="block hover:text-white">{category.name}</Link>)}
                <Link href="/search" className="block hover:text-white">Search the store</Link>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#dfb78d]">Customer care</p>
              <div className="mt-4 space-y-3 text-sm text-white/65">
                <Link href="/account/help" className="block hover:text-white">Help centre</Link>
                <Link href="/account/track" className="block hover:text-white">Track an order</Link>
                <Link href="/custom-order" className="block hover:text-white">Custom request</Link>
                <Link href="/account/support" className="block hover:text-white">Contact us</Link>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#dfb78d]">Talk to us</p>
              <p className="mt-4 text-sm leading-6 text-white/60">Questions about an item, sizing or delivery? Contact us to confirm the details before payment.</p>
              <a href={whatsappLink("Hello Regal Store, I need help choosing a product.") || "/account/support"} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 border-b border-[#dfb78d]/70 pb-1 text-sm font-semibold text-[#dfb78d] hover:text-white">WhatsApp · +234 906 424 4342 ↗</a>
            </div>
          </div>
          <div className="mt-10 flex flex-col gap-2 border-t border-white/15 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} Regal Store. All rights reserved.</span>
            <span>Everyday style, thoughtfully found.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
