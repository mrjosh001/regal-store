export type CartItem = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  quantity: number;
};

const CART_KEY = "regal-cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
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
  const existing = cart.find((i) => i.id === item.id);
  if (existing) {
    existing.quantity += qty;
  } else {
    cart.push({ ...item, quantity: qty });
  }
  saveCart(cart);
  return cart;
}

export function removeFromCart(id: string) {
  const cart = getCart().filter((i) => i.id !== id);
  saveCart(cart);
  return cart;
}

export function updateQuantity(id: string, quantity: number) {
  let cart = getCart();
  if (quantity <= 0) {
    cart = cart.filter((i) => i.id !== id);
  } else {
    cart = cart.map((i) => (i.id === id ? { ...i, quantity } : i));
  }
  saveCart(cart);
  return cart;
}

export function clearCart() {
  saveCart([]);
}

export function cartCount(items?: CartItem[]) {
  const cart = items || getCart();
  return cart.reduce((sum, i) => sum + i.quantity, 0);
}

export function cartTotal(items?: CartItem[]) {
  const cart = items || getCart();
  return cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
}
