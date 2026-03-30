import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { loadIndex, lookupRecommendation } = require("../scripts/mbti-lookup.js");

test("lookupRecommendation returns the single-axis recommendation package", () => {
  const result = lookupRecommendation("ENFP", loadIndex());
  assert.equal(result.recommended, "INTJ");
  assert.match(result.reason, /稳定|深度|可靠感|热烈有地方安放/);
  assert.match(result.social_friction_signature, /热情|发散|太情绪化|不够深/);
  assert.match(result.core_social_need, /被认真对待|被稳定承接|真心/);
  assert.match(result.ideal_counterparty_presence, /稳定|深|清晰|不轻视/);
  assert.match(result.pair_core_value, /结构|深度|稳定判断|承接面/);
  assert.match(result.desired_emotional_impact, /被锚定|被稳稳接住|不再四散/);
  assert.deepEqual(result.base_counterparty_profile, {
    warmth_display: "medium",
    expressive_energy: "low",
    initiative_style: "responsive",
    pacing_style: "medium",
    repair_order: "clarity_first",
    stimulation_bias: "low",
  });
});

test("lookupRecommendation rejects invalid MBTI", () => {
  assert.throws(() => lookupRecommendation("ABCD", loadIndex()), /Invalid MBTI/);
});

test("reverse lookup exposes a complete social-needs package for every human MBTI", () => {
  const index = loadIndex();
  const requiredKeys = [
    "recommended",
    "reason",
    "social_friction_signature",
    "core_social_need",
    "ideal_counterparty_presence",
    "pair_core_value",
    "desired_emotional_impact",
    "base_counterparty_profile",
  ];
  const allowedEnums = {
    warmth_display: new Set(["low", "medium", "high"]),
    expressive_energy: new Set(["low", "medium", "high"]),
    initiative_style: new Set(["reserved", "responsive", "proactive"]),
    pacing_style: new Set(["slow", "medium", "fast"]),
    repair_order: new Set(["emotion_first", "clarity_first", "blend"]),
    stimulation_bias: new Set(["low", "medium", "high"]),
  };

  for (const [mbti, row] of Object.entries(index.reverse_lookup)) {
    if (mbti === "_description") continue;
    for (const key of requiredKeys) {
      if (key === "base_counterparty_profile") {
        assert.equal(typeof row[key], "object", `${mbti}.${key} should be an object`);
        for (const [field, values] of Object.entries(allowedEnums)) {
          assert.equal(typeof row[key][field], "string", `${mbti}.${key}.${field} should be a string`);
          assert.equal(values.has(row[key][field]), true, `${mbti}.${key}.${field} is invalid: ${row[key][field]}`);
        }
      } else {
        assert.equal(typeof row[key], "string", `${mbti}.${key} should be a string`);
        const minLength = key === "recommended" ? 4 : 18;
        assert.ok(row[key].length >= minLength, `${mbti}.${key} is too short: ${row[key]}`);
      }
    }
  }
});

test("representative pairings expose the intended social direction", () => {
  const index = loadIndex();

  assert.match(index.reverse_lookup.INTJ.core_social_need, /被真正理解|深度欣赏|热烈靠近/);
  assert.match(index.reverse_lookup.INTJ.ideal_counterparty_presence, /聪明|真诚|生命力|主动靠近/);
  assert.match(index.reverse_lookup.INTJ.desired_emotional_impact, /解冻|偏爱|连接/);

  assert.match(index.reverse_lookup.ENFP.social_friction_signature, /发散|太情绪化|不够深/);
  assert.match(index.reverse_lookup.ENFP.core_social_need, /被认真对待|被稳定承接/);
  assert.match(index.reverse_lookup.ENFP.pair_core_value, /结构|深度|稳定判断/);
  assert.equal(index.reverse_lookup.ENFP.base_counterparty_profile.repair_order, "clarity_first");

  assert.match(index.reverse_lookup.ESTJ.core_social_need, /被柔化|被滋养/);
  assert.match(index.reverse_lookup.ESTJ.ideal_counterparty_presence, /细腻|温柔|不施压/);

  assert.match(index.reverse_lookup.ISTP.core_social_need, /被轻松地拉近|重新感到关系有温度/);
  assert.match(index.reverse_lookup.ISTP.desired_emotional_impact, /被唤醒|被暖到/);
});

test("INTJ lookup stays bound to the human MBTI instead of mirroring the current persona", () => {
  const result = lookupRecommendation("INTJ", loadIndex());
  assert.equal(result.human_mbti, "INTJ");
  assert.equal(result.recommended, "ENFP");
  assert.match(result.reason, /INTJ 常因直接、重实质、轻虚礼而被误读/);
});
