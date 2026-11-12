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

test("discounted total rounds up to the nearest cent", () => {
  const items: Item[] = [{ name: "Mug", price: 10, quantity: 1 }];
  assert.equal(calculateTotal(items, 33), 6.7);
});

test("discounted total rounds down when below the half cent", () => {
  const items: Item[] = [{ name: "Mug", price: 10, quantity: 1 }];
  assert.equal(calculateTotal(items, 34), 6.6);
});

test("exact half cent rounds away from zero", () => {
  const items: Item[] = [{ name: "Sticker", price: 0.1339, quantity: 1 }];
  assert.equal(calculateTotal(items, 50), 0.07);
});

test("multiple items with a discount are rounded to the nearest cent", () => {
  const items: Item[] = [
    { name: "Pen", price: 1.99, quantity: 3 },
    { name: "Notebook", price: 4.49, quantity: 2 },
  ];
  // (5.97 + 8.98) = 14.95, minus 15% = 12.7075 -> 12.71
  assert.equal(calculateTotal(items, 15), 12.71);
});

test("total without a discount is unchanged", () => {
  const items: Item[] = [{ name: "Cable", price: 7.25, quantity: 2 }];
  assert.equal(calculateTotal(items), 14.5);
});
