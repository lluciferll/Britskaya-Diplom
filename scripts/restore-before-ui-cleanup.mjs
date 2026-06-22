/**
 * Restore gm-forge files from Cursor local history to state before UI text cleanup.
 * Cutoff: last history entry with timestamp < CLEANUP_START_TS
 */
import fs from "node:fs";
import path from "node:path";

const HISTORY_ROOT = path.join(
  process.env.USERPROFILE ?? "",
  "AppData",
  "Roaming",
  "Cursor",
  "User",
  "History",
);
const PROJECT_ROOT = path.resolve(import.meta.dirname, "..");
const CLEANUP_START_TS = 1782076063750;

function decodeResource(resource) {
  // file:///c%3A/Users/tkach/Projects/gm-forge/src/...
  const u = resource.replace(/^file:\/\//, "");
  return decodeURIComponent(u);
}

function collectEntries() {
  const dirs = fs.readdirSync(HISTORY_ROOT, { withFileTypes: true });
  const restores = [];

  for (const dirent of dirs) {
    if (!dirent.isDirectory()) continue;
    const entriesPath = path.join(HISTORY_ROOT, dirent.name, "entries.json");
    if (!fs.existsSync(entriesPath)) continue;
    let data;
    try {
      data = JSON.parse(fs.readFileSync(entriesPath, "utf8"));
    } catch {
      continue;
    }
    const filePath = decodeResource(data.resource ?? "");
    if (!filePath.toLowerCase().includes("projects\\gm-forge\\")) continue;

    const rel = filePath.replace(/^.*?Projects\\gm-forge\\/i, "").replace(/\//g, path.sep);
    const entries = (data.entries ?? []).filter((e) => e.timestamp < CLEANUP_START_TS);
    if (!entries.length) continue;
    entries.sort((a, b) => a.timestamp - b.timestamp);
    const pick = entries[entries.length - 1];
    const src = path.join(HISTORY_ROOT, dirent.name, pick.id);
    if (!fs.existsSync(src)) continue;
    restores.push({ rel, src, ts: pick.timestamp });
  }

  return restores;
}

const restores = collectEntries();
console.log(`Restoring ${restores.length} files...`);
for (const { rel, src, ts } of restores) {
  const dest = path.join(PROJECT_ROOT, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  console.log(`OK ${rel} (${ts})`);
}

console.log("Done. Files restored from Cursor history (before UI cleanup).");
console.log("Next: git add -A && git commit -m \"Restore UI texts before cleanup\" && git push origin main");
