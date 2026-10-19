import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const SKILL_DIR_NAME = "persona-skill";

const MBTI_TYPES = [
  "ENFJ", "ENFP", "ENTJ", "ENTP", "ESFJ", "ESFP", "ESTJ", "ESTP",
  "INFJ", "INFP", "INTJ", "INTP", "ISFJ", "ISFP", "ISTJ", "ISTP",
];

export const RUNTIME_FILES = Object.freeze([
  "SKILL.md",
  "assets/mbti/mbti-index.json",
  "scripts/mbti-lookup.js",
  "scripts/package.json",
  "references/protocols/initialization-flow.md",
  "references/protocols/drafting-spec.md",
  "references/protocols/persona-update.md",
  "references/runtime-context/template-pack.md",
  "references/runtime-context/SOUL.template.md",
  "references/runtime-context/persona-profile-consumption-guide.md",
  ...MBTI_TYPES.map((type) => `references/mbti/${type}.md`),
]);

function validateRuntimeFiles(sourceDir) {
  for (const relativePath of RUNTIME_FILES) {
    let current = sourceDir;
    const parts = relativePath.split("/");
    for (const [index, part] of parts.entries()) {
      current = path.join(current, part);
      const stat = fs.lstatSync(current);
      const valid = index === parts.length - 1 ? stat.isFile() : stat.isDirectory();
      if (!valid) {
        throw new Error(`Runtime bundle requires regular files and directories: ${current}`);
      }
    }
  }
}

function resolveDestination(destinationDir) {
  const absolute = path.resolve(destinationDir);
  if (fs.existsSync(absolute)) return fs.realpathSync(absolute);
  const parent = path.dirname(absolute);
  return path.join(resolveDestination(parent), path.basename(absolute));
}

export function assertNonOverlappingPaths(source, destination, pathApi = path) {
  const isWithin = (parent, candidate) => {
    const relative = pathApi.relative(parent, candidate);
    return relative === "" || (!pathApi.isAbsolute(relative) && relative !== ".." && !relative.startsWith(`..${pathApi.sep}`));
  };
  if (isWithin(source, destination) || isWithin(destination, source)) {
    throw new Error("Runtime bundle source and destination must not overlap");
  }
}

function directoryIdentity(directory) {
  try {
    const stat = fs.statSync(directory, { bigint: true });
    return `${stat.dev}:${stat.ino}`;
  } catch (error) {
    if (error.code === "ENOENT" || error.code === "ENOTDIR") return undefined;
    throw error;
  }
}

function ancestorIdentities(directory) {
  const identities = new Set();
  let current = directory;
  while (true) {
    const identity = directoryIdentity(current);
    if (identity !== undefined) identities.add(identity);
    const parent = path.dirname(current);
    if (parent === current) return identities;
    current = parent;
  }
}

function assertNonOverlappingDirectories(source, destination) {
  assertNonOverlappingPaths(source, destination);
  const sourceIdentity = directoryIdentity(source);
  const destinationIdentity = directoryIdentity(destination);
  if (ancestorIdentities(destination).has(sourceIdentity)
    || (destinationIdentity !== undefined && ancestorIdentities(source).has(destinationIdentity))) {
    throw new Error("Runtime bundle source and destination must not overlap");
  }
}

export function copyRuntimeBundle(destinationDir, sourceDir = ROOT_DIR) {
  const source = fs.realpathSync(sourceDir);
  const destination = resolveDestination(destinationDir);
  assertNonOverlappingDirectories(source, destination);
  validateRuntimeFiles(source);
  fs.mkdirSync(destinationDir, { recursive: true });
  if (fs.readdirSync(destinationDir).length !== 0) {
    throw new Error(`Runtime bundle destination must be empty: ${destinationDir}`);
  }
  for (const relativePath of RUNTIME_FILES) {
    const target = path.join(destinationDir, relativePath);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(source, relativePath), target);
  }
}

export function withRuntimeBundle(callback, { sourceDir = ROOT_DIR, tempDir = os.tmpdir() } = {}) {
  const tempRoot = fs.mkdtempSync(path.join(tempDir, "persona-skill-bundle."));
  const directory = path.join(tempRoot, SKILL_DIR_NAME);
  try {
    copyRuntimeBundle(directory, sourceDir);
    return callback(directory);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

export function installRuntimeBundle(destinationDir, sourceDir = ROOT_DIR) {
  const source = fs.realpathSync(sourceDir);
  const destination = resolveDestination(destinationDir);
  assertNonOverlappingDirectories(source, destination);
  if (fs.existsSync(destinationDir) && !fs.lstatSync(destinationDir).isDirectory()) {
    throw new Error(`Skill destination must be a regular directory: ${destinationDir}`);
  }
  if (fs.existsSync(path.join(destinationDir, ".git"))) {
    throw new Error(`Refusing to replace a Git checkout at the skill destination: ${destinationDir}`);
  }
  const parent = path.dirname(path.resolve(destinationDir));
  fs.mkdirSync(parent, { recursive: true });
  const tempRoot = fs.mkdtempSync(path.join(parent, ".persona-skill-stage."));
  const bundleDir = path.join(tempRoot, SKILL_DIR_NAME);
  const backupDir = path.join(tempRoot, "previous");
  let preserveBackup = false;
  try {
    copyRuntimeBundle(bundleDir, sourceDir);
    const hadDestination = fs.existsSync(destinationDir);
    if (hadDestination) {
      preserveBackup = true;
      try {
        fs.renameSync(destinationDir, backupDir);
      } catch (error) {
        throw new Error(`${error.message}; recovery directory preserved at ${tempRoot}; previous skill may be at ${backupDir}`, { cause: error });
      }
    }
    try {
      fs.renameSync(bundleDir, destinationDir);
    } catch (error) {
      if (hadDestination) {
        try {
          fs.renameSync(backupDir, destinationDir);
          preserveBackup = false;
        } catch (restoreError) {
          preserveBackup = true;
          throw new AggregateError([error, restoreError], `Could not restore the previous skill; backup preserved at ${backupDir}`);
        }
      }
      throw error;
    }
    preserveBackup = false;
  } finally {
    if (!preserveBackup) fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

export function renderClawHubIgnore() {
  const entries = new Set();
  for (const file of RUNTIME_FILES) {
    const parts = file.split("/");
    for (let index = 1; index < parts.length; index += 1) {
      entries.add(`!/${parts.slice(0, index).join("/")}/`);
    }
    entries.add(`!/${file}`);
  }
  return `# Generated from RUNTIME_FILES in scripts/runtime-bundle.mjs.\n# Publish only the runtime bundle; all other files are excluded.\n*\n${[...entries].join("\n")}\n`;
}
