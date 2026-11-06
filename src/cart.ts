export interface Item {
  name: string;
  price: number;
  quantity: number;
}

/**
 * Rounds a monetary value to the nearest cent, with half a cent rounding up.
 *
 * The scaled value is normalised before rounding, because binary
 * floating-point error can drift a mathematically exact half cent just below
 * the boundary and make `Math.round` pick the lower cent. A 5% discount on
 * 0.30 is the canonical case: `0.3 * (1 - 5 / 100) * 100` evaluates to
 * `28.499999999999996`, which plain `Math.round` collapses to `0.28` instead
 * of the expected `0.29`.
 */
function round2(value: number): number {
  // Snap off the sub-cent drift (e.g. 28.499999999999996 -> 28.5) so that
  // exact half cents round up rather than down.
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
