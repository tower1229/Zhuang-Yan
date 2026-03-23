import test from "node:test";
import assert from "node:assert/strict";

import { buildCommandSpec, quoteWin } from "../scripts/release-clawhub.mjs";

test("quoteWin preserves spaced arguments", () => {
  assert.equal(quoteWin("Persona Skill"), '"Persona Skill"');
});

test("buildCommandSpec quotes Windows command arguments", () => {
  const spec = buildCommandSpec("clawhub", ["publish", ".", "--name", "Persona Skill"], "win32");
  assert.equal(spec.options.shell, true);
  assert.match(spec.command, /--name "Persona Skill"/);
});

test("buildCommandSpec keeps argv array on non-Windows", () => {
  const spec = buildCommandSpec("clawhub", ["publish", ".", "--name", "Persona Skill"], "linux");
  assert.equal(spec.command, "clawhub");
  assert.deepEqual(spec.args, ["publish", ".", "--name", "Persona Skill"]);
  assert.equal(spec.options.shell, false);
});
