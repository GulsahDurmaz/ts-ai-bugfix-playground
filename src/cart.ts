export interface Item {
  name: string;
  price: number;
  quantity: number;
}

/**
 * Rounds a monetary value to the nearest cent, using "half away from zero"
 * (so 6.695 becomes 6.70 and -6.695 becomes -6.70).
 *
 * The scaled value is normalised with `toPrecision` first so that binary
 * floating-point artefacts (e.g. `6.695 * 100 === 669.4999999999999`) do not
 * drag a value down to the previous cent.
 */
function round2(value: number): number {
  const scaled = Number((value * 100).toPrecision(12));
  return (Math.sign(scaled) * Math.round(Math.abs(scaled))) / 100;
}

export function calculateTotal(items: Item[], discountPercent = 0): number {
  let total = 0;
  for (const item of items) {
    total += item.price * item.quantity;
  }
  return round2(total * (1 - discountPercent / 100));
}
