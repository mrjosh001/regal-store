// Configure NEXT_PUBLIC_REGAL_WHATSAPP_NUMBER in the deployment environment.
// Use the full international number with digits only, e.g. 2348012345678.
const configuredNumber = process.env.NEXT_PUBLIC_REGAL_WHATSAPP_NUMBER || "";
export const WHATSAPP_NUMBER = configuredNumber.replace(/\D/g, "");

export function whatsappLink(message: string): string | null {
  if (WHATSAPP_NUMBER.length < 10) return null;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(price);
}
