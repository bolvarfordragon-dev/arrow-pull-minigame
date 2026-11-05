import type { ArrowDef, Cell, Dir, Level, LineDef } from "./types";
import { LEVEL_COUNT } from "./types";
import { cellKey, locateArrow, traceArrow } from "./trace";
import { validateLevel } from "./validate";

export function arrowCountForLevel(levelId: number): number {
  if (levelId <= 0) throw new Error(`bad level ${levelId}`);
  // 第 2 关按首局脚本放两只箭，用来教阻挡和弹回。第 1、3 关仍是一只。
  if (levelId === 1 || levelId === 3) return 1;
  if (levelId === 2) return 2;
  if (levelId <= 5) return 2;
  if (levelId <= 10) return 3;
  if (levelId <= 25) return 3 + ((levelId - 11) % 3);
  if (levelId <= 45) return 5 + ((levelId - 26) % 4);
  return 7 + ((levelId - 46) % 6);
}

function line(axis: LineDef["axis"], fixed: number, start: number, end: number, exitStart: boolean, exitEnd: boolean): LineDef {
  return { axis, fixed, start, end, exitStart, exitEnd: exitEnd || !exitStart };
}

function handcrafted(levelId: number): Level | null {
  switch (levelId) {
    case 1:
      return {
        id: 1,
        lines: [line("H", 0, 0, 3, false, true)],
        arrows: [{ id: "a1", x: 1, y: 0, dir: "E" }],
        solution: ["a1"],
      };
    case 2:
      return {
        id: 2,
        lines: [line("H", 0, 0, 4, false, true)],
        arrows: [
          { id: "a1", x: 2, y: 0, dir: "E" },
          { id: "a2", x: 0, y: 0, dir: "E" },
        ],
        solution: ["a1", "a2"],
      };
    case 3:
      return {
        id: 3,
        lines: [line("V", 1, 0, 3, false, true)],
        arrows: [{ id: "a1", x: 1, y: 1, dir: "N" }],
        solution: ["a1"],
      };
    case 4:
      return {
        id: 4,
        lines: [line("V", 0, 0, 4, false, true)],
        arrows: [
          { id: "a1", x: 0, y: 3, dir: "N" },
          { id: "a2", x: 0, y: 1, dir: "N" },
        ],
        solution: ["a1", "a2"],
      };
    case 5:
      return {
        id: 5,
        lines: [line("H", 1, 0, 4, false, true), line("V", 2, 0, 4, false, true)],
        arrows: [
          { id: "a1", x: 2, y: 1, dir: "E" },
          { id: "a2", x: 2, y: 0, dir: "N" },
        ],
        solution: ["a1", "a2"],
      };
    case 6:
      return {
        id: 6,
        lines: [line("H", 0, 0, 6, false, true)],
        arrows: [
          { id: "a1", x: 5, y: 0, dir: "E" },
          { id: "a2", x: 3, y: 0, dir: "E" },
          { id: "a3", x: 1, y: 0, dir: "E" },
        ],
        solution: ["a1", "a2", "a3"],
      };
    case 7:
      return {
        id: 7,
        lines: [line("H", 0, 0, 6, false, true), line("V", 4, 0, 4, true, true)],
        arrows: [
          { id: "a1", x: 4, y: 0, dir: "E" },
          { id: "a2", x: 2, y: 0, dir: "E" },
          { id: "a3", x: 4, y: 3, dir: "S" },
        ],
        solution: ["a1", "a2", "a3"],
      };
    case 8:
      return {
        id: 8,
        lines: [line("H", 1, 0, 7, false, true), line("V", 5, 0, 4, true, false)],
        arrows: [
          { id: "a1", x: 5, y: 1, dir: "E" },
          { id: "a2", x: 2, y: 1, dir: "E" },
          { id: "a3", x: 5, y: 4, dir: "S" },
        ],
        solution: ["a1", "a2", "a3"],
      };
    case 9:
      return {
        id: 9,
        lines: [line("H", 0, 0, 5, true, true), line("H", 2, 0, 5, false, true)],
        arrows: [
          { id: "a1", x: 1, y: 0, dir: "W" },
          { id: "a2", x: 4, y: 0, dir: "E" },
          { id: "a3", x: 2, y: 0, dir: "E" },
        ],
        solution: ["a2", "a3", "a1"],
      };
    case 10:
      return {
        id: 10,
        lines: [line("H", 0, 0, 6, false, true)],
        arrows: [
          { id: "a1", x: 5, y: 0, dir: "E" },
          { id: "a2", x: 3, y: 0, dir: "E" },
          { id: "a3", x: 1, y: 0, dir: "E" },
        ],
        solution: ["a1", "a2", "a3"],
      };
    default:
      return null;
  }
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Candidate {
  x: number;
  y: number;
  dir: Dir;
  ray: Cell[];
}

function dirOf(axis: LineDef["axis"], sign: 1 | -1): Dir {
  if (axis === "H") return sign > 0 ? "E" : "W";
  return sign > 0 ? "N" : "S";
}

function candidatesOn(lines: LineDef[], occupied: Set<string>): Candidate[] {
  const level: Level = { id: 0, lines, arrows: [], solution: [] };
  const found: Candidate[] = [];
  for (const lineDef of lines) {
    const lo = lineDef.start;
    const hi = lineDef.end;
    const coords: Cell[] = [];
    if (lineDef.axis === "H") {
      for (let x = lo; x <= hi; x++) coords.push({ x, y: lineDef.fixed });
    } else {
      for (let y = lo; y <= hi; y++) coords.push({ x: lineDef.fixed, y });
    }
    for (const sign of [1, -1] as const) {
      const open = sign < 0 ? lineDef.exitStart : lineDef.exitEnd;
      if (!open) continue;
      for (let index = 0; index < coords.length; index++) {
        const cell = coords[index];
        if (occupied.has(cellKey(cell.x, cell.y))) continue;
        const ray: Cell[] = [];
        let blocked = false;
        for (let i = index + sign; i >= 0 && i < coords.length; i += sign) {
          const step = coords[i];
          if (occupied.has(cellKey(step.x, step.y))) {
            blocked = true;
            break;
          }
          ray.push(step);
        }
        if (blocked) continue;
        const dir = dirOf(lineDef.axis, sign);
        const arrow: ArrowDef = { id: "_", x: cell.x, y: cell.y, dir };
        if (!locateArrow(level, arrow)) continue;
        found.push({ x: cell.x, y: cell.y, dir, ray });
      }
    }
  }
  return found;
}

function place(lines: LineDef[], count: number, rng: () => number): Level | null {
  const occupied = new Set<string>();
  const placed: ArrowDef[] = [];
  const rays = new Map<string, Cell[]>();
  for (let n = count; n >= 1; n--) {
    let pool = candidatesOn(lines, occupied);
    if (pool.length === 0) return null;
    if (placed.length === 0) {
      const long = pool.filter((c) => c.ray.length >= 1);
      if (long.length === 0) return null;
      const max = Math.max(...long.map((c) => c.ray.length));
      pool = long.filter((c) => c.ray.length >= max - 1);
    } else {
      const blocking = pool.filter((c) =>
        placed.some((arrow) => rays.get(arrow.id)?.some((cell) => cell.x === c.x && cell.y === c.y)),
      );
      if (blocking.length === 0) return null;
      pool = blocking;
    }
    const choice = pool[Math.floor(rng() * pool.length)];
    const id = `a${n}`;
    placed.push({ id, x: choice.x, y: choice.y, dir: choice.dir });
    rays.set(id, choice.ray);
    occupied.add(cellKey(choice.x, choice.y));
  }
  const arrows = placed.slice().sort((a, b) => Number(a.id.slice(1)) - Number(b.id.slice(1)));
  const solution = arrows.map((a) => a.id);
  return { id: 0, lines, arrows, solution };
}

function buildLines(levelId: number, attempt: number): LineDef[] {
  const rng = mulberry32(levelId * 1000 + attempt * 17 + 3);
  const tier = levelId <= 25 ? 1 : levelId <= 45 ? 2 : 3;
  const rows = tier === 1 ? 2 : tier === 2 ? 3 : 3 + (attempt % 2);
  const cols = tier === 1 ? 1 + (levelId % 2) : tier === 2 ? 2 : 2 + (levelId % 2);
  const hLen = 5 + tier + (levelId % 3) + (attempt % 3);
  const lines: LineDef[] = [];
  for (let r = 0; r < rows; r++) {
    const exitStart = rng() > 0.62;
    lines.push(line("H", r * 2, 0, hLen - 1, exitStart, true));
  }
  const vEnd = (rows - 1) * 2;
  for (let c = 0; c < cols; c++) {
    const x = 1 + c * 2;
    if (x >= hLen - 1) continue;
    const exitStart = rng() > 0.45;
    lines.push(line("V", x, 0, Math.max(2, vEnd), exitStart, true));
  }
  return lines;
}

function singleLine(levelId: number, count: number): Level {
  const end = count;
  const arrows: ArrowDef[] = [];
  for (let i = 1; i <= count; i++) {
    arrows.push({ id: `a${i}`, x: end - (i - 1), y: 0, dir: "E" });
  }
  return {
    id: levelId,
    lines: [line("H", 0, 0, end, false, true)],
    arrows,
    solution: arrows.map((a) => a.id),
  };
}

function hasDependency(level: Level): boolean {
  if (level.arrows.length < 2) return true;
  let exits = 0;
  for (const arrow of level.arrows) {
    if (traceArrow(level, level.arrows, arrow.id).result === "exit") exits++;
  }
  return exits >= 1 && exits < level.arrows.length;
}

export function generateLevel(levelId: number): Level {
  const handmade = handcrafted(levelId);
  if (handmade) {
    const checked = validateLevel(handmade);
    if (!checked.ok) throw new Error(`handcrafted ${levelId}: ${checked.errors.join(",")}`);
    return handmade;
  }
  const count = arrowCountForLevel(levelId);
  for (let attempt = 0; attempt < 48; attempt++) {
    const lines = buildLines(levelId, attempt);
    const rng = mulberry32(levelId * 9176 + attempt * 131 + 9);
    const placed = place(lines, count, rng);
    if (!placed) continue;
    placed.id = levelId;
    const checked = validateLevel(placed);
    if (!checked.ok) continue;
    if (!hasDependency(placed)) continue;
    const bothAxes = placed.lines.some((l) => l.axis === "H") && placed.lines.some((l) => l.axis === "V");
    if (!bothAxes) continue;
    return placed;
  }
  const fallback = singleLine(levelId, count);
  const checked = validateLevel(fallback);
  if (!checked.ok) throw new Error(`fallback ${levelId}: ${checked.errors.join(",")}`);
  return fallback;
}

export function generateAll(): Level[] {
  const levels: Level[] = [];
  for (let id = 1; id <= LEVEL_COUNT; id++) levels.push(generateLevel(id));
  return levels;
}
