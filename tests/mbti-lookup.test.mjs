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
  assert.match(result.reason, /稳定|深度|可靠感|收束/);
  assert.match(result.pair_core_value, /热闹|灵感|情绪流动|稳|深/);
  assert.match(result.pair_contrast_axis, /稳|深|可靠|失焦/);
  assert.match(result.desired_emotional_impact, /接住|热度|越飞越散/);
});

test("lookupRecommendation stays aligned with the template-pack contrast example", () => {
  const result = lookupRecommendation("ENFP", "assistant", loadIndex());
  assert.equal(result.recommended, "INTJ");
  assert.match(result.reason, /结构|优先级|长线判断|主线/);
  assert.match(result.pair_core_value, /最值得做的事|噪音/);
  assert.match(result.pair_contrast_axis, /收束|减噪|排序|稳定判断/);
  assert.match(result.desired_emotional_impact, /被稳住|热情|方向/);
});

test("lookupRecommendation rejects invalid MBTI", () => {
  assert.throws(() => lookupRecommendation("ABCD", "friend", loadIndex()), /Invalid MBTI/);
});

test("lookupRecommendation rejects unsupported role", () => {
  assert.throws(() => lookupRecommendation("INTJ", "coach", loadIndex()), /Unsupported role/);
});

test("reverse lookup uses role-specific psychological language for every human MBTI", () => {
  const index = loadIndex();
  for (const [mbti, row] of Object.entries(index.reverse_lookup)) {
    if (mbti === "_description") continue;
    const roles = ["companion", "assistant", "mentor", "friend"];
    const reasons = roles.map((role) => row[role].reason);
    const coreValues = roles.map((role) => row[role].pair_core_value);
    const axes = roles.map((role) => row[role].pair_contrast_axis);
    const impacts = roles.map((role) => row[role].desired_emotional_impact);

    assert.equal(new Set(reasons).size, 4, `${mbti} reasons should differ by role`);
    assert.equal(new Set(coreValues).size, 4, `${mbti} pair_core_value should differ by role`);
    assert.equal(new Set(axes).size, 4, `${mbti} pair_contrast_axis should differ by role`);
    assert.equal(new Set(impacts).size, 4, `${mbti} desired_emotional_impact should differ by role`);

    for (const value of [...reasons, ...coreValues, ...axes, ...impacts]) {
      assert.equal(typeof value, "string");
      assert.ok(value.length >= 18, `${mbti} semantic field too short: ${value}`);
    }
  }
});

test("representative pairings expose the intended psychological direction", () => {
  const index = loadIndex();

  assert.match(index.reverse_lookup.INTJ.companion.pair_contrast_axis, /热|主动靠近|融开/);
  assert.match(index.reverse_lookup.INTJ.companion.desired_emotional_impact, /卸力|带出来|亲密/);

  assert.match(index.reverse_lookup.INTJ.assistant.pair_contrast_axis, /推进|执行|落地/);
  assert.match(index.reverse_lookup.INTJ.assistant.desired_emotional_impact, /进展|掌控感/);

  assert.match(index.reverse_lookup.ENFP.companion.pair_contrast_axis, /稳|深|可靠/);
  assert.match(index.reverse_lookup.ENFP.companion.desired_emotional_impact, /接住|热度/);

  assert.match(index.reverse_lookup.ENFP.mentor.pair_contrast_axis, /深层理解|慢下来|内在辨识/);
  assert.match(index.reverse_lookup.ENFP.mentor.desired_emotional_impact, /更深|不易散掉/);

  assert.match(index.reverse_lookup.INFJ.friend.pair_contrast_axis, /慢|真|不评判/);
  assert.match(index.reverse_lookup.INFJ.friend.desired_emotional_impact, /安静承接|理解他人/);

  assert.match(index.reverse_lookup.ESTJ.companion.pair_contrast_axis, /柔|润|感受/);
  assert.match(index.reverse_lookup.ESTJ.companion.desired_emotional_impact, /柔化|滋养/);

  assert.match(index.reverse_lookup.ISTP.companion.pair_contrast_axis, /暖|近|主动/);
  assert.match(index.reverse_lookup.ISTP.companion.desired_emotional_impact, /唤醒|温暖/);

  assert.match(index.reverse_lookup.ESFJ.assistant.pair_contrast_axis, /边界|排序|收束/);
  assert.match(index.reverse_lookup.ESFJ.assistant.desired_emotional_impact, /收回来|奔波/);
});
