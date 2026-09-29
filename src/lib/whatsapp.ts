// Update this with your real WhatsApp number (country code + number, no + or spaces)
// Example: "2348012345678"
export const WHATSAPP_NUMBER = "234";

export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
