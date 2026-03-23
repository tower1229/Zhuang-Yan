#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROLE_MAP = {
  companion: "companion",
  partner: "companion",
  lover: "companion",
  "伴侣": "companion",
  assistant: "assistant",
  "助手": "assistant",
  mentor: "mentor",
  "导师": "mentor",
  friend: "friend",
  "朋友": "friend",
};

function printUsage() {
  console.error(
    "Usage: node scripts/mbti-lookup.js <human_mbti> <role>\n" +
      "Roles: companion|assistant|mentor|friend or 伴侣|助手|导师|朋友"
  );
}

function normalizeMbti(value) {
  return String(value || "").trim().toUpperCase();
}

function normalizeRole(value) {
  const key = String(value || "").trim().toLowerCase();
  return ROLE_MAP[key] || null;
}

function lookupRecommendation(humanMbtiRaw, roleRaw, index) {
  const humanMbti = normalizeMbti(humanMbtiRaw);
  const role = normalizeRole(roleRaw);

  if (!/^[EI][NS][FT][JP]$/.test(humanMbti)) {
    throw new Error(`Invalid MBTI: ${humanMbtiRaw}`);
  }

  if (!role) {
    throw new Error(`Unsupported role: ${roleRaw}`);
  }

  const row = index.reverse_lookup?.[humanMbti]?.[role];
  if (!row) {
    throw new Error(`No recommendation found for ${humanMbti} x ${role}`);
  }

  return {
    human_mbti: humanMbti,
    role,
    recommended: row.recommended,
    reason: row.reason,
  };
}

function loadIndex() {
  const indexPath = path.join(__dirname, "..", "data", "mbti", "mbti-index.json");
  return JSON.parse(fs.readFileSync(indexPath, "utf8"));
}

function main() {
  const [, , humanMbtiRaw, roleRaw] = process.argv;
  if (!humanMbtiRaw || !roleRaw) {
    printUsage();
    process.exit(1);
  }

  try {
    const result = lookupRecommendation(humanMbtiRaw, roleRaw, loadIndex());
    process.stdout.write(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = {
  loadIndex,
  lookupRecommendation,
  normalizeMbti,
  normalizeRole,
};

if (require.main === module) {
  main();
}
