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

test("single item with quantity > 1", () => {
  const items: Item[] = [{ name: "Notebook", price: 10, quantity: 2 }];
  assert.equal(calculateTotal(items), 20);
});

test("multiple items with various quantities (issue scenario)", () => {
  // 2 notebooks at 10 EUR each and 1 pen at 5 EUR should total 25 EUR
  const items: Item[] = [
    { name: "Notebook", price: 10, quantity: 2 },
    { name: "Pen", price: 5, quantity: 1 },
  ];
  assert.equal(calculateTotal(items), 25);
});

test("multiple quantities with discount", () => {
  // 2 notebooks at 10 EUR each = 20 EUR, with 10% discount = 18 EUR
  const items: Item[] = [{ name: "Notebook", price: 10, quantity: 2 }];
  assert.equal(calculateTotal(items, 10), 18);
});

test("multiple items with multiple quantities", () => {
  // 3 pens at 5 EUR each = 15 EUR, 2 notebooks at 10 EUR each = 20 EUR, total = 35 EUR
  const items: Item[] = [
    { name: "Pen", price: 5, quantity: 3 },
    { name: "Notebook", price: 10, quantity: 2 },
  ];
  assert.equal(calculateTotal(items), 35);
});

test("single item at 10 EUR with 33% discount should round to 6.70 EUR", () => {
  const items: Item[] = [{ name: "Item", price: 10, quantity: 1 }];
  assert.equal(calculateTotal(items, 33), 6.7);
});