import path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { ROOT_DIR, SKILL_DIR_NAME, withRuntimeBundle } from "./runtime-bundle.mjs";
import { syncLocalOpenClaw } from "./sync-local-openclaw.mjs";

function runWsl(args, spawn) {
  const result = spawn("wsl.exe", ["--exec", ...args], {
    shell: false,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (result.error) {
    throw new Error(`Could not run WSL. Install WSL and make wsl.exe available: ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(`WSL ${args[0]} failed (${result.status ?? result.signal}): ${result.stderr || ""}`);
  }
  return String(result.stdout || "").replace(/\r?\n$/u, "");
}

function requireLinuxPath(value) {
  if (!value.startsWith("/") || /[\r\n\0]/u.test(value)) {
    throw new Error("WSL must return a single absolute Linux path");
  }
  return value;
}

export function syncWsl({ sourceDir = ROOT_DIR, platform = process.platform, spawn = spawnSync, homeDir } = {}) {
  if (platform !== "win32") return syncLocalOpenClaw({ sourceDir, homeDir });

  return withRuntimeBundle((bundleDir) => {
    const source = requireLinuxPath(runWsl(["wslpath", "-a", "-u", bundleDir], spawn));
    const home = requireLinuxPath(runWsl(["printenv", "HOME"], spawn));
    const destination = path.posix.join(home, ".openclaw", "workspace", "skills", SKILL_DIR_NAME);
    runWsl(["test", "!", "-L", destination], spawn);
    runWsl(["mkdir", "-p", "--", destination], spawn);
    runWsl(["rsync", "-a", "--delete", "--", `${source}/`, `${destination}/`], spawn);
    return destination;
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
