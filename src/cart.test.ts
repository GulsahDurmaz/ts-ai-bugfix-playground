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

test("rounds to nearest cent with price 19.999", () => {
  const items: Item[] = [{ name: "Item", price: 19.999, quantity: 1 }];
  assert.equal(calculateTotal(items), 20.0);
});
