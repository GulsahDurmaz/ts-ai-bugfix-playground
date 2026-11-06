export interface Item {
  name: string;
  price: number;
  quantity: number;
}

function round2(value: number): number {
  return Math.floor(value * 100) / 100;
}

/**
 * Calculates the cart total, taking each item's quantity into account.
 *
 * @param items - Cart items; each line contributes `price * quantity`.
 * @param discountPercent - Optional percentage discount applied to the subtotal.
 * @returns The discounted total, truncated to two decimals.
 */
export function calculateTotal(items: Item[], discountPercent = 0): number {
  let total = 0;
  for (const item of items) {
    total += item.price * item.quantity;
  }
  return round2(total * (1 - discountPercent / 100));
}