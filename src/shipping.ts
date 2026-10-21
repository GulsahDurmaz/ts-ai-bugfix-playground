export const FREE_SHIPPING_THRESHOLD = 50;
export const SHIPPING_FEE = 4.9;

export function shippingCost(orderTotal: number): number {
  return orderTotal > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}
