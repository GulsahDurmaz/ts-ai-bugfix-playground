export interface Item {
  name: string;
  price: number;
  quantity: number;
}

/**
 * Rounds a monetary value to the nearest cent, with half a cent rounding up.
 *
 * The value is scaled before rounding so that binary floating-point
 * representation errors (e.g. `10 * 0.67 === 6.700000000000001`) do not push
 * a result onto the wrong side of the half-cent boundary.
 */
function round2(value: number): number {
  // Trim the binary drift that the scaling introduces (e.g. 10 * 0.67 * 100
  // === 670.0000000000001) before rounding to the nearest whole cent.
  const scaledCents = Number((value * 100).toFixed(6));
  return Math.round(scaledCents) / 100;
}

/**
 * Calculates the cart total, applying an optional percentage discount.
 *
 * The returned total is rounded to the nearest cent.
 */
export function calculateTotal(items: Item[], discountPercent = 0): number {
  let total = 0;
  for (const item of items) {
    total += item.price * item.quantity;
  }
  return round2(total * (1 - discountPercent / 100));
}
