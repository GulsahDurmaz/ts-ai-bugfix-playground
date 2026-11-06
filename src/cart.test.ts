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

test("single item with quantity above 1 counts every unit", () => {
  const items: Item[] = [{ name: "Notebook", price: 10, quantity: 2 }];
  assert.equal(calculateTotal(items), 20);
});

test("mixed cart with quantities above 1", () => {
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

test("quantity 0 contributes nothing", () => {
  const items: Item[] = [
    { name: "Notebook", price: 10, quantity: 0 },
    { name: "Pen", price: 5, quantity: 3 },
  ];
  assert.equal(calculateTotal(items), 15);
});

test("fractional prices with quantities are not distorted by float artifacts", () => {
  const items: Item[] = [{ name: "Sticker", price: 10.1, quantity: 3 }];
  assert.equal(calculateTotal(items), 30.3);
});

test("discounted total is rounded to the nearest cent, not rounded down", () => {
  const items: Item[] = [{ name: "Notebook", price: 10, quantity: 1 }];
  assert.equal(calculateTotal(items, 33), 6.7);
});

test("discounted total rounds to the nearest cent in both directions", () => {
  const items: Item[] = [{ name: "Mug", price: 9.99, quantity: 1 }];
  // 9.99 * 0.85 = 8.4915 -> 8.49 (rounds down)
  assert.equal(calculateTotal(items, 15), 8.49);

  const other: Item[] = [{ name: "Cable", price: 7.77, quantity: 1 }];
  // 7.77 * 0.93 = 7.2261 -> 7.23 (rounds up)
  assert.equal(calculateTotal(other, 7), 7.23);
});

test("totals that are already exact are unchanged", () => {
  const items: Item[] = [{ name: "Sticker", price: 1.25, quantity: 1 }];
  assert.equal(calculateTotal(items), 1.25);
  assert.equal(calculateTotal(items, 100), 0);
});