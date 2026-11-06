export interface Item {
  name: string;
  price: number;
  quantity: number;
}

/**
 * Rounds a monetary value to the nearest cent (half away from zero).
 *
 * The value is first normalised with `toPrecision(12)` so that binary
 * floating-point drift (e.g. `10 * (1 - 33 / 100)` === `6.699999999999999`)
 * does not push an exact value onto the wrong side of the rounding boundary.
 */
function round2(value: number): number {
  const cents = Number((value * 100).toPrecision(12));
  return Math.sign(cents) * Math.round(Math.abs(cents)) / 100;
}

/**
 * Returns the cart total, optionally reduced by `discountPercent`,
 * rounded to the nearest cent.
 */
export function calculateTotal(items: Item[], discountPercent = 0): number {
  let total = 0;
  for (const item of items) {
    total += item.price * item.quantity;
  }
  return round2(total * (1 - discountPercent / 100));
}
