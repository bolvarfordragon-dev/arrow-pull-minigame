import type { ArrowDef, Cell, Dir, Level, LineDef } from "./types";
import { LEVEL_COUNT } from "./types";
import { cellKey, dirSign, lineCells, locateArrow } from "./trace";
import { validateLevel } from "./validate";

type Blueprint = readonly [arrows: number, rows: number, columns: number, variant: number];

// 第 1–5 关手工教学。其余关卡固定筛选过的布局，不在进游戏时反复试种子。
const CAMPAIGN: readonly Blueprint[] = [
  // 6–10
  [4, 2, 1, 0], [4, 1, 2, 0], [5, 2, 2, 235], [5, 2, 2, 45], [6, 2, 2, 31],
  // 11–20
  [6, 2, 2, 115], [7, 2, 2, 736], [8, 3, 2, 155], [7, 2, 3, 12], [8, 3, 2, 1223],
  [8, 2, 3, 157], [9, 3, 2, 745], [8, 2, 3, 32], [9, 3, 3, 1697], [9, 3, 3, 303],
  // 21–30
  [9, 3, 2, 119], [10, 3, 3, 139], [10, 3, 3, 4248], [11, 3, 3, 737], [10, 2, 3, 38],
  [11, 3, 3, 767], [11, 4, 3, 170], [12, 3, 3, 155], [11, 3, 3, 21], [12, 4, 3, 1329],
  // 31–40
  [12, 3, 3, 154], [13, 4, 3, 5256], [13, 3, 4, 12352], [12, 3, 3, 389], [13, 4, 3, 189],
  [14, 3, 4, 5266], [14, 4, 3, 10682], [13, 3, 3, 825], [14, 4, 4, 821], [15, 4, 4, 7150],
  // 41–50
  [14, 4, 3, 73], [15, 3, 4, 12981], [15, 4, 4, 1050], [16, 4, 4, 1289], [15, 4, 3, 701],
  [16, 4, 4, 2687], [16, 4, 4, 1581], [17, 4, 4, 380], [16, 4, 4, 287], [17, 4, 4, 20169],
  // 51–60
  [16, 4, 4, 103], [17, 4, 4, 4659], [18, 4, 5, 7679], [17, 4, 4, 624], [18, 5, 4, 526],
  [18, 4, 5, 27669], [19, 5, 4, 82909], [18, 4, 4, 384], [19, 4, 5, 9903], [20, 5, 4, 134666],
];

function rail(axis: LineDef["axis"], fixed: number, start: number, end: number, exitStart: boolean, exitEnd: boolean): LineDef {
  return { axis, fixed, start, end, exitStart, exitEnd };
}

function fromPlacements(id: number, lines: LineDef[], placements: readonly (readonly [number, number, Dir])[]): Level {
  const arrows = placements.map(([x, y, dir], i) => ({ id: `a${i + 1}`, x, y, dir }));
  return { id, lines, arrows, solution: arrows.map(arrow => arrow.id) };
}

function tutorial(id: number): Level | null {
  switch (id) {
    case 1:
      return fromPlacements(id, [rail("H", 0, 0, 3, false, true)], [[1, 0, "E"]]);
    case 2:
      return fromPlacements(id, [rail("H", 0, 0, 4, false, true)], [[2, 0, "E"], [0, 0, "E"]]);
    case 3:
      // 同一条轨道可以有两个出口，读箭头自己的方向。
      return fromPlacements(id, [rail("V", 0, 0, 5, true, true)], [[0, 4, "N"], [0, 1, "S"]]);
    case 4:
      return fromPlacements(id, [
        rail("H", 2, 0, 5, false, true), rail("V", 2, 0, 3, false, true),
      ], [[2, 2, "E"], [2, 1, "N"]]);
    case 5:
      // 拔掉交叉点上的横箭，横、竖两支同时解锁。
      return fromPlacements(id, [
        rail("H", 2, 0, 6, false, true), rail("V", 3, 0, 5, false, true),
      ], [[3, 2, "E"], [1, 2, "E"], [3, 1, "N"]]);
    default:
      return null;
  }
}

function blueprintFor(id: number): Blueprint {
  const blueprint = CAMPAIGN[id - 6];
  if (!blueprint) throw new Error(`bad level ${id}`);
  return blueprint;
}

