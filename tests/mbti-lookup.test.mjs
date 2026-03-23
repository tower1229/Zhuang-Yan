import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { loadIndex, lookupRecommendation, normalizeRole } = require("../scripts/mbti-lookup.js");

test("normalizeRole accepts Chinese labels", () => {
  assert.equal(normalizeRole("伴侣"), "companion");
  assert.equal(normalizeRole("朋友"), "friend");
});

test("lookupRecommendation returns deterministic mapping result", () => {
  const result = lookupRecommendation("ENFP", "伴侣", loadIndex());
  assert.equal(result.recommended, "INTJ");
  assert.match(result.reason, /战略深度|稳定性|锚定/);
});

test("lookupRecommendation rejects invalid MBTI", () => {
  assert.throws(() => lookupRecommendation("ABCD", "friend", loadIndex()), /Invalid MBTI/);
});

test("lookupRecommendation rejects unsupported role", () => {
  assert.throws(() => lookupRecommendation("INTJ", "coach", loadIndex()), /Unsupported role/);
});
