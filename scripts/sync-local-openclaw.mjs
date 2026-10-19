import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { ROOT_DIR, SKILL_DIR_NAME, installRuntimeBundle } from "./runtime-bundle.mjs";

export function syncLocalOpenClaw({ sourceDir = ROOT_DIR, homeDir = os.homedir() } = {}) {
  const destinationDir = path.join(homeDir, ".openclaw", "workspace", "skills", SKILL_DIR_NAME);
  installRuntimeBundle(destinationDir, sourceDir);
  return destinationDir;
}

const isDirectRun =
  process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

if (isDirectRun) {
  try {
    console.log(`Synced ${SKILL_DIR_NAME} -> ${syncLocalOpenClaw()}`);
    console.log("Start a new OpenClaw session to pick up the updated skill.");
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