export function arrowCountForLevel(id: number): number {
  return tutorial(id)?.arrows.length ?? blueprintFor(id)[0];
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

function buildRails(rows: number, cols: number, random: () => number): LineDef[] {
  const width = Math.max(7, cols + 5);
  const height = Math.max(7, rows + 5);
  function parallel(axis: LineDef["axis"], count: number, length: number, across: number): LineDef[] {
    return Array.from({ length: count }, (_, i) => {
      const fixed = Math.round(((i + 1) * (across - 1)) / (count + 1));
      const start = Math.floor(random() * 3);
      const end = length - 1 - Math.floor(random() * 3);
      const exits = random();
      return rail(axis, fixed, start, end, exits < 0.67, exits >= 0.33);
    });
  }
  return [...parallel("H", rows, width, height), ...parallel("V", cols, height, width)];
}

interface Candidate {
  cell: Cell;
  key: string;
  dir: Dir;
  railIndex: number;
  path: readonly string[];
}

function candidatesOn(lines: LineDef[]): Candidate[] {
  return lines.flatMap((line, railIndex) => {
    const cells = lineCells(line);
    const keys = cells.map(cell => cellKey(cell.x, cell.y));
    return cells.flatMap((cell, i) => {
      const key = keys[i];
      const candidates: Candidate[] = [];
      if (line.exitStart && i > 0) {
        candidates.push({ cell, key, dir: line.axis === "H" ? "W" : "S", railIndex, path: keys.slice(0, i) });
      }
      if (line.exitEnd && i < cells.length - 1) {
        candidates.push({ cell, key, dir: line.axis === "H" ? "E" : "N", railIndex, path: keys.slice(i + 1) });
      }
      return candidates;
    });
  });
}

function trimRails(level: Level): LineDef[] {
  const riders = new Map<LineDef, ArrowDef[]>();
  for (const arrow of level.arrows) {
    const line = locateArrow(level, arrow)?.line;
    if (!line) throw new Error(`off-rail arrow in level ${level.id}: ${arrow.id}`);
    const onLine = riders.get(line) ?? [];
    onLine.push(arrow);
    riders.set(line, onLine);
  }
  return level.lines.map(line => {
    const arrows = riders.get(line);
    if (!arrows) throw new Error(`unused rail in level ${level.id}`);
    const positions = arrows.map(arrow => line.axis === "H" ? arrow.x : arrow.y);
    const exitStart = arrows.some(arrow => dirSign(arrow.dir) < 0);
    const exitEnd = arrows.some(arrow => dirSign(arrow.dir) > 0);
    const start = exitStart ? line.start : Math.max(line.start, Math.min(...positions) - 1);
    const end = exitEnd ? line.end : Math.min(line.end, Math.max(...positions) + 1);
    return { ...line, start, end, exitStart, exitEnd };
  });
}

function assemble(id: number, [count, rows, cols, variant]: Blueprint): Level | null {
  const random = mulberry32(id * 1009 + variant * 9176);
  const lines = buildRails(rows, cols, random);
  const candidates = candidatesOn(lines);
  const occupied = new Set<string>();
  const used = new Set<number>();
  const tailDepth = new Map<string, number>();
  const placed: Candidate[] = [];

  // 从最后一支倒放。每支新箭都会挡住已放好的某支，形成相连的阻挡网。
  while (placed.length < count) {
    const mustFillRail = count - placed.length === lines.length - used.size;
    const choices: { candidate: Candidate; weight: number; depth: number }[] = [];
    let total = 0;
    for (const candidate of candidates) {
      const onUsedRail = used.has(candidate.railIndex);
      if (mustFillRail && onUsedRail) continue;
      if (occupied.has(candidate.key) || candidate.path.some(key => occupied.has(key))) continue;
      const blockedDepth = tailDepth.get(candidate.key) ?? 0;
      if (placed.length && !blockedDepth) continue;
      const weight = (onUsedRail ? 2 : 7) + Math.min(6, blockedDepth);
      choices.push({ candidate, weight, depth: blockedDepth + 1 });
      total += weight;
    }
    if (!choices.length) return null;

    let ticket = random() * total;
    const pick = choices.find(choice => (ticket -= choice.weight) < 0) ?? choices[choices.length - 1];
    const { candidate, depth } = pick;
    placed.push(candidate);
    occupied.add(candidate.key);
    used.add(candidate.railIndex);
    for (const key of candidate.path) {
      tailDepth.set(key, Math.max(depth, tailDepth.get(key) ?? 0));
    }
  }

  const placements = placed.reverse().map(({ cell, dir }) => [cell.x, cell.y, dir] as const);
  const level = fromPlacements(id, lines, placements);
  level.lines = trimRails(level);
  return level;
}

export function generateLevel(id: number): Level {
  const level = tutorial(id) ?? assemble(id, blueprintFor(id));
  if (!level) throw new Error(`could not assemble level ${id}`);
  const checked = validateLevel(level);
  if (!checked.ok) throw new Error(`level ${id}: ${checked.errors.join(",")}`);
  return level;
}

export function generateAll(): Level[] {
  return Array.from({ length: LEVEL_COUNT }, (_, i) => generateLevel(i + 1));
}
