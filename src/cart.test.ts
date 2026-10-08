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

test("total is rounded to the nearest cent, not down (KAN-3)", () => {
  assert.equal(calculateTotal([{ name: "Gum", price: 0.125, quantity: 1 }]), 0.13);
  assert.equal(calculateTotal([{ name: "Tea", price: 3.336, quantity: 1 }]), 3.34);
  assert.equal(calculateTotal([{ name: "Mug", price: 3.334, quantity: 1 }]), 3.33);
});

test("empty cart is zero", () => {
  assert.equal(calculateTotal([]), 0);
});
