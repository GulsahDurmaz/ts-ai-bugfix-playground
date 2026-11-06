export interface Item {
  name: string;
  price: number;
  quantity: number;
}

/**
 * Truncates a monetary value to two decimals.
 *
 * A small epsilon is added before truncating so that binary floating-point
 * artifacts (e.g. `10.1 * 3 === 30.299999999999997`) are not truncated down
 * to the wrong cent.
 */
function round2(value: number): number {
  return Math.floor(value * 100 + 1e-9) / 100;
}

/**
 * Calculates the total price of a cart.
 *
 * Each item contributes `price * quantity`, so adding multiple units of the
 * same item is counted in full. The optional discount is applied to the cart
 * total and the result is truncated to two decimals.
 *
 * @param items - Cart items, each with a price and a quantity.
 * @param discountPercent - Percentage discount applied to the cart total.
 * @returns The cart total, truncated to two decimals.
 */
export function calculateTotal(items: Item[], discountPercent = 0): number {
  let total = 0;
  for (const item of items) {
    total += item.price * item.quantity;
  }
  return round2(total * (1 - discountPercent / 100));
}