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

test("total rounds to nearest cent, not down (KAN-3 regression)", () => {
  // 3 items at $1.115 each = $3.345, should round to $3.35 (nearest), not $3.34 (floor)
  const items: Item[] = [{ name: "Widget", price: 1.115, quantity: 3 }];
  assert.equal(calculateTotal(items), 3.35);
});
