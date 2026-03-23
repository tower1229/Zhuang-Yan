import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function usage(exitCode = 0) {
  const msg = `
Usage:
  node ./scripts/release-clawhub.mjs --version <semver> [--slug persona-skill] [--name "Persona Skill"] [--tag latest] [--changelog "..."]

Behavior:
  - Publishes this repo root as the ClawHub skill directory
  - Pins --workdir to the repo root to avoid cwd resolution issues
  - Uses clawhub if present, otherwise falls back to npx clawhub
`.trim();
  console.log(msg);
  process.exit(exitCode);
}

function parseArgs(argv) {
  const out = {
    version: "",
    slug: "persona-skill",
    name: "Persona Skill",
    tag: "latest",
    changelog: "Initial public release",
  };

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--version") out.version = argv[++i] ?? "";
    else if (a === "--slug") out.slug = argv[++i] ?? out.slug;
    else if (a === "--name") out.name = argv[++i] ?? out.name;
    else if (a === "--tag") out.tag = argv[++i] ?? out.tag;
    else if (a === "--changelog") out.changelog = argv[++i] ?? out.changelog;
    else if (a === "-h" || a === "--help") usage(0);
    else {
      console.error(`Unknown argument: ${a}`);
      usage(2);
    }
  }

  if (!out.version) {
    console.error("Missing required --version <semver>");
    usage(2);
  }

  return out;
}

function run(cmd, args) {
  const isWin = process.platform === "win32";
  const result = isWin
    ? spawnSync([cmd, ...args].join(" "), {
        stdio: "inherit",
        cwd: ROOT_DIR,
        shell: true,
      })
    : spawnSync(cmd, args, {
        stdio: "inherit",
        cwd: ROOT_DIR,
        shell: false,
      });

  if (result.error) throw result.error;
  if (typeof result.status === "number" && result.status !== 0) process.exit(result.status);
}

function hasCmd(cmd) {
  const isWin = process.platform === "win32";
  const result = isWin
    ? spawnSync(`${cmd} --help`, { stdio: "ignore", cwd: ROOT_DIR, shell: true })
    : spawnSync(cmd, ["--help"], { stdio: "ignore", cwd: ROOT_DIR, shell: false });
  return !result.error && result.status === 0;
}

const args = parseArgs(process.argv.slice(2));
const publishArgs = [
  "--workdir",
  ROOT_DIR,
  "publish",
  ".",
  "--slug",
  args.slug,
  "--name",
  args.name,
  "--version",
  args.version,
  "--tags",
  args.tag,
  "--changelog",
  String(args.changelog).replace(/\r?\n/g, "\\n"),
];

if (hasCmd("clawhub")) {
  run("clawhub", publishArgs);
} else {
  run("npx", ["-y", "clawhub", ...publishArgs]);
}
