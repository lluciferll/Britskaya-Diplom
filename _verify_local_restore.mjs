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
const PROJECT_ROOT = path.resolve(import.meta.dirname);
const CLEANUP_START_TS = 1782076063750;

const pairs = [
  ["54c7f6f9/8ojC.tsx", "src/app/page.tsx"],
  ["-3b524c61/9xMx.tsx", "src/app/login/page.tsx"],
  ["-19594188/M3rw.tsx", "src/components/home/HomeDashboard.tsx"],
  ["-3c4edc9b/vMsc.tsx", "src/app/campaigns/page.tsx"],
  ["-4abbb3e2/jjK7.tsx", "src/components/campaign/CampaignScreen.tsx"],
  ["-6ab98693/8i5x.tsx", "src/app/tools/page.tsx"],
  ["3020c0ca/GaMf.tsx", "src/app/generators/page.tsx"],
  ["-3db8c405/d0nL.tsx", "src/app/tools/encounter-builder/page.tsx"],
  ["-36d15612/FOpN.tsx", "src/app/tools/loot/page.tsx"],
  ["-6d1f58f7/19Hs.tsx", "src/app/tools/encounter/page.tsx"],
  ["-24196c31/QnGj.tsx", "src/app/tools/dice/page.tsx"],
  ["39df7d60/MIti.tsx", "src/app/generators/events/page.tsx"],
  ["3d5a3b54/ZWKr.tsx", "src/app/lore/page.tsx"],
  ["2bef5823/SJtc.tsx", "src/app/generators/shop/page.tsx"],
  ["-288fb43/TaWF.tsx", "src/app/atlas/page.tsx"],
  ["-7cbe3478/jd3D.tsx", "src/app/generators/emergency/page.tsx"],
  ["3d2c2a7d/7pwT.tsx", "src/app/reference/page.tsx"],
  ["14d53c38/WT4o.tsx", "src/app/generators/npc/page.tsx"],
  ["-3be67620/xfRR.tsx", "src/app/character-creator/page.tsx"],
  ["-38ad3885/fvbS.tsx", "src/components/session/SessionRoom.tsx"],
  ["43d50d5d/y5Wv.tsx", "src/components/maps/MapViewport.tsx"],
  ["-5130f2ff/1XAH.tsx", "src/components/campaign/campaignPanels.tsx"],
  ["6794df36/sYmv.tsx", "src/components/campaign/extended/EncounterLabPanel.tsx"],
  ["-29d1e655/OiTd.tsx", "src/components/campaign/extended/SessionPrepPanel.tsx"],
  ["1f08ee98/RGpR.tsx", "src/components/tools/DiceRoller.tsx"],
  ["7d421243/tthh.tsx", "src/components/maps/WatabouCityPanel.tsx"],
  ["-1be8d15d/jZaH.tsx", "src/components/CommandPalette.tsx"],
  ["68097afc/SuGt.tsx", "src/components/character/CharacterSheetWorkspace.tsx"],
  ["6ca0b0f5/KKm5.tsx", "src/components/maps/FaerunAtlasPanel.tsx"],
  ["-59a6db12/0whU.tsx", "src/components/campaign/CharactersPanel.tsx"],
  ["1f58170f/QrSn.tsx", "src/components/lore/LoreReferenceBrowser.tsx"],
];

const mustContain = [
  "Продолжите подготовку",
  "не привязано к конкретной партии",
  "политика задаётся в Supabase",
  "настройки — в Supabase",
  "аккаунт Supabase",
];

const lines = [];
let ok = 0;
let missingHistory = 0;
let mismatches = 0;

for (const [histRel, projRel] of pairs) {
  const histPath = path.join(HISTORY_ROOT, histRel);
  const projPath = path.join(PROJECT_ROOT, projRel);
  if (!fs.existsSync(histPath)) {
    missingHistory++;
    lines.push(`MISSING_HISTORY ${projRel}`);
    continue;
  }
  if (!fs.existsSync(projPath)) {
    mismatches++;
    lines.push(`MISSING_PROJECT ${projRel}`);
    continue;
  }
  const a = fs.readFileSync(histPath, "utf8").replace(/\r\n/g, "\n");
  const b = fs.readFileSync(projPath, "utf8").replace(/\r\n/g, "\n");
  if (a === b) {
    ok++;
    lines.push(`OK ${projRel}`);
  } else {
    mismatches++;
    lines.push(`DIFF ${projRel}`);
  }
}

lines.unshift(
  `Compared ${pairs.length} files with Cursor history before cleanup`,
  `OK=${ok} DIFF=${mismatches} MISSING_HISTORY=${missingHistory}`,
  "",
);

for (const phrase of mustContain) {
  let found = false;
  for (const [, projRel] of pairs) {
    const p = path.join(PROJECT_ROOT, projRel);
    if (fs.existsSync(p) && fs.readFileSync(p, "utf8").includes(phrase)) {
      found = true;
      break;
    }
  }
  lines.push(`${found ? "PHRASE_OK" : "PHRASE_MISSING"}: ${phrase}`);
}

const out = path.join(PROJECT_ROOT, "_local_verify_report.txt");
fs.writeFileSync(out, lines.join("\n"), "utf8");
console.log(lines.join("\n"));
