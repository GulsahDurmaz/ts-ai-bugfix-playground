export interface Item {
  name: string;
  price: number;
  quantity: number;
}

const CENTS_PER_UNIT = 100;

/**
 * Rounds a monetary value to the nearest cent, with halves rounded away from zero.
 *
 * The value is nudged by one relative ULP before rounding. `Math.round` already
 * absorbs ordinary floating-point error — it picks the *nearest* integer, so a
 * ~1e-13 drift is irrelevant almost everywhere. The nudge only matters when the
 * exact decimal result is a half cent but its binary representation lands just
 * *below* the boundary, which would otherwise round the wrong way. For example,
 * 2.01 with a 50% discount is exactly 1.005, yet evaluates to
 * 100.49999999999999 cents: without the nudge that becomes 1.00 instead of 1.01.
 *
 * Magnitude is rounded via `Math.abs` and the sign re-applied so negative amounts
 * round symmetrically rather than being biased toward +Infinity by `Math.round`.
 *
 * @param value - The monetary amount to round.
 * @returns The amount rounded to two decimal places.
 */
function roundToNearestCent(value: number): number {
  const cents = Math.abs(value) * CENTS_PER_UNIT;
  const rounded = Math.round(cents * (1 + Number.EPSILON));
  // Guard against -0 leaking out when a negative amount rounds to zero.
  if (rounded === 0) {
    return 0;
  }
  return (Math.sign(value) * rounded) / CENTS_PER_UNIT;
}

/**
 * Calculates the cart total, taking each item's quantity into account.
 *
 * @param items - Cart items; each line contributes `price * quantity`.
 * @param discountPercent - Optional percentage discount applied to the subtotal.
 * @returns The discounted total, rounded to the nearest cent.
 */
export function calculateTotal(items: Item[], discountPercent = 0): number {
  let total = 0;
  for (const item of items) {
    total += item.price * item.quantity;
  }
  return roundToNearestCent(total * (1 - discountPercent / 100));
}