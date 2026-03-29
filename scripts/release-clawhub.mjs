import fs from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PACKAGE_JSON_PATH = path.join(ROOT_DIR, "package.json");
const TEST_TARGET = "tests/*.mjs";

function usage(exitCode = 0) {
  const msg = `
Usage:
  node ./scripts/release-clawhub.mjs [--slug persona-skill] [--name "Persona Skill"] [--tag latest] [--changelog "..."] [--version <semver>]

Behavior:
  - Runs local tests before publishing
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
    changelog: "",
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

  if (!out.changelog) {
    out.changelog = `Release ${out.version}`;
  }

  return out;
}

function quoteWin(arg) {
  const value = String(arg);
  const escaped = value.replace(/"/g, '\\"');
  return /[ \t&()^<>|]/.test(escaped) ? `"${escaped}"` : escaped;
}

function buildCommandSpec(cmd, args, platform = process.platform, capture = false) {
  if (platform === "win32") {
    return {
      command: [cmd, ...args].map(quoteWin).join(" "),
      options: {
        stdio: capture ? "pipe" : "inherit",
        cwd: ROOT_DIR,
        shell: true,
        encoding: capture ? "utf8" : undefined,
      },
    };
  }

  return {
    command: cmd,
    args,
    options: {
      stdio: capture ? "pipe" : "inherit",
      cwd: ROOT_DIR,
      shell: false,
      encoding: capture ? "utf8" : undefined,
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

function runCapture(cmd, args) {
  const spec = buildCommandSpec(cmd, args, process.platform, true);
  const result =
    spec.args === undefined
      ? spawnSync(spec.command, spec.options)
      : spawnSync(spec.command, spec.args, spec.options);

  return {
    status: result.status ?? 1,
    error: result.error,
    stdout: typeof result.stdout === "string" ? result.stdout : "",
    stderr: typeof result.stderr === "string" ? result.stderr : "",
  };
}

function hasCmd(cmd) {
  const isWin = process.platform === "win32";
  const result = isWin
    ? spawnSync(`${cmd} --help`, { stdio: "ignore", cwd: ROOT_DIR, shell: true })
    : spawnSync(cmd, ["--help"], { stdio: "ignore", cwd: ROOT_DIR, shell: false });
  return !result.error && result.status === 0;
}

function detectPublisherBootstrapBug(output) {
  const text = String(output || "");
  return (
    text.includes("This query or mutation function ran multiple paginated queries") &&
    (text.includes("ensurePersonalPublisherForUser") ||
      text.includes("syncSkillSearchDigestsForOwnerPublisherId"))
  );
}

function printPublisherBootstrapHelp() {
  console.error("\nClawHub publish failed because the registry backend appears to have hit a personal-publisher bootstrap bug.");
  console.error("This error is coming from ClawHub/Convex while auto-creating or syncing your publisher, not from this skill bundle.");
  console.error("\nRecommended next steps:");
  console.error("1. Run `clawhub whoami` and confirm the CLI token is valid.");
  console.error("2. Sign in to ClawHub in the browser and make sure your account/publisher profile is initialized.");
  console.error("3. Retry `npm run publish:clawhub` after the publisher exists.");
  console.error("4. If it still fails, report this exact stack trace to ClawHub maintainers because it is a server-side bug.");
}

function runTests() {
  console.log("Running tests before publish...");
  run(process.execPath, ["--test", TEST_TARGET]);
}

function publish(args) {
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

  const command = hasCmd("clawhub")
    ? { cmd: "clawhub", args: publishArgs }
    : { cmd: "npx", args: ["-y", "clawhub", ...publishArgs] };

  const result = runCapture(command.cmd, command.args);

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);

  if (result.error) throw result.error;
  if (result.status !== 0) {
    const combined = `${result.stdout}\n${result.stderr}`;
    if (detectPublisherBootstrapBug(combined)) {
      printPublisherBootstrapHelp();
    }
    process.exit(result.status);
  }
}

function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  runTests();
  publish(args);
}

const isDirectRun =
  process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

export {
  TEST_TARGET,
  buildCommandSpec,
  detectPublisherBootstrapBug,
  parseArgs,
  printPublisherBootstrapHelp,
  quoteWin,
  readPackageVersion,
};

if (isDirectRun) {
  main();
}
