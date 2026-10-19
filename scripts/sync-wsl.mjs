import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { ROOT_DIR, SKILL_DIR_NAME, assertNonOverlappingPaths, withRuntimeBundle } from "./runtime-bundle.mjs";
import { syncLocalOpenClaw } from "./sync-local-openclaw.mjs";

function runWsl(args, spawn, allowedStatuses = [0]) {
  const result = spawn("wsl.exe", ["--exec", ...args], {
    shell: false,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (result.error) {
    throw new Error(`Could not run WSL. Install WSL and make wsl.exe available: ${result.error.message}`);
  }
  if (!allowedStatuses.includes(result.status)) {
    throw new Error(`WSL ${args[0]} failed (${result.status ?? result.signal}): ${result.stderr || ""}`);
  }
  return { status: result.status, stdout: String(result.stdout || "").replace(/\r?\n$/u, "") };
}

function requireLinuxPath(value) {
  if (!value.startsWith("/") || /[\r\n\0]/u.test(value)) {
    throw new Error("WSL must return a single absolute Linux path");
  }
  return value;
}

function resolveLinuxDestination(destination, spawn) {
  let existing = destination;
  const missing = [];
  while (runWsl(["test", "-e", existing], spawn, [0, 1]).status !== 0) {
    runWsl(["test", "!", "-L", existing], spawn);
    missing.unshift(path.posix.basename(existing));
    const parent = path.posix.dirname(existing);
    if (parent === existing) throw new Error("Could not resolve the WSL destination root");
    existing = parent;
  }
  return path.posix.join(requireLinuxPath(runWsl(["realpath", existing], spawn).stdout), ...missing);
}

function inspectDestination(destination, source, spawn) {
  runWsl(["test", "!", "-L", destination], spawn);
  const canonicalPath = resolveLinuxDestination(destination, spawn);
  assertNonOverlappingPaths(source, canonicalPath, path.posix);
  for (const [directory, endpoint] of [[canonicalPath, source], [source, canonicalPath]]) {
    let current = directory;
    while (true) {
      if (runWsl(["test", endpoint, "-ef", current], spawn, [0, 1]).status === 0) {
        throw new Error("Runtime bundle source and destination must not overlap");
      }
      const parent = path.posix.dirname(current);
      if (parent === current) break;
      current = parent;
    }
  }
  const exists = runWsl(["test", "-e", canonicalPath], spawn, [0, 1]).status === 0;
  if (exists) {
    runWsl(["test", "-d", canonicalPath], spawn);
    runWsl(["test", "!", "-e", path.posix.join(canonicalPath, ".git")], spawn);
  }
  return { canonicalPath, exists };
}

export function syncWsl({ sourceDir = ROOT_DIR, platform = process.platform, spawn = spawnSync, homeDir } = {}) {
  if (platform !== "win32") return syncLocalOpenClaw({ sourceDir, homeDir });

  return withRuntimeBundle((bundleDir) => {
    const snapshot = requireLinuxPath(runWsl(["wslpath", "-a", "-u", bundleDir], spawn).stdout);
    const original = requireLinuxPath(runWsl(["wslpath", "-a", "-u", fs.realpathSync(sourceDir)], spawn).stdout);
    const source = requireLinuxPath(runWsl(["realpath", original], spawn).stdout);
    const home = requireLinuxPath(runWsl(["printenv", "HOME"], spawn).stdout);
    const requestedDestination = path.posix.join(home, ".openclaw", "workspace", "skills", SKILL_DIR_NAME);
    const { canonicalPath: destination } = inspectDestination(requestedDestination, source, spawn);
    const parent = path.posix.dirname(destination);
    runWsl(["mkdir", "-p", "--", parent], spawn);
    const tempRoot = requireLinuxPath(runWsl(["mktemp", "-d", "--", path.posix.join(parent, ".persona-skill-stage.XXXXXX")], spawn).stdout);
    if (path.posix.dirname(tempRoot) !== parent || !path.posix.basename(tempRoot).startsWith(".persona-skill-stage.")) {
      throw new Error("WSL returned an unexpected staging directory; refusing cleanup");
    }
    const staged = path.posix.join(tempRoot, SKILL_DIR_NAME);
    const backup = path.posix.join(tempRoot, "previous");
    let preserveBackup = false;
    try {
      runWsl(["mkdir", "-p", "--", staged], spawn);
      runWsl(["rsync", "-a", "--", `${snapshot}/`, `${staged}/`], spawn);
      const current = inspectDestination(requestedDestination, source, spawn);
      if (current.canonicalPath !== destination) {
        throw new Error("WSL skill destination changed during staging");
      }
      if (current.exists) {
        preserveBackup = true;
        runWsl(["mv", "-T", "--", destination, backup], spawn);
      }
      try {
        runWsl(["mv", "-T", "--", staged, destination], spawn);
      } catch (error) {
        if (current.exists) {
          try {
            runWsl(["mv", "-T", "--", backup, destination], spawn);
            preserveBackup = false;
          } catch (restoreError) {
            preserveBackup = true;
            throw new AggregateError([error, restoreError], `Could not restore the previous WSL skill; backup preserved at ${backup}`);
          }
        }
        throw error;
      }
      preserveBackup = false;
      return destination;
    } catch (error) {
      if (preserveBackup) {
        throw new Error(`${error.message}; recovery directory preserved at ${tempRoot}; previous skill backup: ${backup}`, { cause: error });
      }
      throw error;
    } finally {
      if (!preserveBackup) runWsl(["rm", "-rf", "--", tempRoot], spawn);
    }
  }, { sourceDir });
}

const isDirectRun =
  process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

if (isDirectRun) {
  try {
    console.log(`Synced ${SKILL_DIR_NAME} -> ${syncWsl()}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
