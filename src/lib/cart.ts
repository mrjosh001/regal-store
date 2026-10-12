export type CartItem = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  quantity: number;
  size?: string | null;
  color?: string | null;
  stock_quantity?: number | null;
};

const CART_KEY = "regal-cart";

export function cartItemKey(item: Pick<CartItem, "id" | "size" | "color">) {
  return `${item.id}::${item.size || ""}::${item.color || ""}`;
}

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart-updated"));
}

export function addToCart(item: Omit<CartItem, "quantity">, qty = 1) {
  const cart = getCart();
  const existing = cart.find((i) => cartItemKey(i) === cartItemKey(item));
  const currentProductQuantity = cart.filter((i) => i.id === item.id).reduce((sum, i) => sum + i.quantity, 0);
  const desiredProductQuantity = currentProductQuantity + qty;
  if (item.stock_quantity != null && desiredProductQuantity > item.stock_quantity) {
    throw new Error(`Only ${Math.max(0, item.stock_quantity - currentProductQuantity)} more unit(s) are available across this product's sizes and colours.`);
  }
  const desiredQuantity = (existing?.quantity || 0) + qty;
  if (existing) {
    existing.quantity = desiredQuantity;
    existing.stock_quantity = item.stock_quantity;
  } else {
    cart.push({ ...item, quantity: qty });
  }
  saveCart(cart);
  return cart;
}

export function removeFromCart(key: string) {
  const cart = getCart().filter((item) => cartItemKey(item) !== key && item.id !== key);
  saveCart(cart);
  return cart;
}

export function updateQuantity(key: string, quantity: number) {
  let cart = getCart();
  if (quantity <= 0) {
    cart = cart.filter((item) => cartItemKey(item) !== key && item.id !== key);
  } else {
    const target = cart.find((item) => cartItemKey(item) === key || item.id === key);
    if (!target) return cart;
    const otherQuantity = cart
      .filter((item) => item.id === target.id && cartItemKey(item) !== cartItemKey(target))
      .reduce((sum, item) => sum + item.quantity, 0);
    const safeQuantity = target.stock_quantity == null
      ? quantity
      : Math.min(quantity, Math.max(0, target.stock_quantity - otherQuantity));
    if (safeQuantity <= 0) {
      cart = cart.filter((item) => cartItemKey(item) !== cartItemKey(target));
    } else {
      cart = cart.map((item) =>
        cartItemKey(item) === cartItemKey(target) ? { ...item, quantity: safeQuantity } : item
      );
    }
  }
  saveCart(cart);
  return cart;
}

export function clearCart() {
  saveCart([]);
}

export function cartCount(items?: CartItem[]) {
  const cart = items || getCart();
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

export function cartTotal(items?: CartItem[]) {
  const cart = items || getCart();
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
