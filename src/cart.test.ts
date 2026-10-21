import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateTotal } from "./cart.js";

test("empty cart is zero", () => {
  assert.equal(calculateTotal([]), 0);
});

test("calculateTotal respects quantity greater than 1", () => {
  const items = [
    { name: "notebook", price: 10, quantity: 2 },
    { name: "pen", price: 5, quantity: 1 }
  ];
  assert.equal(calculateTotal(items), 25);
});

test("round2 rounds 19.999 to 20.00", () => {
  const items = [
    { name: "item", price: 19.999, quantity: 1 }
  ];
  assert.equal(calculateTotal(items), 20.00);
});
