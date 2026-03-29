import test from "node:test";
import assert from "node:assert/strict";

import { patchIdentityCard } from "../scripts/identity-card.mjs";

test("patchIdentityCard updates the card and basic identity fields while preserving extra content", () => {
  const existing = `- Name: Old
- Creature: old creature
- Vibe: old vibe
- Emoji: 🙂
- Avatar: /avatars/old.png
- Age: 20
- Gender: Old
- City: Old City
- Home Country: Old Country
- Home Timezone: Old/Timezone
- Language: Old Language
- MBTI: ISTJ

## Manual Notes

- Keep this custom note.
`;

  const patched = patchIdentityCard(existing, {
    name: "Iris",
    creature: "warm current",
    vibe: "bright and steady",
    emoji: "🌤️",
    avatar: "/avatars/iris.png",
    age: "27",
    gender: "Female",
    city: "Ningbo",
    homeCountry: "China",
    homeTimezone: "Asia/Shanghai",
    language: "Mandarin Chinese",
    mbti: "ENFP",
  });

  assert.match(patched, /^- Name: Iris$/m);
  assert.match(patched, /^- Creature: warm current$/m);
  assert.match(patched, /^- Vibe: bright and steady$/m);
  assert.match(patched, /^- Emoji: 🌤️$/m);
  assert.match(patched, /^- Avatar: \/avatars\/iris\.png$/m);
  assert.match(patched, /^- Age: 27$/m);
  assert.match(patched, /^- Gender: Female$/m);
  assert.match(patched, /^- City: Ningbo$/m);
  assert.match(patched, /^- Home Country: China$/m);
  assert.match(patched, /^- Home Timezone: Asia\/Shanghai$/m);
  assert.match(patched, /^- Language: Mandarin Chinese$/m);
  assert.match(patched, /^- MBTI: ENFP$/m);
  assert.match(patched, /^## Manual Notes$/m);
  assert.match(patched, /Keep this custom note\./);
});

test("patchIdentityCard fills in missing managed lines without deleting the rest of the file", () => {
  const existing = `- Name: Old
- Vibe: old vibe

Custom footer
`;

  const patched = patchIdentityCard(existing, {
    name: "Nova",
    creature: "night spark",
    vibe: "calm and bright",
    emoji: "✨",
    avatar: "/avatars/nova.png",
    age: "24",
    gender: "Female",
    city: "Hangzhou",
    homeCountry: "China",
    homeTimezone: "Asia/Shanghai",
    language: "English",
    mbti: "INFJ",
  });

  const nonEmptyLines = patched
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  assert.equal(nonEmptyLines[0], "- Name: Nova");
  assert.equal(nonEmptyLines[1], "- Creature: night spark");
  assert.equal(nonEmptyLines[2], "- Vibe: calm and bright");
  assert.equal(nonEmptyLines[3], "- Emoji: ✨");
  assert.equal(nonEmptyLines[4], "- Avatar: /avatars/nova.png");
  assert.equal(nonEmptyLines[5], "- Age: 24");
  assert.equal(nonEmptyLines[6], "- Gender: Female");
  assert.equal(nonEmptyLines[7], "- City: Hangzhou");
  assert.equal(nonEmptyLines[8], "- Home Country: China");
  assert.equal(nonEmptyLines[9], "- Home Timezone: Asia/Shanghai");
  assert.equal(nonEmptyLines[10], "- Language: English");
  assert.equal(nonEmptyLines[11], "- MBTI: INFJ");
  assert.match(patched, /Custom footer/);
});
