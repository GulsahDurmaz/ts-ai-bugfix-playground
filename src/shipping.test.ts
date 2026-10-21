import { test } from "node:test";
import assert from "node:assert/strict";
import { shippingCost } from "./shipping.js";

test("orders below the threshold pay shipping", () => {
  assert.equal(shippingCost(20), 4.9);
});

test("orders at the threshold ship free", () => {
  assert.equal(shippingCost(50), 0);
});

test("orders well above the threshold ship free", () => {
  assert.equal(shippingCost(120), 0);
});

test("zero order total pays shipping", () => {
  assert.equal(shippingCost(0), 4.9);
});

test("negative order total pays shipping", () => {
  assert.equal(shippingCost(-10), 4.9);
});
