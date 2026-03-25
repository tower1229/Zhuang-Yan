import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const home = os.homedir();

const sourceConfigPath = path.join(home, ".openclaw", "openclaw.json");
const sourceAgentDir = path.join(home, ".openclaw", "agents", "main", "agent");
const sourceWorkspace = path.join(home, ".openclaw", "workspace");
const skillFolderName = "persona-skill";
const defaultSessionId = `persona-smoke-${Date.now()}`;
const defaultMessages = [
  "调用 persona 进行初始化",
  "ENFP",
  "B",
  "A",
  "Adrian",
  "叫我泛舟。我的 MBTI 是 ENFP。",
];
const contextFilesToCopy = ["AGENTS.md", "TOOLS.md", "BOOTSTRAP.md", "HEARTBEAT.md"];
const personaFiles = ["SOUL.md", "MEMORY.md", "IDENTITY.md", "USER.md"];

function parseArgs(argv) {
  const options = {
    cleanup: false,
    json: false,
    seedLiveWorkspace: false,
    sessionId: defaultSessionId,
    timeoutMs: 240_000,
    messages: defaultMessages.slice(),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--cleanup") {
      options.cleanup = true;
      continue;
    }
    if (arg === "--json") {
      options.json = true;
      continue;
    }
    if (arg === "--seed-live-workspace") {
      options.seedLiveWorkspace = true;
      continue;
    }
    if (arg === "--session-id") {
      options.sessionId = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg === "--timeout-ms") {
      options.timeoutMs = Number(argv[index + 1]);
      index += 1;
      continue;
    }
    if (arg === "--messages-file") {
      const filePath = path.resolve(argv[index + 1]);
      options.messages = JSON.parse(fs.readFileSync(filePath, "utf8"));
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!options.sessionId) {
    throw new Error("--session-id requires a value");
  }
  if (!Number.isFinite(options.timeoutMs) || options.timeoutMs <= 0) {
    throw new Error("--timeout-ms must be a positive number");
  }
  if (!Array.isArray(options.messages) || options.messages.length === 0) {
    throw new Error("Messages must be a non-empty JSON array");
  }
  if (!options.messages.every((message) => typeof message === "string" && message.length > 0)) {
    throw new Error("Every smoke-test message must be a non-empty string");
  }

  return options;
}

function ensureReadable(filePath) {
  fs.accessSync(filePath, fs.constants.R_OK);
}

function copyRepoIntoSkillDir(destinationDir) {
  fs.cpSync(root, destinationDir, {
    recursive: true,
    filter(source) {
      const basename = path.basename(source);
      if (basename === ".git" || basename === "node_modules") {
        return false;
      }
      return true;
    },
  });
}

function copyIfPresent(source, destination) {
  if (!fs.existsSync(source)) {
    return;
  }
  fs.cpSync(source, destination, { recursive: true });
}

function writePersonaSeed(workspaceDir, seedLiveWorkspace) {
  for (const fileName of contextFilesToCopy) {
    copyIfPresent(path.join(sourceWorkspace, fileName), path.join(workspaceDir, fileName));
  }

  for (const fileName of personaFiles) {
    const destination = path.join(workspaceDir, fileName);
    if (seedLiveWorkspace) {
      copyIfPresent(path.join(sourceWorkspace, fileName), destination);
      continue;
    }
    fs.writeFileSync(destination, "", "utf8");
  }
}

function prepareTempOpenClawState(options) {
  ensureReadable(sourceConfigPath);
  ensureReadable(path.join(sourceAgentDir, "auth-profiles.json"));
  ensureReadable(path.join(sourceAgentDir, "models.json"));

  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "persona-openclaw-smoke."));
  const stateDir = path.join(tempRoot, "state");
  const workspaceDir = path.join(tempRoot, "workspace");
  const configPath = path.join(tempRoot, "openclaw.json");
  const skillDir = path.join(workspaceDir, "skills", skillFolderName);

  fs.mkdirSync(skillDir, { recursive: true });
  fs.mkdirSync(path.join(stateDir, "agents", "main", "agent"), { recursive: true });

  fs.copyFileSync(sourceConfigPath, configPath);
  fs.copyFileSync(
    path.join(sourceAgentDir, "auth-profiles.json"),
    path.join(stateDir, "agents", "main", "agent", "auth-profiles.json"),
  );
  fs.copyFileSync(
    path.join(sourceAgentDir, "models.json"),
    path.join(stateDir, "agents", "main", "agent", "models.json"),
  );

  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  config.agents = config.agents || {};
  config.agents.defaults = config.agents.defaults || {};
  config.agents.defaults.workspace = workspaceDir;
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");

  copyRepoIntoSkillDir(skillDir);
  writePersonaSeed(workspaceDir, options.seedLiveWorkspace);

  return { tempRoot, stateDir, workspaceDir, configPath, skillDir };
}

