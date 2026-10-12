import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const SITE_URL = "https://regal-store.vercel.app";
const STORE_CATEGORIES = new Set(["clothing", "fashion", "shoes"]);

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/search`,
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("id, category, created_at")
      .order("created_at", { ascending: false });

    if (error || !data) return staticRoutes;

    const productRoutes: MetadataRoute.Sitemap = data
      .filter((product) => STORE_CATEGORIES.has((product.category || "").toLowerCase()))
      .map((product) => ({
        url: `${SITE_URL}/products/${product.id}`,
        lastModified: product.created_at ? new Date(product.created_at) : undefined,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));

    return [...staticRoutes, ...productRoutes];
  } catch {
    // Keep the public sitemap available if the catalogue API is temporarily unavailable.
    return staticRoutes;
  }
}
