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

test("discounted total rounds to the nearest cent instead of down", () => {
  const items: Item[] = [{ name: "Notebook", price: 10, quantity: 1 }];
  assert.equal(calculateTotal(items, 33), 6.7);
});

test("discounted total rounds down when the remainder is below half a cent", () => {
  const items: Item[] = [{ name: "Mug", price: 9.99, quantity: 1 }];
  // 9.99 * 0.93 = 9.2907 -> 9.29
  assert.equal(calculateTotal(items, 7), 9.29);

  const other: Item[] = [{ name: "Cable", price: 9.99, quantity: 1 }];
  // 9.99 * 0.87 = 8.6913 -> 8.69
  assert.equal(calculateTotal(other, 13), 8.69);
});

test("discounted total rounds up when the remainder is above half a cent", () => {
  const items: Item[] = [{ name: "Cable", price: 7.77, quantity: 1 }];
  // 7.77 * 0.93 = 7.2261 -> 7.23
  assert.equal(calculateTotal(items, 7), 7.23);
});

test("exact half cent rounds up", () => {
  const items: Item[] = [{ name: "Sticker", price: 2.01, quantity: 1 }];
  // 2.01 * 0.5 = 1.005 -> 1.01
  assert.equal(calculateTotal(items, 50), 1.01);
});

test("multiple items with quantities and a discount", () => {
  const items: Item[] = [
    { name: "Pen", price: 1.35, quantity: 3 },
    { name: "Notebook", price: 4.2, quantity: 2 },
  ];
  // (4.05 + 8.4) * 0.85 = 10.5825 -> 10.58
  assert.equal(calculateTotal(items, 15), 10.58);
});

test("total without a discount is unchanged", () => {
  const items: Item[] = [{ name: "Lamp", price: 24.99, quantity: 2 }];
  assert.equal(calculateTotal(items), 49.98);
});
