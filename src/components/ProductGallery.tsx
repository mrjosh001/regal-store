"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type Props = { name: string; productId: string; imageUrl: string | null; imageUrls?: string[] | null };

function normalize(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function colorMatchesUrl(color: string, url: string) {
  const normalizedColor = normalize(color);
  if (!normalizedColor) return false;
  const haystack = normalize(decodeURIComponent(url));
  const aliases: Record<string, string[]> = {
    black: ["black", "blk", "noir"], white: ["white", "wht", "ivory", "cream"], red: ["red", "scarlet", "burgundy", "wine"],
    blue: ["blue", "navy", "royal"], green: ["green", "olive", "emerald"], brown: ["brown", "tan", "camel", "chocolate"],
    pink: ["pink", "rose", "blush"], purple: ["purple", "violet", "lilac"], grey: ["grey", "gray", "silver"],
    gold: ["gold", "golden"], orange: ["orange", "rust"], yellow: ["yellow", "mustard"],
  };
  const candidates = aliases[normalizedColor] || [normalizedColor];
  return candidates.some((candidate) => haystack.split(" ").includes(candidate) || haystack.includes(`/${candidate}.`) || haystack.includes(`-${candidate}-`) || haystack.includes(`_${candidate}_`));
}

export default function ProductGallery({ name, productId, imageUrl, imageUrls }: Props) {
  const images = useMemo(() => [...new Set([imageUrl, ...(imageUrls || [])].filter((url): url is string => Boolean(url?.trim())))], [imageUrl, imageUrls]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const handler = (event: Event) => {
      const custom = event as CustomEvent<{ productId: string; color: string }>;
      if (custom.detail?.productId !== productId || !custom.detail.color || images.length < 2) return;
      const matchingIndex = images.findIndex((url) => colorMatchesUrl(custom.detail.color, url));
      if (matchingIndex >= 0) setIndex(matchingIndex);
    };
    window.addEventListener("regal-product-color", handler);
    return () => window.removeEventListener("regal-product-color", handler);
  }, [images, productId]);

  useEffect(() => setIndex((current) => Math.min(current, Math.max(0, images.length - 1))), [images.length]);

  if (!images.length) return <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-black/5 bg-white"><div className="flex h-full w-full items-center justify-center text-black/40">Product photo coming soon</div></div>;
  const activeImage = images[index] || images[0];
  const previous = () => setIndex((current) => (current - 1 + images.length) % images.length);
  const next = () => setIndex((current) => (current + 1) % images.length);

  return (
    <div className="space-y-3">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-black/5 bg-white">
        <Image src={activeImage} alt={name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" priority unoptimized />
        {images.length > 1 && <>
          <button type="button" onClick={previous} aria-label="Previous product image" className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-xl text-white backdrop-blur-sm hover:bg-black/70">‹</button>
          <button type="button" onClick={next} aria-label="Next product image" className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-xl text-white backdrop-blur-sm hover:bg-black/70">›</button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">{index + 1} / {images.length}</div>
        </>}
      </div>
      {images.length > 1 && <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide" aria-label="Product images">
        {images.map((url, imageIndex) => <button key={url} type="button" onClick={() => setIndex(imageIndex)} aria-label={`View product image ${imageIndex + 1}`} className={`relative h-20 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-white ${imageIndex === index ? "border-[#263b2e]" : "border-black/10"}`}><Image src={url} alt="" fill className="object-cover" sizes="64px" unoptimized /></button>)}
      </div>}
    </div>
  );
}
