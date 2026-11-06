export interface Item {
  name: string;
  price: number;
  quantity: number;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Calculates the total price of a cart.
 *
 * Every unit of an item counts towards the total, so an item with a quantity
 * of 3 contributes three times its price.
 *
 * @param items - Cart items, each contributing `price * quantity`.
 * @param discountPercent - Optional percentage discount applied to the subtotal.
 * @returns The total price, rounded to two decimals.
 */
export function calculateTotal(items: Item[], discountPercent = 0): number {
  let total = 0;
  for (const item of items) {
    total += item.price * item.quantity;
  }
  return round2(total * (1 - discountPercent / 100));
}
