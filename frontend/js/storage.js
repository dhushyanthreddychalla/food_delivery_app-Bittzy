// js/storage.js
// Single source of truth for cart storage

export const CART_KEY = "fd_cart";

export function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (e) {
    return [];
  }
}

export function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart || []));
}

export function addToCart(item) {
  const cart = getCart();

  // item must have id, name, price, qty
  const found = cart.find(x => x.id === item.id);
  if (found) found.qty += (item.qty || 1);
  else cart.push({ ...item, qty: item.qty || 1 });

  saveCart(cart);
  return cart;
}

export function removeFromCart(id) {
  const cart = getCart().filter(x => x.id !== id);
  saveCart(cart);
  return cart;
}

export function updateQty(id, qty) {
  const cart = getCart();
  const it = cart.find(x => x.id === id);
  if (!it) return cart;

  it.qty = qty;
  if (it.qty <= 0) return removeFromCart(id);

  saveCart(cart);
  return cart;
}

export function clearCart() {
  saveCart([]);
}

export function cartCount() {
  return getCart().reduce((a, x) => a + (x.qty || 0), 0);
}