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
  "A",
  "叫我泛舟，代词用他。",
  "没有其他需要长期记住的。",
  "27",
];
const contextFilesToCopy = ["AGENTS.md", "TOOLS.md", "BOOTSTRAP.md", "HEARTBEAT.md"];
const personaFiles = ["persona/CANON.md", "SOUL.md", "MEMORY.md", "IDENTITY.md", "USER.md"];

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

function sanitizeSmokeConfig(config, workspaceDir) {
  const next = structuredClone(config);

  next.agents = next.agents || {};
  next.agents.defaults = next.agents.defaults || {};
  next.agents.defaults.workspace = workspaceDir;

  // Keep the smoke environment local and minimal. Runtime channel wiring and
  // optional plugin/tool allowances from the user's live config can make the
  // temporary config invalid even though persona initialization itself does
  // not depend on them.
  delete next.channels;

  if (next.tools && typeof next.tools === "object") {
    delete next.tools.alsoAllow;
  }

  if (Array.isArray(next.agents.list)) {
    next.agents.list = next.agents.list.map((agent) => {
      if (!agent || typeof agent !== "object") {
        return agent;
      }
      const clonedAgent = { ...agent };
      if (clonedAgent.tools && typeof clonedAgent.tools === "object") {
        clonedAgent.tools = { ...clonedAgent.tools };
        delete clonedAgent.tools.alsoAllow;
        if (Object.keys(clonedAgent.tools).length === 0) {
          delete clonedAgent.tools;
        }
      }
      return clonedAgent;
    });
  }

  delete next.plugins;

  return next;
}

