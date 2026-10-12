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

test("total rounds to nearest cent, not down (KAN-3)", () => {
  // Item with sub-cent price: 1.999 should round to 2.00, not floor to 1.99
  const subCentItem: Item[] = [{ name: "Widget", price: 1.999, quantity: 1 }];
  assert.equal(calculateTotal(subCentItem), 2.0);
});
