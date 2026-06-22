import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname);
const log = [];

function run(cmd) {
  const out = execSync(cmd, { cwd: root, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });
  return out.trim();
}

try {
  // 1) Restore from Cursor history (before UI cleanup)
  run("node scripts/restore-before-ui-cleanup.mjs");

  // 2) Report git state
  log.push("HEAD: " + run("git rev-parse HEAD"));
  log.push("status:\n" + run("git status -sb"));
  log.push("page at HEAD:\n" + run("git show HEAD:src/app/page.tsx"));
  log.push("page working tree:\n" + fs.readFileSync(path.join(root, "src/app/page.tsx"), "utf8"));

  // 3) Stage and commit restored files
  run("git add -A");
  const diffStat = run("git diff --cached --stat");
  log.push("staged:\n" + (diffStat || "(no staged changes)"));

  if (diffStat) {
    run('git commit -m "Restore UI texts before cleanup"');
    log.push("committed: " + run("git log -1 --oneline"));
  } else {
    log.push("No file changes to commit; creating marker commit");
    run('git commit --allow-empty -m "Restore UI texts before cleanup (marker)"');
    log.push("marker commit: " + run("git log -1 --oneline"));
  }

  log.push("DONE");
} catch (e) {
  log.push("ERROR: " + (e.stderr?.toString?.() || e.stdout?.toString?.() || e.message));
}

const outPath = path.join(root, "_restore_and_commit.log");
fs.writeFileSync(outPath, log.join("\n\n---\n\n"), "utf8");
console.log("Wrote " + outPath);
