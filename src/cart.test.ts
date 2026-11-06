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

test("single item with quantity above 1", () => {
  const items: Item[] = [{ name: "Notebook", price: 10, quantity: 2 }];
  assert.equal(calculateTotal(items), 20);
});

test("multiple items with mixed quantities", () => {
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

test("item with quantity 0 does not contribute to the total", () => {
  const items: Item[] = [
    { name: "Notebook", price: 10, quantity: 0 },
    { name: "Pen", price: 5, quantity: 3 },
  ];
  assert.equal(calculateTotal(items), 15);
});

test("discounted total rounds to the nearest cent instead of down", () => {
  const items: Item[] = [{ name: "Notebook", price: 10, quantity: 1 }];
  assert.equal(calculateTotal(items, 33), 6.7);
});

test("discounted total rounds down when the remainder is below half a cent", () => {
  const items: Item[] = [{ name: "Mug", price: 9.99, quantity: 1 }];
  // 9.99 * 0.99 = 9.8901 -> 9.89
  assert.equal(calculateTotal(items, 1), 9.89);
});

test("discounted total rounds up when the remainder is above half a cent", () => {
  const items: Item[] = [{ name: "Mug", price: 9.97, quantity: 1 }];
  // 9.97 * 0.99 = 9.8703 -> 9.87
  assert.equal(calculateTotal(items, 1), 9.87);
});

test("exact half a cent rounds up", () => {
  const items: Item[] = [{ name: "Sticker", price: 1.01, quantity: 1 }];
  // 1.01 * 0.5 = 0.505 -> 0.51
  assert.equal(calculateTotal(items, 50), 0.51);
});

test("total without a discount is unchanged", () => {
  const items: Item[] = [{ name: "Lamp", price: 24.99, quantity: 1 }];
  assert.equal(calculateTotal(items), 24.99);
});

test("empty cart with a discount is zero", () => {
  assert.equal(calculateTotal([], 33), 0);
});