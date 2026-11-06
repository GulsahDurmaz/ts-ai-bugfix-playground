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
  const items: Item[] = [{ name: "Notebook", price: 10, quantity: 1 }];
  assert.equal(calculateTotal(items, 33), 6.7);
});

test("discounted total rounds down when below the half cent", () => {
  const items: Item[] = [{ name: "Mug", price: 9.99, quantity: 1 }];
  // 9.99 * 0.88 = 8.7912 -> 8.79
  assert.equal(calculateTotal(items, 12), 8.79);
});

test("discounted total rounds half a cent up", () => {
  const items: Item[] = [{ name: "Sticker", price: 0.15, quantity: 1 }];
  // 0.15 * 0.9 = 0.135 -> 0.14
  assert.equal(calculateTotal(items, 10), 0.14);
});

test("multiple items with a discount are rounded to the nearest cent", () => {
  const items: Item[] = [
    { name: "Pen", price: 2.5, quantity: 3 },
    { name: "Notebook", price: 10, quantity: 1 },
  ];
  // (7.5 + 10) * 0.85 = 14.875 -> 14.88
  assert.equal(calculateTotal(items, 15), 14.88);
});

test("undiscounted totals keep their exact cent value", () => {
  const items: Item[] = [{ name: "Cable", price: 12.34, quantity: 2 }];
  assert.equal(calculateTotal(items), 24.68);
});
