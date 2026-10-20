export function galleryImages(imageUrl: string | null, imageUrls?: string[] | null) {
  const candidates = [
    ...(imageUrls || []),
    ...(imageUrl ? [imageUrl] : []),
  ].map((url) => url.trim()).filter(Boolean);
  return [...new Set(candidates)];
}

function normalizedWords(value: string) {
  return value
    .toLocaleLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

export function imageForColor(
  color: string | null | undefined,
  colors: string[] | null | undefined,
  images: string[]
) {
  if (!color || images.length === 0) return images[0] || null;

  const selected = normalizedWords(color);
  if (!selected.length) return images[0] || null;

  // First choice: an image URL containing the selected colour name.
  const byUrl = images.find((url) => {
    const words = normalizedWords(url);
    return selected.every((word) => words.includes(word));
  });
  if (byUrl) return byUrl;

  // Practical fallback for bulk uploads: when colours and image links were
  // entered in the same order, pair colour 1 with image 1, colour 2 with image 2, etc.
  const index = (colors || []).findIndex(
    (entry) => entry.toLocaleLowerCase().trim() === color.toLocaleLowerCase().trim()
  );
  return index >= 0 && index < images.length ? images[index] : images[0] || null;
}
