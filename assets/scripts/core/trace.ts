import type { ArrowDef, Axis, Cell, Dir, Level, LineDef, Trace } from "./types";

export function cellKey(x: number, y: number): string {
  return `${x},${y}`;
}

export function lineCells(line: LineDef): Cell[] {
  const cells: Cell[] = [];
  const lo = Math.min(line.start, line.end);
  const hi = Math.max(line.start, line.end);
  if (line.axis === "H") {
    for (let x = lo; x <= hi; x++) cells.push({ x, y: line.fixed });
  } else {
    for (let y = lo; y <= hi; y++) cells.push({ x: line.fixed, y });
  }
  return cells;
}

export function dirAxis(dir: Dir): Axis {
  return dir === "E" || dir === "W" ? "H" : "V";
}

export function dirSign(dir: Dir): 1 | -1 {
  return dir === "E" || dir === "N" ? 1 : -1;
}

export function stepDelta(axis: Axis, sign: 1 | -1): Cell {
  if (axis === "H") return { x: sign, y: 0 };
  return { x: 0, y: sign };
}

interface Located {
  line: LineDef;
  index: number;
  sign: 1 | -1;
  cells: Cell[];
}

export function locateArrow(level: Level, arrow: ArrowDef): Located | null {
  const axis = dirAxis(arrow.dir);
  const sign = dirSign(arrow.dir);
  for (const line of level.lines) {
    if (line.axis !== axis) continue;
    const cells = lineCells(line);
    const index = cells.findIndex((c) => c.x === arrow.x && c.y === arrow.y);
    if (index >= 0) return { line, index, sign, cells };
  }
  return null;
}

/** 从箭头前方直到轨道尽头的格子，不含箭头自身。 */
export function forwardCells(level: Level, arrow: ArrowDef): Cell[] {
  const located = locateArrow(level, arrow);
  if (!located) return [];
  const cells: Cell[] = [];
  for (let i = located.index + located.sign; i >= 0 && i < located.cells.length; i += located.sign) {
    cells.push(located.cells[i]);
  }
  return cells;
}

export function traceArrow(level: Level, arrows: readonly ArrowDef[], arrowId: string): Trace {
  const arrow = arrows.find((a) => a.id === arrowId);
  if (!arrow) {
    throw new Error(`missing arrow ${arrowId}`);
  }
  const located = locateArrow(level, arrow);
  const origin = { x: arrow.x, y: arrow.y };
  if (!located) {
    return { arrowId, result: "wall", points: [origin], hit: origin, blockerId: null };
  }

  const occupied = new Map<string, string>();
  for (const other of arrows) {
    if (other.id !== arrow.id) occupied.set(cellKey(other.x, other.y), other.id);
  }

  const points: Cell[] = [origin];
  let i = located.index;
  while (true) {
    const next = i + located.sign;
    if (next < 0 || next >= located.cells.length) {
      const open = located.sign < 0 ? located.line.exitStart : located.line.exitEnd;
      const last = located.cells[i];
      const step = stepDelta(located.line.axis, located.sign);
      const phantom = { x: last.x + step.x, y: last.y + step.y };
      points.push(phantom);
      if (open) return { arrowId, result: "exit", points, hit: null, blockerId: null };
      return { arrowId, result: "wall", points, hit: phantom, blockerId: null };
    }
    const cell = located.cells[next];
    points.push({ x: cell.x, y: cell.y });
    const blockerId = occupied.get(cellKey(cell.x, cell.y));
    if (blockerId) {
      return { arrowId, result: "arrow", points, hit: { x: cell.x, y: cell.y }, blockerId };
    }
    i = next;
  }
}

export function exitableIds(level: Level, arrows: readonly ArrowDef[]): string[] {
  const ids: string[] = [];
  for (const arrow of arrows) {
    if (traceArrow(level, arrows, arrow.id).result === "exit") ids.push(arrow.id);
  }
  return ids;
}

/**
 * 提示用的下一步：标准解里仍在场、且当前能滑出的第一只。
 * 只拔出箭头不会新增阻挡，所以这只箭存在时一定能直接滑出。
 */
export function hintArrowId(level: Level, arrows: readonly ArrowDef[]): string | null {
  const alive = new Set(arrows.map((a) => a.id));
  for (const id of level.solution) {
    if (!alive.has(id)) continue;
    if (traceArrow(level, arrows, id).result === "exit") return id;
  }
  const any = exitableIds(level, arrows);
  return any[0] ?? null;
}

export function replaySolution(level: Level): { ok: boolean; error?: string } {
  let arrows = level.arrows.map((a) => ({ ...a }));
  const seen = new Set<string>();
  for (const id of level.solution) {
    if (seen.has(id)) return { ok: false, error: `duplicate-step:${id}` };
    seen.add(id);
    if (!arrows.some((a) => a.id === id)) return { ok: false, error: `missing-step:${id}` };
    const trace = traceArrow(level, arrows, id);
    if (trace.result !== "exit") return { ok: false, error: `blocked:${id}:${trace.result}` };
    arrows = arrows.filter((a) => a.id !== id);
  }
  if (arrows.length > 0) return { ok: false, error: "remaining" };
  return { ok: true };
}
