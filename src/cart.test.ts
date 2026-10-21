import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateTotal } from "./cart.js";

test("empty cart is zero", () => {
  assert.equal(calculateTotal([]), 0);
});
