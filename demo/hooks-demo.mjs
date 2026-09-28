import { exec } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { platform } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execAsync = promisify(exec);
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONFIG_PATH = path.join(REPO_ROOT, ".github", "hooks", "trex-quality-gate.json");
const config = JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));

async function runHookCommand(hookDef, label) {
  const isWindows = platform() === "win32";
  const command = isWindows ? hookDef.powershell : hookDef.bash;
  const shellCommand = isWindows
    ? `powershell -NoProfile -Command "${command.replace(/"/g, '\\"')}"`
    : `bash -c "${command.replace(/"/g, '\\"')}"`;

  console.log(`\n--- [${label}] ${command}`);
  try {
    const { stdout, stderr } = await execAsync(shellCommand, {
      cwd: path.resolve(REPO_ROOT, hookDef.cwd || "."),
      timeout: (hookDef.timeoutSec || 30) * 1000,
    });
    if (stdout.trim()) console.log(stdout.trim());
    if (stderr.trim()) console.error(stderr.trim());
    console.log(`--- [${label}] OK`);
  } catch (err) {
    console.error(`--- [${label}] FAILED: ${err.message}`);
  }
}

console.log("=== Simulating onSessionStart ===");
for (const hookDef of config.hooks.sessionStart || []) {
  await runHookCommand(hookDef, "sessionStart");
}

console.log("\n=== Simulating onPostToolUse (after an edit tool call) ===");
for (const hookDef of config.hooks.postToolUse || []) {
  await runHookCommand(hookDef, "postToolUse");
}