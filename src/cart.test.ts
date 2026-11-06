import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateTotal, type Item } from "./cart.js";

test("empty cart is zero", () => {
  assert.equal(calculateTotal([]), 0);
});

test("single item with quantity 1", () => {
  const items: Item[] = [{ name: "Pen", price: 5, quantity: 1 }];
  assert.equal(calculateTotal(items), 5);
});

test("single item with quantity 1 and 10% discount", () => {
  const items: Item[] = [{ name: "Notebook", price: 10, quantity: 1 }];
  assert.equal(calculateTotal(items, 10), 9);
});

test("single item with quantity above 1", () => {
  const items: Item[] = [{ name: "Notebook", price: 10, quantity: 2 }];
  assert.equal(calculateTotal(items), 20);
});

test("multiple items with mixed quantities", () => {
  const items: Item[] = [
    { name: "Notebook", price: 10, quantity: 2 },
    { name: "Pen", price: 5, quantity: 1 },
  ];
  assert.equal(calculateTotal(items), 25);
});

test("quantities above 1 with 10% discount", () => {
  const items: Item[] = [
    { name: "Notebook", price: 10, quantity: 2 },
    { name: "Pen", price: 5, quantity: 1 },
  ];
  assert.equal(calculateTotal(items, 10), 22.5);
});

test("item with quantity 0 does not contribute to the total", () => {
  const items: Item[] = [
    { name: "Notebook", price: 10, quantity: 0 },
    { name: "Pen", price: 5, quantity: 3 },
  ];
  assert.equal(calculateTotal(items), 15);
});

test("discounted total rounds to the nearest cent instead of down", () => {
  const items: Item[] = [{ name: "Notebook", price: 10, quantity: 1 }];
  assert.equal(calculateTotal(items, 33), 6.7);
});

test("discounted total rounds down when the remainder is below half a cent", () => {
  const items: Item[] = [{ name: "Mug", price: 9.99, quantity: 1 }];
  // 9.99 * 0.99 = 9.8901 -> 9.89
  assert.equal(calculateTotal(items, 1), 9.89);
});

test("discounted total rounds up when the remainder is above half a cent", () => {
  const items: Item[] = [{ name: "Mug", price: 9.43, quantity: 1 }];
  // 9.43 * 0.99 = 9.3357 -> 9.34
  assert.equal(calculateTotal(items, 1), 9.34);
});

test("exact half a cent rounds up", () => {
  const items: Item[] = [{ name: "Sticker", price: 1.01, quantity: 1 }];
  // 1.01 * 0.5 = 0.505, exactly representable as 50.5 cents -> 0.51
  assert.equal(calculateTotal(items, 50), 0.51);
});

test("half a cent that lands below the boundary in binary still rounds up", () => {
  const items: Item[] = [{ name: "Washer", price: 2.01, quantity: 1 }];
  // 2.01 * 0.5 = 1.005 exactly, but evaluates to 100.49999999999999 cents.
  // Without the ULP nudge in roundToNearestCent this would round to 1.
  assert.equal(calculateTotal(items, 50), 1.01);
});

test("total without a discount is unchanged", () => {
  const items: Item[] = [{ name: "Lamp", price: 24.99, quantity: 1 }];
  assert.equal(calculateTotal(items), 24.99);
});

test("empty cart with a discount is zero", () => {
  assert.equal(calculateTotal([], 33), 0);
});

test("negative amounts round symmetrically, away from zero", () => {
  const items: Item[] = [{ name: "Refund", price: -10, quantity: 1 }];
  // -10 * 0.67 = -6.699999999999999 -> -6.7, not -6.69
  assert.equal(calculateTotal(items, 33), -6.7);
});

test("a negative amount that rounds to zero does not return -0", () => {
  const items: Item[] = [{ name: "Rounding dust", price: -0.001, quantity: 1 }];
  assert.ok(Object.is(calculateTotal(items), 0));
});