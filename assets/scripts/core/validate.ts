import type { Level } from "./types";
import { cellKey, locateArrow, replaySolution } from "./trace";

export function validateLevel(level: Level): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!Number.isInteger(level.id) || level.id < 1) errors.push("bad-id");
  if (level.lines.length === 0) errors.push("no-lines");
  if (level.arrows.length === 0) errors.push("no-arrows");

  const seenCells = new Set<string>();
  const ids = new Set<string>();
  for (const arrow of level.arrows) {
    if (ids.has(arrow.id)) errors.push(`duplicate-id:${arrow.id}`);
    ids.add(arrow.id);
    const key = cellKey(arrow.x, arrow.y);
    if (seenCells.has(key)) errors.push(`duplicate-cell:${key}`);
    seenCells.add(key);
    if (!locateArrow(level, arrow)) errors.push(`off-line:${arrow.id}`);
  }

  if (level.solution.length !== level.arrows.length) errors.push("solution-length");
  const solutionIds = new Set(level.solution);
  if (solutionIds.size !== level.solution.length) errors.push("solution-duplicate");
  for (const id of ids) {
    if (!solutionIds.has(id)) errors.push(`solution-missing:${id}`);
  }

  for (const line of level.lines) {
    if (line.end < line.start) errors.push("line-order");
    if (!line.exitStart && !line.exitEnd) errors.push("line-no-exit");
  }

  const replay = replaySolution(level);
  if (!replay.ok) errors.push(replay.error ?? "replay");

  return { ok: errors.length === 0, errors };
}