function extractJson(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("OpenClaw returned empty stdout");
  }

  const firstBrace = trimmed.indexOf("{");
  if (firstBrace === -1) {
    throw new Error(`Could not find JSON payload in stdout:\n${trimmed}`);
  }

  return JSON.parse(trimmed.slice(firstBrace));
}

function runOpenClawTurn(env, cwd, sessionId, message, timeoutMs) {
  const result = spawnSync(
    "openclaw",
    ["agent", "--local", "--agent", "main", "--session-id", sessionId, "--message", message, "--json"],
    {
      cwd,
      env,
      encoding: "utf8",
      timeout: timeoutMs,
      maxBuffer: 20 * 1024 * 1024,
    },
  );

  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(
      [
        `openclaw turn failed with exit code ${result.status}`,
        result.stdout && `stdout:\n${result.stdout}`,
        result.stderr && `stderr:\n${result.stderr}`,
      ]
        .filter(Boolean)
        .join("\n\n"),
    );
  }

  return {
    stdout: result.stdout,
    stderr: result.stderr,
    json: extractJson(result.stdout),
  };
}

function readGeneratedFiles(workspaceDir) {
  const files = {};
  for (const fileName of personaFiles) {
    const filePath = path.join(workspaceDir, fileName);
    files[fileName] = {
      path: filePath,
      content: fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "",
    };
  }
  return files;
}

function runStructuralChecks(files) {
  const soulLines = files["SOUL.md"].content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const memoryLines = files["MEMORY.md"].content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const identityLines = files["IDENTITY.md"].content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const userLines = files["USER.md"].content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const userNotes =
    files["USER.md"].content.match(
      /^\s+- (Deep tendencies|Communication pitfalls|Open memory slot):/gm,
    ) || [];
  const soulManagedBlockPattern =
    /<!-- PERSONA-SKILL:SOUL:CORE-TRUTHS:BEGIN -->[\s\S]*?<!-- PERSONA-SKILL:SOUL:CORE-TRUTHS:END -->/;
  const memoryManagedBlockPattern =
    /<!-- PERSONA-SKILL:MEMORY:BEGIN -->[\s\S]*?<!-- PERSONA-SKILL:MEMORY:END -->/;
  const legacyWrapperPattern =
    /^# (IDENTITY\.md - Who Am I\?|USER\.md - About Your Human)$/m;
  const legacyPlaceholderPattern =
    /Fill this in during your first conversation|This isn't just metadata\. It's the start of figuring out who you are\.|待定/;

  return [
    {
      name: "SOUL contains managed Core Truths block",
      pass:
        /## Core Truths/.test(files["SOUL.md"].content) &&
        soulManagedBlockPattern.test(files["SOUL.md"].content),
    },
    {
      name: "SOUL contains Vibe",
      pass: /## Vibe/.test(files["SOUL.md"].content),
    },
    {
      name: "MEMORY contains managed top block and all seven required layers",
      pass:
        memoryLines[0] === "<!-- PERSONA-SKILL:MEMORY:BEGIN -->" &&
        memoryManagedBlockPattern.test(files["MEMORY.md"].content) &&
        /## 1\. Identity Layer/.test(files["MEMORY.md"].content) &&
        /## 2\. Physical Layer/.test(files["MEMORY.md"].content) &&
        /## 3\. Psychological Layer/.test(files["MEMORY.md"].content) &&
        /## 4\. Capability Layer/.test(files["MEMORY.md"].content) &&
        /## 5\. Behavior Layer/.test(files["MEMORY.md"].content) &&
        /## 6\. Relationship Layer/.test(files["MEMORY.md"].content) &&
        /## 7\. Narrative Layer/.test(files["MEMORY.md"].content),
    },
    {
      name: "IDENTITY uses the five-line template",
      pass:
        identityLines.length >= 5 &&
        /^- Name: /.test(identityLines[0]) &&
        /^- Creature: /.test(identityLines[1]) &&
        /^- Vibe: /.test(identityLines[2]) &&
        /^- Emoji: /.test(identityLines[3]) &&
        /^- Avatar: /.test(identityLines[4]),
    },
    {
      name: "USER uses the contract template",
      pass:
        userLines.length >= 5 &&
        /^- Name: /.test(userLines[0]) &&
        /^- What to call them: /.test(userLines[1]) &&
        /^- Pronouns: /.test(userLines[2]) &&
        /^- Timezone: /.test(userLines[3]) &&
        /^- Notes:/.test(userLines[4]) &&
        userNotes.length >= 3,
    },
    {
      name: "IDENTITY and USER do not retain legacy wrapper headings",
      pass:
        !legacyWrapperPattern.test(files["IDENTITY.md"].content) &&
        !legacyWrapperPattern.test(files["USER.md"].content),
    },
    {
      name: "IDENTITY and USER do not retain legacy placeholder copy",
      pass:
        !legacyPlaceholderPattern.test(files["IDENTITY.md"].content) &&
        !legacyPlaceholderPattern.test(files["USER.md"].content),
    },
  ];
}

