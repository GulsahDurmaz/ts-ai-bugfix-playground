// Orders of 50 or more ship for free.
export function isFreeShipping(total: number): boolean {
  return total > 50;
}
