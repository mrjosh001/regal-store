"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { imageForColor } from "@/lib/product-gallery";

type Props = {
  name: string;
  imageUrls: string[];
  colors?: string[] | null;
  selectedColor?: string;
};

export default function ProductGallery({ name, imageUrls, colors, selectedColor }: Props) {
  const images = useMemo(() => imageUrls.filter(Boolean), [imageUrls]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const selected = imageForColor(selectedColor, colors, images);
    if (selected) {
      const selectedIndex = images.indexOf(selected);
      if (selectedIndex >= 0) setIndex(selectedIndex);
    }
  }, [selectedColor, colors, images]);

  if (!images.length) {
    return (
      <div className="flex aspect-[3/4] items-center justify-center rounded-2xl border border-black/5 bg-white text-sm text-black/40">
        Product photo coming soon
      </div>
    );
  }

  const current = images[index] || images[0];

  return (
    <div className="space-y-3">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-black/5 bg-white">
        <Image
          src={current}
          alt={`${name}${selectedColor ? ` — ${selectedColor}` : ""}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
          unoptimized
        />
        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous product image"
              onClick={() => setIndex((value) => (value - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-2xl text-white backdrop-blur-sm"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next product image"
              onClick={() => setIndex((value) => (value + 1) % images.length)}
              className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-2xl text-white backdrop-blur-sm"
            >
              ›
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              {index + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
          {images.map((image, imageIndex) => (
            <button
              type="button"
              key={`${image}-${imageIndex}`}
              aria-label={`View product image ${imageIndex + 1}`}
              aria-current={imageIndex === index}
              onClick={() => setIndex(imageIndex)}
              className={`relative aspect-square overflow-hidden rounded-xl border-2 bg-white ${
                imageIndex === index ? "border-[#263b2e]" : "border-transparent"
              }`}
            >
              <Image
                src={image}
                alt=""
                fill
                className="object-cover"
                sizes="80px"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
