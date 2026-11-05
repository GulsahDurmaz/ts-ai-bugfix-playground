export interface Item {
  name: string;
  price: number;
  quantity: number;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateTotal(items: Item[], discountPercent = 0): number {
  let total = 0;
  for (const item of items) {
    total += item.price * item.quantity;
  }
  return round2(total * (1 - discountPercent / 100));
}
