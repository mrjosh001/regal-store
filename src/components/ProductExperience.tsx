"use client";

import { useState } from "react";
import ProductGallery from "@/components/ProductGallery";
import ProductActions from "@/components/ProductActions";
import { galleryImages } from "@/lib/product-gallery";

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
  const [selectedColor, setSelectedColor] = useState("");
  const images = galleryImages(product.image_url, product.image_urls);

  return (
    <div className="grid gap-8 md:grid-cols-2 md:gap-12">
      <ProductGallery
        name={product.name}
        imageUrls={images}
        colors={product.colors}
        selectedColor={selectedColor}
      />
      <ProductActions
        product={product}
        selectedColor={selectedColor}
        onColorChange={setSelectedColor}
      />
    </div>
  );
}
