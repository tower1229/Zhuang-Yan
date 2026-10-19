import fs from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { RUNTIME_FILES, withRuntimeBundle } from "./runtime-bundle.mjs";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PACKAGE_JSON_PATH = path.join(ROOT_DIR, "package.json");
const TEST_TARGET = "tests/*.mjs";

function usage(exitCode = 0) {
  const msg = `
Usage:
  node ./scripts/release-clawhub.mjs [--dry-run] [--slug persona-skill] [--name "Persona Skill"] [--tag latest] [--changelog "..."] [--version <semver>]

Behavior:
  - Runs local tests before publishing
  - Stages and publishes only the shared runtime file allowlist
  - --dry-run validates and lists the staged files without invoking ClawHub
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
    dryRun: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") out.dryRun = true;
    else if (a === "--version") out.version = argv[++i] ?? "";
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

function buildCommandSpec(cmd, args, capture = false) {
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
  const result = spawnSync(spec.command, spec.args, spec.options);

  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`Command failed (${result.status ?? result.signal}): ${cmd}`);
}

function resolveNpxCli({ npmExecPath = process.env.npm_execpath, execPath = process.execPath } = {}) {
  const candidates = [
    npmExecPath && path.join(path.dirname(npmExecPath), "npx-cli.js"),
    path.join(path.dirname(execPath), "node_modules", "npm", "bin", "npx-cli.js"),
    path.resolve(path.dirname(execPath), "..", "lib", "node_modules", "npm", "bin", "npx-cli.js"),
  ].filter(Boolean);
  const cli = candidates.find((candidate) => fs.existsSync(candidate));
  if (!cli) throw new Error("Could not locate npx-cli.js. Run this command through npm or install npm alongside Node.js.");
  return cli;
}

function runPublisher(args, { spawn = spawnSync, npxCli } = {}) {
  const probe = spawn("clawhub", ["--help"], { cwd: ROOT_DIR, stdio: "ignore", shell: false });
  const spec = !probe.error && probe.status === 0
    ? buildCommandSpec("clawhub", args, true)
    : buildCommandSpec(process.execPath, [npxCli ?? resolveNpxCli(), "-y", "clawhub", ...args], true);
  const result = spawn(spec.command, spec.args, spec.options);

  return {
    status: result.status ?? 1,
    error: result.error,
    stdout: typeof result.stdout === "string" ? result.stdout : "",
    stderr: typeof result.stderr === "string" ? result.stderr : "",
  };
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

function publish(args, { sourceDir = ROOT_DIR, invokePublisher = runPublisher } = {}) {
  return withRuntimeBundle((bundleDir) => {
    if (args.dryRun) return { version: args.version, files: [...RUNTIME_FILES] };
    const publishArgs = [
      "--workdir",
      ROOT_DIR,
      "publish",
      bundleDir,
      "--slug",
      args.slug,
      "--name",
      args.name,
      "--version",
      args.version,
      "--tags",
      args.tag,
      "--changelog",
      String(args.changelog),
    ];

    const result = invokePublisher(publishArgs);

    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);

    if (result.error) throw result.error;
    if (result.status !== 0) {
      const combined = `${result.stdout}\n${result.stderr}`;
      if (detectPublisherBootstrapBug(combined)) {
        printPublisherBootstrapHelp();
      }
      const error = new Error(`ClawHub publish failed (${result.status})`);
      error.exitCode = result.status;
      throw error;
    }
  }, { sourceDir });
}

function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  runTests();
  const result = publish(args);
  if (args.dryRun) console.log(JSON.stringify(result, null, 2));
}

const isDirectRun =
  process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

export {
  TEST_TARGET,
  buildCommandSpec,
  detectPublisherBootstrapBug,
  parseArgs,
  publish,
  printPublisherBootstrapHelp,
  readPackageVersion,
  resolveNpxCli,
  runPublisher,
};

if (isDirectRun) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = error.exitCode ?? 1;
  }
}
