export interface Item {
  name: string;
  price: number;
  quantity: number;
}

/**
 * Rounds a monetary value to the nearest cent (half away from zero).
 *
 * The scaled value is first normalised with `toPrecision` so that binary
 * floating-point artifacts (e.g. `10 * (1 - 33 / 100) === 6.699999999999999`
 * or `10.1 * 3 === 30.299999999999997`) cannot push a value across a rounding
 * boundary and cause an off-by-one-cent result.
 */
function round2(value: number): number {
  if (!Number.isFinite(value)) {
    return value;
  }
  const cents = Number((value * 100).toPrecision(12));
  return (Math.sign(cents) * Math.round(Math.abs(cents))) / 100;
}

/**
 * Calculates the total price of a cart.
 *
 * Each item contributes `price * quantity`, so adding multiple units of the
 * same item is counted in full. The optional discount is applied to the cart
 * total and the result is rounded to the nearest cent.
 *
 * @param items - Cart items, each with a price and a quantity.
 * @param discountPercent - Percentage discount applied to the cart total.
 * @returns The cart total, rounded to the nearest cent.
 */
export function calculateTotal(items: Item[], discountPercent = 0): number {
  let total = 0;
  for (const item of items) {
    total += item.price * item.quantity;
  }
  return round2(total * (1 - discountPercent / 100));
}