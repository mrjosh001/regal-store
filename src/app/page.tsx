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

type HomePageProps = {
  searchParams: Promise<{ category?: string }>;
};

const CATEGORIES = [
  { name: "Fashion", emoji: "✳", desc: "Everyday pieces, elevated" },
  { name: "Electronics", emoji: "⌁", desc: "Useful tech, thoughtfully picked" },
  { name: "Home", emoji: "⌂", desc: "Make your space yours" },
  { name: "Accessories", emoji: "◈", desc: "The finishing details" },
  { name: "Beauty", emoji: "✧", desc: "Your daily essentials" },
  { name: "Sports", emoji: "↗", desc: "Gear for moving forward" },
];

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
        .select("id, name, price, compare_at_price, image_url, category, is_new")
        .order("created_at", { ascending: false });

      if (primary.error) {
        const fallback = await supabase
          .from("products")
          .select("id, name, price, image_url, category, is_new")
          .order("created_at", { ascending: false });

        if (fallback.error) {
          hasFetchError = true;
        } else {
          productList = (fallback.data || []).map((product) => ({
            ...product,
            compare_at_price: null,
          }));
        }
      } else {
        productList = (primary.data || []) as Product[];
      }
    }
  } catch {
    hasFetchError = true;
  }

  const onSale = productList.filter(
    (product) => product.compare_at_price && product.compare_at_price > product.price
  );

  return (
    <div className="min-h-screen bg-brand-surface">
      <Header />

      <main>
        <section className="relative isolate overflow-hidden bg-[#f5f5f7]">
          <div className="pointer-events-none absolute -right-32 -top-40 h-[34rem] w-[34rem] rounded-full bg-blue-200/45 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-52 left-1/4 h-[28rem] w-[28rem] rounded-full bg-indigo-100/70 blur-3xl" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-20 md:grid-cols-[1.1fr_.9fr] md:py-28 lg:px-10">
            <div className="animate-rise-in max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-black/[.07] bg-white/75 px-3.5 py-2 text-xs font-medium text-black/65 shadow-sm backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                A more considered way to shop
              </div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[.22em] text-brand-blue">
                Regal Store · Nigeria
              </p>
              <h1 className="text-balance text-[2.8rem] font-semibold leading-[1.02] tracking-[-.055em] text-[#1d1d1f] sm:text-6xl lg:text-[4.5rem]">
                Good finds.
                <br />
                <span className="text-black/45">Better everyday.</span>
              </h1>
              <p className="mt-6 max-w-lg text-base leading-7 text-black/60 sm:text-lg sm:leading-8">
                Discover fashion, useful tech, home essentials and the little things that make life feel more like yours. Tell us what you need — we’ll help you find it.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="#products"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#1769e0] px-6 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-[#0957c3]"
                >
                  Explore the collection <span aria-hidden="true">↗</span>
                </Link>
                <Link
                  href="/custom-order"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-black/10 bg-white/75 px-6 text-sm font-semibold text-[#1d1d1f] hover:bg-white"
                >
                  Request something
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-black/55">
                <span className="inline-flex items-center gap-2"><span className="text-brand-blue">✓</span> Nationwide delivery</span>
                <span className="inline-flex items-center gap-2"><span className="text-brand-blue">✓</span> Chat before you order</span>
              </div>
            </div>

            <div className="animate-rise-in relative mx-auto w-full max-w-md" style={{ animationDelay: "100ms" }}>
              <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/75 p-5 shadow-[0_30px_90px_-35px_rgba(25,45,80,.3)] backdrop-blur-xl sm:p-7">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[.18em] text-black/40">The Regal edit</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-[-.04em] text-[#1d1d1f]">Find your next favourite.</h2>
                  </div>
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-xl text-brand-blue">✳</span>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {CATEGORIES.slice(0, 4).map((category, index) => (
                    <Link
                      key={category.name}
                      href={`/?category=${encodeURIComponent(category.name)}#products`}
                      className={`group rounded-2xl p-4 transition hover:-translate-y-0.5 hover:shadow-md ${index % 2 === 0 ? "bg-[#f5f5f7]" : "bg-blue-50/80"}`}
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xl shadow-sm">{category.emoji}</span>
                      <span className="mt-4 block text-sm font-semibold text-[#1d1d1f]">{category.name}</span>
                      <span className="mt-1 block text-xs leading-5 text-black/50">{category.desc}</span>
                    </Link>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#1d1d1f] px-4 py-4 text-white">
                  <div>
                    <p className="text-sm font-semibold">Looking for something specific?</p>
                    <p className="mt-1 text-xs text-white/60">We can help source it.</p>
                  </div>
                  <Link href="/custom-order" aria-label="Request a custom order" className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg text-[#1d1d1f] hover:bg-blue-50">↗</Link>
                </div>
              </div>
              <div className="pointer-events-none absolute -bottom-5 -right-4 -z-10 h-28 w-28 rounded-full bg-blue-300/40 blur-2xl" />
            </div>
          </div>
        </section>

        <section className="border-y border-black/[.05] bg-white/75">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-5 py-5 sm:px-8 md:grid-cols-4 lg:px-10">
            {[
              { icon: "↗", title: "Nationwide delivery", sub: "Across Nigeria" },
              { icon: "◌", title: "Personal support", sub: "Chat before you order" },
              { icon: "✳", title: "Curated finds", sub: "Products worth discovering" },
              { icon: "♡", title: "Made convenient", sub: "Browse at your pace" },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-3 rounded-xl py-1">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f5f5f7] text-lg text-brand-blue">{item.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-[#1d1d1f]">{item.title}</p>
                  <p className="mt-0.5 text-xs text-black/45">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.2em] text-brand-blue">Explore</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-.04em] text-[#1d1d1f] sm:text-3xl">Shop by category</h2>
            </div>
            <Link href="#products" className="shrink-0 text-sm font-semibold text-brand-blue hover:text-brand-blue-dark">View all <span aria-hidden="true">↗</span></Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {CATEGORIES.map((category) => (
              <Link
                key={category.name}
                href={`/?category=${encodeURIComponent(category.name)}#products`}
                className="group rounded-2xl border border-black/[.06] bg-white p-4 shadow-sm hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-950/[.04]"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f5f5f7] text-xl text-brand-blue transition group-hover:bg-blue-50">{category.emoji}</span>
                <span className="mt-4 block text-sm font-semibold text-[#1d1d1f]">{category.name}</span>
                <span className="mt-1 block text-xs leading-5 text-black/45">{category.desc}</span>
              </Link>
            ))}
          </div>
        </section>

        {hasFetchError ? (
          <section id="products" className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 lg:px-10">
            <div className="rounded-3xl border border-black/[.06] bg-white px-6 py-14 text-center">
              <p className="font-semibold text-[#1d1d1f]">Products are temporarily unavailable</p>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-black/50">Please try again in a little while, or send us a custom request.</p>
              <Link href="/custom-order" className="mt-5 inline-flex min-h-11 items-center rounded-full bg-[#1769e0] px-5 text-sm font-semibold text-white hover:bg-[#0957c3]">Request a product</Link>
            </div>
          </section>
        ) : productList.length === 0 ? (
          <section id="products" className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 lg:px-10">
            <div className="rounded-3xl border border-black/[.06] bg-white px-6 py-14 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f5f5f7] text-2xl">✳</span>
              <p className="mt-4 font-semibold text-[#1d1d1f]">Your next great find starts here.</p>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-black/50">Our collection is being updated. You can also tell us what you’re looking for.</p>
              <Link href="/custom-order" className="mt-5 inline-flex min-h-11 items-center rounded-full bg-[#1769e0] px-5 text-sm font-semibold text-white hover:bg-[#0957c3]">Request a product</Link>
            </div>
          </section>
        ) : (
          <>
            {onSale.length > 0 && (
              <section className="mx-auto max-w-7xl px-5 pb-4 sm:px-8 lg:px-10">
                <div className="flex flex-col justify-between gap-4 rounded-3xl bg-[#1d1d1f] p-6 text-white sm:flex-row sm:items-center sm:p-8">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[.18em] text-blue-300">Worth a closer look</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-[-.03em]">Special prices, while they last.</h2>
                    <p className="mt-2 text-sm text-white/60">{onSale.length} products currently have reduced prices.</p>
                  </div>
                  <Link href="#products" className="inline-flex min-h-11 items-center justify-center self-start rounded-full bg-white px-5 text-sm font-semibold text-[#1d1d1f] hover:bg-blue-50 sm:self-auto">Explore offers ↗</Link>
                </div>
              </section>
            )}
            <ProductGrid products={productList} initialCategory={initialCategory} />
          </>
        )}

        <section className="mx-auto max-w-7xl px-5 py-8 pb-14 sm:px-8 lg:px-10">
          <div className="flex flex-col justify-between gap-6 rounded-3xl border border-black/[.06] bg-white p-6 sm:p-10 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.2em] text-brand-blue">Your request, our search</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-.04em] text-[#1d1d1f] sm:text-3xl">Can’t find what you need?</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-black/55">Share a product name, photo or link. We’ll help you check whether we can source it.</p>
            </div>
            <Link href="/custom-order" className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-full bg-[#1769e0] px-6 text-sm font-semibold text-white hover:bg-[#0957c3]">Make a request ↗</Link>
          </div>
        </section>
      </main>

      <footer className="bg-[#1d1d1f] text-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link href="/" className="inline-flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-[#1769e0]">R</span>
                <span className="font-semibold tracking-tight">Regal Store</span>
              </Link>
              <p className="mt-3 max-w-xs text-sm leading-6 text-white/55">Thoughtful finds for everyday life, delivered across Nigeria.</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Explore</p>
              <div className="mt-3 space-y-2 text-sm text-white/55">
                {CATEGORIES.slice(0, 4).map((category) => <Link key={category.name} href={`/?category=${encodeURIComponent(category.name)}#products`} className="block hover:text-white">{category.name}</Link>)}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold">Support</p>
              <div className="mt-3 space-y-2 text-sm text-white/55">
                <Link href="/account/help" className="block hover:text-white">Help center</Link>
                <Link href="/account/track" className="block hover:text-white">Track order</Link>
                <Link href="/custom-order" className="block hover:text-white">Custom request</Link>
                <Link href="/account/support" className="block hover:text-white">Contact</Link>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold">Need help choosing?</p>
              <p className="mt-3 text-sm leading-6 text-white/55">Send us what you’re looking for and we’ll help you work out the next step.</p>
              <Link href="/custom-order" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-300 hover:text-white">Talk to Regal Store ↗</Link>
            </div>
          </div>
          <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} Regal Store. All rights reserved.</span>
            <span>Made for everyday life in Nigeria.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
