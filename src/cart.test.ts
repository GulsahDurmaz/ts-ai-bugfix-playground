import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateTotal, type Item } from "./cart.js";

const items: Item[] = [
  { name: "Notebook", price: 10, quantity: 2 },
  { name: "Pen", price: 5, quantity: 1 },
];

test("total of several items with quantities", () => {
  assert.equal(calculateTotal(items), 25);
});

test("total with a 10% discount", () => {
  assert.equal(calculateTotal(items, 10), 22.5);
});

test("empty cart is zero", () => {
  assert.equal(calculateTotal([]), 0);
});

test("total is rounded to the nearest cent, not down (KAN-3)", () => {
  // 9.99 with 60% off = 3.996 -> 4.00 (rounding down would give 3.99)
  assert.equal(calculateTotal([{ name: "Mug", price: 9.99, quantity: 1 }], 60), 4);
});
