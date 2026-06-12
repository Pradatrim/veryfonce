// Cross-creator shopping cart, stored in localStorage (matches the prototype).
// One cart can hold products from multiple creators.
export interface CartItem {
  productId: string;
  variantId?: string;
  username: string; // the creator whose storefront it came from
  title: string;
  image: string;
  price: number; // listed price (dollars)
  qty: number;
}

const KEY = "fonce_cart";
const EVT = "fonce-cart-change";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function write(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(EVT));
}

export function cartCount(): number {
  return getCart().reduce((s, i) => s + i.qty, 0);
}

export function addToCart(item: Omit<CartItem, "qty">, qty = 1) {
  const items = getCart();
  const existing = items.find((i) => i.productId === item.productId && i.variantId === item.variantId);
  if (existing) existing.qty += qty;
  else items.push({ ...item, qty });
  write(items);
}

export function setQty(productId: string, variantId: string | undefined, qty: number) {
  let items = getCart();
  if (qty <= 0) {
    items = items.filter((i) => !(i.productId === productId && i.variantId === variantId));
  } else {
    const it = items.find((i) => i.productId === productId && i.variantId === variantId);
    if (it) it.qty = qty;
  }
  write(items);
}

export function removeFromCart(productId: string, variantId: string | undefined) {
  write(getCart().filter((i) => !(i.productId === productId && i.variantId === variantId)));
}

export function clearCart() {
  write([]);
}

export const CART_EVENT = EVT;
