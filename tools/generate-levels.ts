import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateAll } from "../assets/scripts/core/generate";
import type { Level } from "../assets/scripts/core/types";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const levelDir = path.join(root, "assets/resources/levels");
const packPath = path.join(root, "assets/scripts/core/level-pack.ts");

function json(level: Level): string {
  return `${JSON.stringify(level, null, 2)}\n`;
}

const levels = generateAll();
mkdirSync(levelDir, { recursive: true });
for (const level of levels) {
  const name = `level-${String(level.id).padStart(2, "0")}.json`;
  writeFileSync(path.join(levelDir, name), json(level));
}

const pack = `import type { Level } from "./types";

/** 由 tools/generate-levels.ts 生成，与 assets/resources/levels 内容一致。 */
export const LEVEL_PACK: readonly Level[] = ${JSON.stringify(levels, null, 2)};
`;
writeFileSync(packPath, pack);
console.log(`wrote ${levels.length} levels`);
