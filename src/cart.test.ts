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

test("calculateTotal respects quantity greater than 1", () => {
  const items: Item[] = [
    { name: "Notebook", price: 10, quantity: 3 },
    { name: "Pen", price: 5, quantity: 2 }
  ];
  // Should be: 10*3 + 5*2 = 30 + 10 = 40
  // If quantity was capped at 1: 10*1 + 5*1 = 15 (bug)
  assert.equal(calculateTotal(items), 40);
});
