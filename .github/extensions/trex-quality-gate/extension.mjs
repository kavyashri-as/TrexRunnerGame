import { joinSession } from "@github/copilot-sdk/extension";
import { exec } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { platform } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execAsync = promisify(exec);

// Repo root, resolved from .github/extensions/trex-quality-gate/extension.mjs.
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const CONFIG_PATH = path.join(REPO_ROOT, ".github", "hooks", "trex-quality-gate.json");
const config = JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));

// Runs one hook entry's platform-specific command, honoring its cwd/timeoutSec.
async function runHookCommand(hookDef, session) {
  const isWindows = platform() === "win32";
  const command = isWindows ? hookDef.powershell : hookDef.bash;
  const shellCommand = isWindows
    ? `powershell -NoProfile -Command "${command.replace(/"/g, '\\"')}"`
    : `bash -c "${command.replace(/"/g, '\\"')}"`;

  try {
    await execAsync(shellCommand, {
      cwd: path.resolve(REPO_ROOT, hookDef.cwd || "."),
      timeout: (hookDef.timeoutSec || 30) * 1000,
    });
    await session.log(`[trex-quality-gate] ran: ${command}`);
  } catch (err) {
    await session.log(`[trex-quality-gate] failed: ${command} — ${err.message}`, { level: "error" });
  }
}

async function runHookGroup(name, session) {
  for (const hookDef of config.hooks[name] || []) {
    await runHookCommand(hookDef, session);
  }
}

const session = await joinSession({
  hooks: {
    onSessionStart: async () => runHookGroup("sessionStart", session),
    onPostToolUse: async () => runHookGroup("postToolUse", session),
  },
});
