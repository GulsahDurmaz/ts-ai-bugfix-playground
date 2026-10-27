import { test } from "node:test";
import assert from "node:assert/strict";
import { average } from "./stats.js";

test("average of two numbers", () => {
  assert.equal(average([2, 4]), 3);
});

test("average of one number", () => {
  assert.equal(average([5]), 5);
});

test("average of an empty list", () => {
  assert.equal(average([]), 0);
});
