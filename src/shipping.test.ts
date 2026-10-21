import { test } from "node:test";
import assert from "node:assert/strict";
import { shippingCost } from "./shipping.js";

test("orders below the threshold pay shipping", () => {
  assert.equal(shippingCost(20), 4.9);
});

test("orders well above the threshold ship free", () => {
  assert.equal(shippingCost(120), 0);
});
