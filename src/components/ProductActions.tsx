"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { addToCart, getCart } from "@/lib/cart";
import { whatsappLink, formatPrice } from "@/lib/whatsapp";
import { expandSizes, expandColors } from "@/lib/product-options";

type Props = {
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    sizes?: string[] | null;
    colors?: string[] | null;
    is_available?: boolean | null;
    stock_quantity?: number | null;
  };
};

export default function ProductActions({ product }: Props) {
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [showWhatsAppSetup, setShowWhatsAppSetup] = useState(false);
  const [cartQuantity, setCartQuantity] = useState(0);

  useEffect(() => {
    const quantityInCart = getCart().filter((item) => item.id === product.id).reduce((sum, item) => sum + item.quantity, 0);
    setCartQuantity(quantityInCart);
  }, [product.id, selectedSize, selectedColor, added]);

  const sizes = expandSizes(product.sizes as any);
  const colors = expandColors(product.colors as any);
  const isSoldOut = product.stock_quantity === 0;
  const isUnavailable = product.is_available === false || isSoldOut;
  const needsAvailabilityConfirmation = product.is_available == null && product.stock_quantity == null;
  const stockTracked = product.stock_quantity != null;
  const remainingToAdd = stockTracked ? Math.max(0, (product.stock_quantity || 0) - cartQuantity) : 99;
  const quantityAvailable = !stockTracked || quantity <= remainingToAdd;

  const optionsChosen = (!sizes.length || Boolean(selectedSize)) && (!colors.length || Boolean(selectedColor));
  const variantDetails = [
    sizes.length ? `Size: ${selectedSize || "Not selected"}` : null,
    colors.length ? `Colour: ${selectedColor || "Not selected"}` : null,
  ].filter(Boolean).join("\n");

  async function handleWhatsAppOrder() {
    if (!optionsChosen) return;
    setAddError(null);
    const pendingTab = window.open("about:blank", "_blank");
    if (!pendingTab) {
      setAddError("Please allow pop-ups to continue to WhatsApp ordering.");
      return;
    }
    const orderTab = pendingTab as Window;
    const whatsappUrl = whatsappLink(waMessage);
    if (!whatsappUrl) {
      orderTab.close();
      setAddError("Regal Store WhatsApp is not configured. Please contact the store directly.");
      return;
    }
    if (isUnavailable) {
      orderTab.location.href = whatsappUrl;
      return;
    }
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data, error } = await supabase
        .from("products")
        .select("stock_quantity, is_available")
        .eq("id", product.id)
        .maybeSingle();
      if (error || !data) throw new Error("We could not verify current stock. Please try again or contact Regal Store.");
      if (data.is_available === false || data.stock_quantity === 0) {
        orderTab.close();
        setAddError("This product is currently sold out or unavailable. Your WhatsApp order was not opened.");
        return;
      }
      if (data.stock_quantity != null && quantity > data.stock_quantity) {
        orderTab.close();
        setAddError(`Only ${data.stock_quantity} unit(s) remain in stock. Please reduce the quantity and try again.`);
        return;
      }
      orderTab.location.href = whatsappUrl;
    } catch (error) {
      orderTab.close();
      setAddError(error instanceof Error ? error.message : "We could not verify current stock. Please try again.");
    }
  }

  function handleAdd() {
    if (isUnavailable || !optionsChosen || !quantityAvailable) return;
    setAddError(null);
    try {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        size: selectedSize || null,
        color: selectedColor || null,
        stock_quantity: product.stock_quantity,
      }, quantity);
      setQuantity(1);
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1800);
    } catch (error) {
      setAddError(error instanceof Error ? error.message : "Could not add this quantity to your cart.");
    }
  }

  const waMessage = isUnavailable
    ? `Hi Regal Store! I'm interested in *${product.name}*, which is currently marked unavailable on the website.${variantDetails ? `\n${variantDetails}` : ""}\n\nPlease let me know if this item can be sourced or restocked.`
    : `Hi Regal Store! I'm interested in *${product.name}* (Quantity: ${quantity}).${variantDetails ? `\n${variantDetails}` : ""}\n\nPlease confirm availability and delivery before I pay.`;
  const orderLink = isUnavailable ? whatsappLink(waMessage) : null;

  const inputClass = "min-h-12 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-[#1d1d1f] focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20";

  return (
    <div className="mt-auto space-y-3">
      {(sizes.length > 0 || colors.length > 0) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {sizes.length > 0 && (
            <div>
              <label htmlFor="product-size" className="mb-1.5 block text-sm font-medium text-[#1d1d1f]">Size *</label>
              <select id="product-size" value={selectedSize} onChange={(event) => setSelectedSize(event.target.value)} className={inputClass}>
                <option value="">Choose a size</option>
                {sizes.map((size) => <option key={size} value={size}>{size}</option>)}
              </select>
            </div>
          )}
          {colors.length > 0 && (
            <div>
              <label htmlFor="product-colour" className="mb-1.5 block text-sm font-medium text-[#1d1d1f]">Colour *</label>
              <select id="product-colour" value={selectedColor} onChange={(event) => setSelectedColor(event.target.value)} className={inputClass}>
                <option value="">Choose a colour</option>
                {colors.map((color) => <option key={color} value={color}>{color}</option>)}
              </select>
            </div>
          )}
        </div>
      )}

      {!optionsChosen && (
        <p className="text-sm text-black/55">Choose {sizes.length && colors.length ? "a size and colour" : sizes.length ? "a size" : "a colour"} to continue.</p>
      )}

      {needsAvailabilityConfirmation && !isUnavailable && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
          Availability has not been confirmed yet. The store will verify this item with you before payment.
        </p>
      )}

      {stockTracked && !isUnavailable && (
        <div>
          <label htmlFor="product-quantity" className="mb-1.5 block text-sm font-medium text-[#1d1d1f]">Quantity</label>
          <select id="product-quantity" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} className={inputClass}>
            {Array.from({ length: Math.max(1, Math.min(remainingToAdd, 99)) }, (_, index) => index + 1).map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <p className="mt-1 text-xs text-black/50">{remainingToAdd} more unit(s) available across this product’s sizes and colours.</p>
        </div>
      )}
      {stockTracked && !isUnavailable && !quantityAvailable && <p role="alert" className="text-sm text-red-600">Your cart already contains all available stock for this option.</p>}

      {addError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">{addError}</p>}

      {!isUnavailable ? (
        <button
          type="button"
          onClick={handleAdd}
          disabled={!optionsChosen || !quantityAvailable}
          className="flex min-h-12 w-full items-center justify-center rounded-full bg-[#1769e0] py-3.5 font-semibold text-white shadow-lg shadow-blue-600/15 hover:bg-[#0957c3] disabled:cursor-not-allowed disabled:opacity-45"
        >
          {added ? "Added to cart ✓" : `Add ${quantity > 1 ? `${quantity} to cart` : "to cart"}`}
        </button>
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
          Currently unavailable to order
        </div>
      )}

      {isUnavailable ? (
        orderLink ? (
          <a
            href={orderLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3.5 font-semibold text-white hover:bg-[#1da851]"
          >
            Ask about availability <span aria-hidden="true">↗</span>
          </a>
        ) : (
          <button
            type="button"
            disabled={!optionsChosen}
            onClick={() => setShowWhatsAppSetup((current) => !current)}
            className="flex min-h-12 w-full items-center justify-center rounded-full border border-black/10 bg-white py-3.5 font-semibold text-[#1d1d1f] hover:bg-black/[.03] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {!optionsChosen ? "Select options to continue" : "WhatsApp ordering unavailable"}
          </button>
        )
      ) : (
        <button
          type="button"
          onClick={handleWhatsAppOrder}
          disabled={!optionsChosen || !quantityAvailable}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3.5 font-semibold text-white hover:bg-[#1da851] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Order via WhatsApp <span aria-hidden="true">↗</span>
        </button>
      )}

      {!orderLink && optionsChosen && showWhatsAppSetup && (
        <p role="status" className="rounded-xl bg-amber-50 p-3 text-sm leading-6 text-amber-900">
          Regal Store needs to configure its business WhatsApp number before this link can be used. You can still use the cart when the item is available.
        </p>
      )}

      <Link
        href="/custom-order"
        className="flex min-h-12 w-full items-center justify-center rounded-full border border-black/10 bg-white py-3.5 font-semibold text-[#1d1d1f] hover:border-black/20 hover:bg-black/[.02]"
      >
        Request a similar item
      </Link>
    </div>
  );
}
