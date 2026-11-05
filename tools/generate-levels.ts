import { generateAll } from "../assets/scripts/core/generate";
import { validateLevel } from "../assets/scripts/core/validate";

/**
 * 关卡只有一份：assets/scripts/core/generate.ts。
 * 运行时调用 generateAll()，不再把同一份数据写进 level-pack.ts 和 resources/levels。
 */
const levels = generateAll();
const seen = new Map<string, number>();
let failed = false;
for (const level of levels) {
  const checked = validateLevel(level);
  if (!checked.ok) {
    console.error(`level ${level.id} invalid: ${checked.errors.join(",")}`);
    failed = true;
  }
  const body = JSON.stringify({ lines: level.lines, arrows: level.arrows, solution: level.solution });
  const previous = seen.get(body);
  if (previous != null) {
    console.error(`level ${level.id} duplicates level ${previous}`);
    failed = true;
  } else {
    seen.set(body, level.id);
  }
}
if (failed) process.exit(1);
console.log(`${levels.length} levels ok. Source is generate.ts; no level-pack or JSON copy is written.`);
