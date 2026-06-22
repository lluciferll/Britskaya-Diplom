import { execSync } from "node:child_process";
import fs from "node:fs";

const root = "C:/Users/tkach/Projects/gm-forge";
const run = (cmd) => execSync(cmd, { cwd: root, encoding: "utf8" }).trim();

try {
  console.log("HEAD:", run("git rev-parse HEAD"));
  console.log("status:", run("git status -sb"));
  console.log("--- page.tsx at HEAD ---");
  console.log(run("git show HEAD:src/app/page.tsx"));
  console.log("--- page.tsx at c83f8c09 ---");
  console.log(run("git show c83f8c09:src/app/page.tsx"));
  console.log("--- diff a45c557^..a45c557 --stat ---");
  console.log(run("git diff --stat a45c557^..a45c557"));
  console.log("--- working tree page.tsx ---");
  console.log(fs.readFileSync(`${root}/src/app/page.tsx`, "utf8"));
} catch (e) {
  console.error(String(e.stdout || e.message));
  process.exit(1);
}
