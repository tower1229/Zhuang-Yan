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

function main() {
  const [, , humanMbtiRaw, roleRaw] = process.argv;

  if (!humanMbtiRaw || !roleRaw) {
    printUsage();
    process.exit(1);
  }

  const humanMbti = normalizeMbti(humanMbtiRaw);
  const role = normalizeRole(roleRaw);

  if (!/^[EI][NS][FT][JP]$/.test(humanMbti)) {
    console.error(`Invalid MBTI: ${humanMbtiRaw}`);
    process.exit(1);
  }

  if (!role) {
    console.error(`Unsupported role: ${roleRaw}`);
    process.exit(1);
  }

  const indexPath = path.join(__dirname, "..", "data", "mbti", "mbti-index.json");
  const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
  const row = index.reverse_lookup?.[humanMbti]?.[role];

  if (!row) {
    console.error(`No recommendation found for ${humanMbti} x ${role}`);
    process.exit(1);
  }

  process.stdout.write(
    JSON.stringify(
      {
        human_mbti: humanMbti,
        role,
        recommended: row.recommended,
        reason: row.reason,
      },
      null,
      2
    )
  );
}

main();



