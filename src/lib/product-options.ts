/** Expand admin-entered size strings into individual selectable sizes. */
export function expandSizes(raw: string[] | string | null | undefined): string[] {
  const list = normalizeList(raw);
  const out: string[] = [];

  for (const item of list) {
    const value = item.trim();
    if (!value) continue;

    // "30-38", "30 – 38", "30—38"
    const range = value.match(/^(\d+)\s*[-–—]\s*(\d+)$/);
    if (range) {
      const start = Number(range[1]);
      const end = Number(range[2]);
      if (Number.isFinite(start) && Number.isFinite(end) && end >= start && end - start <= 40) {
        for (let n = start; n <= end; n += 1) out.push(String(n));
        continue;
      }
    }

    // Comma / slash separated: "30, 32, 34" or "S/M/L"
    if (/[,/]/.test(value) && !/^\d+$/.test(value)) {
      value.split(/[,/]/).map((p) => p.trim()).filter(Boolean).forEach((p) => out.push(p));
      continue;
    }

    out.push(value);
  }

  return uniquePreserveOrder(out);
}

/** Expand combined colour labels into individual colours. */
export function expandColors(raw: string[] | string | null | undefined): string[] {
  const list = normalizeList(raw);
  const out: string[] = [];

  for (const item of list) {
    const value = item.trim();
    if (!value) continue;

    // "Black and white", "Black & White", "Black/White", "Black, White"
    const parts = value
      .split(/\s+(?:and|&)\s+|\s*[,/|]\s*/i)
      .map((p) => p.trim())
      .filter(Boolean);

    if (parts.length > 1) {
      parts.forEach((p) => out.push(capitalizeWords(p)));
    } else {
      out.push(capitalizeWords(value));
    }
  }

  return uniquePreserveOrder(out);
}

function normalizeList(raw: string[] | string | null | undefined): string[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    // JSON array string
    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.map(String);
      } catch {
        /* fall through */
      }
    }
    return [trimmed];
  }
  return [];
}

function uniquePreserveOrder(items: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of items) {
    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

function capitalizeWords(value: string): string {
  return value
    .split(/\s+/)
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ""))
    .join(" ")
    .trim();
}
