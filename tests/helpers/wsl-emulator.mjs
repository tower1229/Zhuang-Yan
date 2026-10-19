import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

export function linuxPath(nativePath) {
  const absolute = path.resolve(nativePath);
  const normalized = process.platform === "win32" ? absolute.split(path.sep).join("/") : absolute;
  return `/host${normalized.startsWith("/") ? "" : "/"}${normalized}`;
}

function nativePath(value, config) {
  if (value === config.linuxHome || value.startsWith(`${config.linuxHome}/`)) {
    return path.join(config.homeDir, ...value.slice(config.linuxHome.length).split("/"));
  }
  if (!value.startsWith("/host/")) throw new Error(`Unknown emulated Linux path: ${value}`);
  let native = value.slice("/host".length);
  if (process.platform === "win32") {
    if (/^\/[A-Za-z]:\//u.test(native)) native = native.slice(1);
    native = native.split("/").join(path.sep);
  }
  return native;
}

function resolveMissing(value) {
  if (fs.existsSync(value)) return fs.realpathSync(value);
  return path.join(resolveMissing(path.dirname(value)), path.basename(value));
}

function assertTemporary(value, config) {
  const relative = path.relative(fs.realpathSync(config.temporary), resolveMissing(path.resolve(value)));
  if (relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error(`Emulator refuses to modify a path outside its fixture: ${value}`);
  }
}

export function emulateWsl(argv, config) {
  try {
    const [flag, command, ...args] = argv;
    if (flag !== "--exec") throw new Error("Expected --exec");
    if (command === config.failCommand) {
      if (command === "rsync") {
        fs.writeFileSync(path.join(nativePath(args.at(-1), config), "partial"), "incomplete transfer");
      }
      return { status: 23, stdout: "", stderr: `simulated ${command} failure` };
    }
    let stdout = "";
    if (command === "wslpath") stdout = linuxPath(args[2]);
    else if (command === "printenv") stdout = config.homeOutput ?? config.linuxHome;
    else if (command === "realpath") stdout = linuxPath(resolveMissing(nativePath(args.at(-1), config)));
    else if (command === "test") {
      if (args[1] === "-ef") {
        const left = fs.statSync(nativePath(args[0], config), { bigint: true, throwIfNoEntry: false });
        const right = fs.statSync(nativePath(args[2], config), { bigint: true, throwIfNoEntry: false });
        return { status: left && right && left.dev === right.dev && left.ino === right.ino ? 0 : 1, stdout: "", stderr: "" };
      }
      const value = nativePath(args.at(-1), config);
      const stat = fs.lstatSync(value, { throwIfNoEntry: false });
      const operator = args[0] === "!" ? args[1] : args[0];
      const condition = operator === "-L" ? Boolean(stat?.isSymbolicLink())
        : operator === "-d" ? Boolean(stat?.isDirectory()) : fs.existsSync(value);
      const pass = args[0] === "!" ? !condition : condition;
      return { status: pass ? 0 : 1, stdout: "", stderr: pass ? "" : "test condition was false" };
    } else if (command === "mkdir") {
      const target = nativePath(args.at(-1), config);
      assertTemporary(target, config);
      fs.mkdirSync(target, { recursive: true });
    } else if (command === "mktemp") {
      const template = nativePath(args.at(-1), config);
      assertTemporary(template, config);
      stdout = linuxPath(fs.mkdtempSync(template.replace(/XXXXXX$/u, "")));
    } else if (command === "rsync") {
      const source = nativePath(args.at(-2), config);
      const target = nativePath(args.at(-1), config);
      assertTemporary(target, config);
      if (config.realRsync) {
        return spawnSync("rsync", [...args.slice(0, -2), source, target], { encoding: "utf8", shell: false });
      }
      fs.cpSync(source, target, { recursive: true });
    } else if (command === "mv") {
      const source = nativePath(args.at(-2), config);
      const target = nativePath(args.at(-1), config);
      assertTemporary(source, config);
      assertTemporary(target, config);
      if (config.failInstall && path.basename(target) === "persona-skill"
        && (config.failRestore || path.basename(source) === "persona-skill")) {
        throw new Error("simulated install failure");
      }
      fs.renameSync(source, target);
    } else if (command === "rm") {
      const target = nativePath(args.at(-1), config);
      assertTemporary(target, config);
      fs.rmSync(target, { recursive: true, force: true });
    } else throw new Error(`Unsupported emulated command: ${command}`);
    return { status: 0, stdout: `${stdout}\n`, stderr: "" };
  } catch (error) {
    return { status: 1, stdout: "", stderr: error.message };
  }
}

const isDirectRun = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isDirectRun) {
  const config = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
  const result = emulateWsl(process.argv.slice(3), config);
  process.stdout.write(result.stdout || "");
  process.stderr.write(result.stderr || "");
  process.exitCode = result.status ?? 1;
}