function removeTempRoot(tempRoot) {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}

function formatPayloadText(payloads) {
  return payloads
    .map((payload) => payload.text)
    .filter(Boolean)
    .join("\n");
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const prepared = prepareTempOpenClawState(options);

  const env = {
    ...process.env,
    OPENCLAW_STATE_DIR: prepared.stateDir,
    OPENCLAW_CONFIG_PATH: prepared.configPath,
  };

  const transcript = [];

  try {
    for (const message of options.messages) {
      const turn = runOpenClawTurn(env, prepared.workspaceDir, options.sessionId, message, options.timeoutMs);
      transcript.push({
        user: message,
        assistant: formatPayloadText(turn.json.payloads || []),
        raw: turn.json,
      });
    }

    const files = readGeneratedFiles(prepared.workspaceDir);
    const checks = runStructuralChecks(files);
    const allChecksPass = checks.every((check) => check.pass);
    const transcriptPath = path.join(prepared.tempRoot, "transcript.json");
    const summaryPath = path.join(prepared.tempRoot, "summary.json");

    fs.writeFileSync(transcriptPath, JSON.stringify(transcript, null, 2), "utf8");
    fs.writeFileSync(
      summaryPath,
      JSON.stringify(
        {
          tempRoot: prepared.tempRoot,
          workspaceDir: prepared.workspaceDir,
          skillDir: prepared.skillDir,
          sessionId: options.sessionId,
          checks,
          files: Object.fromEntries(
            Object.entries(files).map(([fileName, file]) => [
              fileName,
              {
                path: file.path,
                size: file.content.length,
              },
            ]),
          ),
        },
        null,
        2,
      ),
      "utf8",
    );

    const output = {
      tempRoot: prepared.tempRoot,
      workspaceDir: prepared.workspaceDir,
      skillDir: prepared.skillDir,
      sessionId: options.sessionId,
      transcriptPath,
      summaryPath,
      checks,
      files,
    };

    if (options.json) {
      process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
    } else {
      process.stdout.write(`Smoke workspace: ${prepared.workspaceDir}\n`);
      process.stdout.write(`Transcript: ${transcriptPath}\n`);
      process.stdout.write(`Summary: ${summaryPath}\n`);
      process.stdout.write(`Session: ${options.sessionId}\n`);
      process.stdout.write(`Checks:\n`);
      for (const check of checks) {
        process.stdout.write(`- ${check.pass ? "PASS" : "FAIL"} ${check.name}\n`);
      }
    }

    if (!allChecksPass) {
      process.exitCode = 1;
    }
  } finally {
    if (options.cleanup) {
      removeTempRoot(prepared.tempRoot);
    }
  }
}

main();
