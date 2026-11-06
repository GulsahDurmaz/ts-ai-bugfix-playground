export interface Item {
  name: string;
  price: number;
  quantity: number;
}

const CENTS_PER_UNIT = 100;

/**
 * Rounds a monetary value to the nearest cent, with halves rounded away from zero.
 *
 * The value is nudged by one relative ULP before rounding so that amounts whose
 * binary representation lands just below a cent boundary still round the way a
 * human expects. For example, 10 with a 33% discount evaluates to
 * 6.699999999999999 in floating point, which must still become 6.7.
 *
 * @param value - The monetary amount to round.
 * @returns The amount rounded to two decimal places.
 */
function roundToNearestCent(value: number): number {
  const cents = Math.abs(value) * CENTS_PER_UNIT;
  const rounded = Math.round(cents * (1 + Number.EPSILON));
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