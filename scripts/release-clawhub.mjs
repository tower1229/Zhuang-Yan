import fs from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PACKAGE_JSON_PATH = path.join(ROOT_DIR, "package.json");

function usage(exitCode = 0) {
  const msg = `
Usage:
  node ./scripts/release-clawhub.mjs [--slug persona-skill] [--name "Persona Skill"] [--tag latest] [--changelog "..."] [--version <semver>]

Behavior:
  - Publishes this repo root as the ClawHub skill directory
  - Reads version from package.json by default
  - Pins --workdir to the repo root to avoid cwd resolution issues
  - Uses clawhub if present, otherwise falls back to npx clawhub
`.trim();
  console.log(msg);
  process.exit(exitCode);
}

function readPackageVersion(packageJsonPath = PACKAGE_JSON_PATH) {
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  if (!pkg.version || typeof pkg.version !== "string") {
    throw new Error("package.json is missing a string version field");
  }
  return pkg.version;
}

function parseArgs(argv, options = {}) {
  const out = {
    version: options.defaultVersion ?? readPackageVersion(),
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
    console.error("Missing version value");
    usage(2);
  }

  return out;
}

function quoteWin(arg) {
  const value = String(arg);
  const escaped = value.replace(/"/g, '\\"');
  return /[ \t&()^<>|]/.test(escaped) ? `"${escaped}"` : escaped;
}

function buildCommandSpec(cmd, args, platform = process.platform) {
  if (platform === "win32") {
    return {
      command: [cmd, ...args].map(quoteWin).join(" "),
      options: {
        stdio: "inherit",
        cwd: ROOT_DIR,
        shell: true,
      },
    };
  }

  return {
    command: cmd,
    args,
    options: {
      stdio: "inherit",
      cwd: ROOT_DIR,
      shell: false,
    },
  };
}

function run(cmd, args) {
  const spec = buildCommandSpec(cmd, args);
  const result =
    spec.args === undefined
      ? spawnSync(spec.command, spec.options)
      : spawnSync(spec.command, spec.args, spec.options);

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

function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
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
}

const isDirectRun =
  process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

export { buildCommandSpec, parseArgs, quoteWin, readPackageVersion };

if (isDirectRun) {
  main();
}