import assert from "node:assert/strict";
import test from "node:test";
import { arrowCountForLevel, generateAll, generateLevel } from "../assets/scripts/core/generate";
import { cellKey, dirSign, exitableIds, forwardCells, locateArrow, traceArrow } from "../assets/scripts/core/trace";
import type { Level } from "../assets/scripts/core/types";
import { LEVEL_COUNT } from "../assets/scripts/core/types";
import { validateLevel } from "../assets/scripts/core/validate";

function bodyOf(level: Level): string {
  return JSON.stringify({ lines: level.lines, arrows: level.arrows, solution: level.solution });
}

function blockersFor(level: Level) {
  const occupied = new Map(level.arrows.map(arrow => [cellKey(arrow.x, arrow.y), arrow]));
  return new Map(level.arrows.map(arrow => {
    const blockers = forwardCells(level, arrow).flatMap(cell => {
      const other = occupied.get(cellKey(cell.x, cell.y));
      return other ? [other.id] : [];
    });
    return [arrow.id, blockers];
  }));
}

function longestChain(level: Level): number {
  const blockers = blockersFor(level);
  const depths = new Map<string, number>();
  for (const id of level.solution) {
    const prerequisites = blockers.get(id)!.map(other => {
      const depth = depths.get(other);
      assert.ok(depth, `level ${level.id}: ${other} should precede ${id}`);
      return depth;
    });
    depths.set(id, 1 + Math.max(0, ...prerequisites));
  }
  return Math.max(...depths.values());
}

test("60 fixed levels are distinct and can be cleared by their standard solution", () => {
  const campaign = generateAll();
  assert.equal(campaign.length, LEVEL_COUNT);
  const seen = new Map<string, number>();
  for (const level of campaign) {
    assert.deepEqual(generateLevel(level.id), level);
    const checked = validateLevel(level);
    assert.ok(checked.ok, `level ${level.id}: ${checked.errors.join(",")}`);
    assert.equal(level.arrows.length, arrowCountForLevel(level.id));
    const body = bodyOf(level);
    assert.equal(seen.get(body), undefined, `level ${level.id} duplicates another layout`);
    seen.set(body, level.id);
  }
});

test("every campaign rail has a rider and every rail on a crossing board affects another rail", () => {
  for (const level of generateAll()) {
    const riders = new Map(level.arrows.map(arrow => [arrow.id, locateArrow(level, arrow)!.line]));
    const linked = new Set();
    for (const [id, blockers] of blockersFor(level)) {
      const ownRail = riders.get(id)!;
      for (const blocker of blockers) {
        const otherRail = riders.get(blocker)!;
        if (ownRail.axis === otherRail.axis) continue;
        linked.add(ownRail);
        linked.add(otherRail);
      }
    }

    for (const line of level.lines) {
      const here = level.arrows.filter(arrow => riders.get(arrow.id) === line);
      assert.ok(here.length > 0, `level ${level.id}: empty ${line.axis} rail at ${line.fixed}`);
      if (level.lines.length > 1) {
        assert.ok(linked.has(line), `level ${level.id}: isolated ${line.axis} rail at ${line.fixed}`);
      }
      assert.equal(line.exitStart, here.some(arrow => dirSign(arrow.dir) < 0));
      assert.equal(line.exitEnd, here.some(arrow => dirSign(arrow.dir) > 0));
    }
  }
});

test("the campaign builds from the first timed puzzles to a deeper finale", () => {
  const campaign = generateAll();
  const depths = campaign.map(longestChain);
  for (const [id, arrows, depth] of [[9, 5, 4], [11, 6, 5], [12, 7, 5], [13, 8, 6]]) {
    const level = campaign[id - 1];
    assert.equal(level.arrows.length, arrows);
    assert.ok(depths[id - 1] >= depth, `level ${id} lost its chain`);
    assert.ok(exitableIds(level, level.arrows).length <= 2, `level ${id} has too many openers`);
  }

  const chapterDepths = Array.from({ length: 6 }, (_, chapter) => {
    const block = depths.slice(chapter * 10, chapter * 10 + 10);
    return block.reduce((sum, depth) => sum + depth, 0) / block.length;
  });
  for (const [i, depth] of chapterDepths.entries()) {
    if (i > 0) assert.ok(depth > chapterDepths[i - 1], `chapter ${i + 1} did not progress`);
  }
  for (const id of [14, 18, 25, 29, 34, 38, 45, 49, 54, 58]) {
    assert.ok(depths[id - 1] < depths[id - 2], `level ${id} lost its relief beat`);
  }

  const finale = campaign[LEVEL_COUNT - 1];
  assert.equal(finale.arrows.length, 20);
  assert.ok(depths.at(-1)! > Math.max(...depths.slice(0, -1)));
  assert.ok(exitableIds(finale, finale.arrows).length <= 4);
});

test("level 1 previews a clear exit and level 2 teaches a block", () => {
  const first = generateLevel(1);
  const open = traceArrow(first, first.arrows, "a1");
  assert.equal(open.result, "exit");
  assert.ok(open.points.length >= 2);
  assert.equal(open.hit, null);

  const second = generateLevel(2);
  assert.deepEqual(
    second.arrows.map((arrow) => ({ id: arrow.id, x: arrow.x, dir: arrow.dir })),
    [
      { id: "a1", x: 2, dir: "E" },
      { id: "a2", x: 0, dir: "E" },
    ],
  );
  const front = traceArrow(second, second.arrows, "a1");
  const back = traceArrow(second, second.arrows, "a2");
  assert.equal(front.result, "exit");
  assert.equal(back.result, "arrow");
  assert.equal(back.blockerId, "a1");
  assert.ok(back.hit);
});

test("a closed end is a wall and a head-on pair cannot exit", () => {
  const wall: Level = {
    id: 1,
    lines: [{ axis: "H", fixed: 0, start: 0, end: 2, exitStart: false, exitEnd: false }],
    arrows: [{ id: "a1", x: 1, y: 0, dir: "E" }],
    solution: ["a1"],
  };
  assert.equal(traceArrow(wall, wall.arrows, "a1").result, "wall");

  const mutual: Level = {
    id: 6,
    lines: [{ axis: "H", fixed: 0, start: 0, end: 4, exitStart: true, exitEnd: true }],
    arrows: [
      { id: "a1", x: 1, y: 0, dir: "E" },
      { id: "a2", x: 3, y: 0, dir: "W" },
    ],
    solution: ["a1", "a2"],
  };
  assert.equal(traceArrow(mutual, mutual.arrows, "a1").result, "arrow");
  assert.equal(traceArrow(mutual, mutual.arrows, "a2").result, "arrow");
  assert.equal(validateLevel(mutual).ok, false);
});
