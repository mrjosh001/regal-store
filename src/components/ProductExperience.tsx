"use client";

import ProductGallery from "@/components/ProductGallery";
import ProductActions from "@/components/ProductActions";

type Product = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  image_urls?: string[] | null;
  sizes?: string[] | null;
  colors?: string[] | null;
  is_available?: boolean | null;
  stock_quantity?: number | null;
};

export default function ProductExperience({ product }: { product: Product }) {
  return (
    <div className="grid gap-8 md:grid-cols-2 md:gap-12">
      <ProductGallery
        name={product.name}
        productId={product.id}
        imageUrl={product.image_url}
        imageUrls={product.image_urls}
      />
      <ProductActions product={product} />
    </div>
  );
}
