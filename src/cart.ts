export interface Item {
  name: string;
  price: number;
  quantity: number;
}

const CENTS_PER_UNIT = 100;
const PERCENT_SCALE = 100;

/**
 * Significant digits kept when normalising a cents value before rounding.
 *
 * A double carries ~15-17 significant digits, so trimming to 12 discards the
 * accumulated arithmetic drift while preserving every digit a monetary amount
 * actually needs.
 */
const CENTS_SIGNIFICANT_DIGITS = 12;

/**
 * Largest cents magnitude that {@link CENTS_SIGNIFICANT_DIGITS} still represents
 * exactly. Above it, trimming would corrupt the integer part, so normalisation
 * is skipped.
 */
const MAX_NORMALISABLE_CENTS = 1e12;

/**
 * Rounds a monetary value to the nearest cent, with halves rounded away from zero.
 *
 * `Math.round` already absorbs ordinary floating-point error — it picks the
 * *nearest* integer, so a ~1e-13 drift is irrelevant except right next to a half
 * cent. Ties are the problem: the exact decimal result can be a half cent while
 * its binary representation lands just *below* the boundary and rounds the wrong
 * way. For example, 0.15 discounted by 90% is exactly 1.5 cents but evaluates to
 * 1.4999999999999996, and 2.01 at 50% is exactly 100.5 cents but evaluates to
 * 100.49999999999999.
 *
 * Trimming the cents value to {@link CENTS_SIGNIFICANT_DIGITS} significant digits
 * collapses that drift back onto the decimal value the caller meant, so the
 * half-away-from-zero guarantee holds for any input carrying less than ~1e-12 of
 * relative error — which covers everything `calculateTotal` can produce. Inputs
 * drifted further than that are indistinguishable from a genuine non-tie in
 * binary floating point and are rounded on their nearest-integer merits.
 *
 * Magnitude is rounded via `Math.abs` and the sign re-applied so negative amounts
 * round symmetrically rather than being biased toward +Infinity by `Math.round`.
 *
 * @param value - The monetary amount to round.
 * @returns The amount rounded to two decimal places.
 */
function roundToNearestCent(value: number): number {
  const cents = Math.abs(value) * CENTS_PER_UNIT;
  const normalized =
    cents < MAX_NORMALISABLE_CENTS
      ? Number(cents.toPrecision(CENTS_SIGNIFICANT_DIGITS))
      : cents;
  const rounded = Math.round(normalized);
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
  // `(total * (100 - d)) / 100` rather than `total * (1 - d / 100)`: the latter
  // rounds the discount factor to a double first, adding drift before the
  // multiplication even happens.
  return roundToNearestCent(
    (total * (PERCENT_SCALE - discountPercent)) / PERCENT_SCALE,
  );
}