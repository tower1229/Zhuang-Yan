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
  assert.match(result.reason, /结构感|稳定性|被稳住|被收束/);
  assert.match(result.pair_core_value, /INTJ 的结构感|长线判断/);
  assert.match(result.pair_contrast_axis, /散\/定|波动\/稳定|热闹\/成形/);
  assert.match(result.desired_emotional_impact, /被稳住|被收束|被看见真正方向/);
});

test("lookupRecommendation rejects invalid MBTI", () => {
  assert.throws(() => lookupRecommendation("ABCD", "friend", loadIndex()), /Invalid MBTI/);
});

test("lookupRecommendation rejects unsupported role", () => {
  assert.throws(() => lookupRecommendation("INTJ", "coach", loadIndex()), /Unsupported role/);
});