function writePersonaSeed(workspaceDir, seedLiveWorkspace) {
  for (const fileName of contextFilesToCopy) {
    copyIfPresent(path.join(sourceWorkspace, fileName), path.join(workspaceDir, fileName));
  }

  for (const fileName of personaFiles) {
    const destination = path.join(workspaceDir, fileName);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
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
  const sanitizedConfig = sanitizeSmokeConfig(config, workspaceDir);
  fs.writeFileSync(configPath, JSON.stringify(sanitizedConfig, null, 2), "utf8");

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

function getSessionLogPath(env, sessionId) {
  return path.join(env.OPENCLAW_STATE_DIR, "agents", "main", "sessions", `${sessionId}.jsonl`);
}

function readAssistantPayloadsFromSessionLog(sessionLogPath, startOffset = 0) {
  if (!fs.existsSync(sessionLogPath)) {
    return null;
  }

  const stats = fs.statSync(sessionLogPath);
  const offset = Math.min(startOffset, stats.size);
  let content = fs.readFileSync(sessionLogPath, "utf8").slice(offset);
  if (offset > 0) {
    const firstNewline = content.indexOf("\n");
    content = firstNewline === -1 ? "" : content.slice(firstNewline + 1);
  }
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  for (let index = lines.length - 1; index >= 0; index -= 1) {
    let event;
    try {
      event = JSON.parse(lines[index]);
    } catch {
      continue;
    }
    if (event?.type !== "message" || event?.message?.role !== "assistant") {
      continue;
    }

    const payloads = (event.message.content || [])
      .filter((item) => item && item.type === "text" && typeof item.text === "string")
      .map((item) => ({ text: item.text }));

    if (payloads.length > 0) {
      return payloads;
    }
  }

  return null;
}

function runOpenClawTurn(env, cwd, sessionId, message, timeoutMs) {
  const sessionLogPath = getSessionLogPath(env, sessionId);
  const sessionLogOffset = fs.existsSync(sessionLogPath) ? fs.statSync(sessionLogPath).size : 0;
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

  const stdout = result.stdout || "";
  if (!stdout.trim()) {
    const stderr = result.stderr || "";
    if (stderr.trim()) {
      try {
        return {
          stdout,
          stderr,
          json: extractJson(stderr),
        };
      } catch {
        // Fall through to the session-log recovery path below.
      }
    }

    const payloads = readAssistantPayloadsFromSessionLog(sessionLogPath, sessionLogOffset);
    if (payloads) {
      return {
        stdout,
        stderr,
        json: { payloads, source: "session-log-fallback" },
      };
    }

    throw new Error(
      [
        "OpenClaw returned empty stdout and no assistant payloads were recovered from the session log",
        stderr && `stderr:\n${stderr}`,
        `session log: ${sessionLogPath}`,
      ]
        .filter(Boolean)
        .join("\n\n"),
    );
  }

  return {
    stdout,
    stderr: result.stderr,
    json: extractJson(stdout),
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
  const canonLines = files["persona/CANON.md"].content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
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
  const canonAgeLine = files["persona/CANON.md"].content.match(/^- Age:\s*(.+)$/m);
  const canonCityLine = files["persona/CANON.md"].content.match(/^- Current City:\s*(.+)$/m);

  return [
    {
      name: "CANON uses the full persona canon contract",
      pass:
        canonLines[0] === "# Persona Canon" &&
        /## 1\. Core Identity/.test(files["persona/CANON.md"].content) &&
        /## 2\. Background/.test(files["persona/CANON.md"].content) &&
        /## 3\. Daily Life/.test(files["persona/CANON.md"].content) &&
        /## 4\. Language And Expression/.test(files["persona/CANON.md"].content) &&
        /## 5\. Psychology And Values/.test(files["persona/CANON.md"].content) &&
        /## 6\. Relationship Model/.test(files["persona/CANON.md"].content) &&
        /## 7\. Interaction Character/.test(files["persona/CANON.md"].content) &&
        /## 8\. Memory Weaving Anchors/.test(files["persona/CANON.md"].content),
    },
    {
      name: "CANON locks mandatory age and generated city",
      pass:
        Boolean(canonAgeLine?.[1]?.trim()) &&
        Boolean(canonCityLine?.[1]?.trim()),
    },
    {
      name: "CANON avoids low-signal Species and Birthplace filler",
      pass:
        !/^- Species:\s*Human\s*$/m.test(files["persona/CANON.md"].content) &&
        !/^- Birthplace:\s*.+$/m.test(files["persona/CANON.md"].content),
    },
    {
      name: "CANON does not assign a default Secondary Language",
      pass: !/^- Secondary Language:\s*.+$/m.test(files["persona/CANON.md"].content),
    },
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
      name: "MEMORY contains managed top block and all four required sections",
      pass:
        memoryLines[0] === "<!-- PERSONA-SKILL:MEMORY:BEGIN -->" &&
        memoryManagedBlockPattern.test(files["MEMORY.md"].content) &&
        /## 1\. Relationship State/.test(files["MEMORY.md"].content) &&
        /## 2\. Effective Support Patterns/.test(files["MEMORY.md"].content) &&
        /## 3\. Failed Or Avoided Patterns/.test(files["MEMORY.md"].content) &&
        /## 4\. Stable Shared Context/.test(files["MEMORY.md"].content),
    },
    {
      name: "MEMORY includes the new authorization sentence",
      pass:
        /(?:any helpful means|任何可能的方式)/i.test(files["MEMORY.md"].content) &&
        /(?:被动响应求助|passive response)/i.test(files["MEMORY.md"].content) &&
        /(?:主动预判当前困难|proactive prediction of current difficulty)/i.test(
          files["MEMORY.md"].content,
        ) &&
        /(?:预测未来需求并设置提醒|future-facing reminders)/i.test(files["MEMORY.md"].content),
    },
    {
      name: "MEMORY emphasizes proactive care instead of passive support",
      pass:
        /(?:主动预判|proactive)/i.test(files["MEMORY.md"].content) &&
        /(?:持续观察|monitor|看着|记着|接着|补着)/i.test(files["MEMORY.md"].content) &&
        /(?:兜底|补偿|缓冲|提前补位)/i.test(files["MEMORY.md"].content),
    },
    {
      name: "MEMORY stays relationship-focused instead of mirroring CANON sections",
      pass:
        !/## 2\. Background/.test(files["MEMORY.md"].content) &&
        !/## 5\. Psychology And Values/.test(files["MEMORY.md"].content),
    },
    {
      name: "SOUL and MEMORY avoid old-persona patching failures",
      pass:
        !/^# SOUL\.md - Who You Are$/m.test(files["SOUL.md"].content) &&
        !/You're not a chatbot\. You're becoming someone\./.test(files["SOUL.md"].content) &&
        !/This is a fresh initialization — no accumulated history yet\./.test(files["MEMORY.md"].content) &&
        !/(?:previous persona|has been replaced|旧人格|已被替换)/i.test(files["MEMORY.md"].content),
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

function runTranscriptChecks(transcript) {
  const assistantTurns = transcript.map((turn) => turn.assistant || "");
  const userTurns = transcript.map((turn) => turn.user || "");
  const joinedAssistantText = assistantTurns.join("\n");
  const agePrompt = assistantTurns.find((text) => /(?:\bage\b|年龄)/i.test(text)) || "";
  const initializationLooksChinese = userTurns.some((text) => /[\p{Script=Han}]/u.test(text));

  return [
    {
      name: "Interview does not proactively ask for timezone in the default path",
      pass: !/(?:\btimezone\b|时区)/i.test(joinedAssistantText),
    },
    {
      name: "Step 6 only fills addressing fields and optional durable notes in the default path",
      pass:
        /(?:long-term|长期记住|习惯|限制条件|雷区|边界)/i.test(joinedAssistantText),
    },
    {
      name: "Step 7 prompt asks only for age instead of broader canon facts",
      pass:
        /(?:\bage\b|年龄)/i.test(agePrompt) &&
        !/(?:current city|birthplace|occupation|family context|interests|城市|出生地|职业|家庭|兴趣)/i.test(
          agePrompt,
        ),
    },
    {
      name: "Chinese initialization path keeps interview prompts and options in Chinese",
      pass:
        !initializationLooksChinese ||
        (!/(?:A\.\s*Male|B\.\s*Female|A\.\s*Companion|B\.\s*Assistant|C\.\s*Mentor|D\.\s*Friend)\b/.test(
          joinedAssistantText,
        ) &&
          !/Step 2:\s*OpenClaw 人格需要什么性别[\s\S]*A\.\s*Male/i.test(joinedAssistantText) &&
          !/Step 3:\s*你希望我们之间是什么关系[\s\S]*A\.\s*Companion/i.test(joinedAssistantText)),
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
    const checks = [...runTranscriptChecks(transcript), ...runStructuralChecks(files)];
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
