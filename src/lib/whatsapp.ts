// Configure NEXT_PUBLIC_REGAL_WHATSAPP_NUMBER in the deployment environment.
// Use the full international number with digits only, e.g. 2348012345678.
const configuredNumber = process.env.NEXT_PUBLIC_REGAL_WHATSAPP_NUMBER || "";
export const WHATSAPP_NUMBER = configuredNumber.replace(/\D/g, "");

export function whatsappLink(message: string): string | null {
  if (WHATSAPP_NUMBER.length < 10) return null;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(price);
}

export type OrderLine = {
  name: string;
  price: number;
  quantity: number;
  image_url?: string | null;
  image_urls?: string[];
  size?: string | null;
  color?: string | null;
};

/** Build a rich WhatsApp order message with every externally hosted product image URL. */
export function buildOrderMessage(lines: OrderLine[], opts?: { intro?: string; footer?: string }) {
  const intro = opts?.intro || "Hi Regal’s Drip! I want to place an order:";
  const body = lines.map((item, index) => {
    const options = [item.size ? `Size: ${item.size}` : null, item.color ? `Colour: ${item.color}` : null].filter(Boolean).join(" · ");
    const imageUrls = [...new Set([item.image_url, ...(item.image_urls || [])].filter((url): url is string => Boolean(url?.trim())))];
    const photoLines = imageUrls.map((url, photoIndex) => `🖼️ Product image ${photoIndex + 1}:\n${url}`);
    return [`*${index + 1}. ${item.name}*`, options ? `   ${options}` : null, `   Qty: ${item.quantity} × ${formatPrice(item.price)} = ${formatPrice(item.price * item.quantity)}`, ...photoLines].filter(Boolean).join("\n");
  }).join("\n\n");
  const total = formatPrice(lines.reduce((sum, item) => sum + item.price * item.quantity, 0));
  const footer = opts?.footer || "Please confirm availability, total, and delivery before I pay.";
  return `${intro}\n\n${body}\n\n*Order total: ${total}*\n\n${footer}`;
}
