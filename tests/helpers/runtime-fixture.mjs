import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { ROOT_DIR } from "../../scripts/runtime-bundle.mjs";

export function listFiles(directory, prefix = "") {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    return entry.isDirectory()
      ? listFiles(path.join(directory, entry.name), relative)
      : [relative];
  }).sort();
}

export function createRuntimeFixture(t, sourceName = "source") {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "persona-runtime-test."));
  t.after(() => fs.rmSync(temporary, { recursive: true, force: true }));
  const sourceDir = path.join(temporary, sourceName);
  fs.mkdirSync(sourceDir);
  for (const file of ["SKILL.md", "package.json", "README.md", "scripts", "references", "assets"]) {
    fs.cpSync(path.join(ROOT_DIR, file), path.join(sourceDir, file), { recursive: true });
  }
  for (const file of [".env", "scripts/unlisted.mjs", "references/mbti/.env", "references/protocols/unlisted.md", "assets/mbti/unlisted.json"]) {
    fs.writeFileSync(path.join(sourceDir, file), "must not ship");
  }
  return { temporary, sourceDir };
}
