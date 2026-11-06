import { test } from "node:test";
import assert from "node:assert/strict";
import { isFreeShipping } from "./shipping.js";

test("49.99 does not ship for free", () => {
  assert.equal(isFreeShipping(49.99), false);
});

test("50 ships for free", () => {
  assert.equal(isFreeShipping(50), true);
});

test("100 ships for free", () => {
  assert.equal(isFreeShipping(100), true);
});
