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

test("single item counts every unit of its quantity", () => {
  const items: Item[] = [{ name: "Notebook", price: 10, quantity: 2 }];
  assert.equal(calculateTotal(items), 20);
});

test("mixed cart sums each item times its quantity", () => {
  const items: Item[] = [
    { name: "Notebook", price: 10, quantity: 2 },
    { name: "Pen", price: 5, quantity: 1 },
  ];
  assert.equal(calculateTotal(items), 25);
});

test("quantity zero contributes nothing", () => {
  const items: Item[] = [
    { name: "Notebook", price: 10, quantity: 0 },
    { name: "Pen", price: 5, quantity: 3 },
  ];
  assert.equal(calculateTotal(items), 15);
});

test("quantities are applied before the discount", () => {
  const items: Item[] = [
    { name: "Notebook", price: 10, quantity: 2 },
    { name: "Pen", price: 5, quantity: 1 },
  ];
  assert.equal(calculateTotal(items, 10), 22.5);
});

test("total with quantities is rounded to two decimals", () => {
  const items: Item[] = [{ name: "Sticker", price: 0.333, quantity: 3 }];
  assert.equal(calculateTotal(items), 1);
});
