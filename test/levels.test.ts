import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { arrowCountForLevel, generateAll, generateLevel } from "../assets/scripts/core/generate";
import { traceArrow } from "../assets/scripts/core/trace";
import type { Level } from "../assets/scripts/core/types";
import { LEVEL_COUNT } from "../assets/scripts/core/types";
import { validateLevel } from "../assets/scripts/core/validate";

const LEVEL_DIR = path.join(process.cwd(), "assets/resources/levels");

function band(levelId: number): [number, number] {
  if (levelId === 2) return [2, 2];
  if (levelId <= 3) return [1, 1];
  if (levelId <= 10) return [2, 3];
  if (levelId <= 25) return [3, 5];
  if (levelId <= 45) return [5, 8];
  return [7, 12];
}

function readPacked(): Level[] {
  const files = readdirSync(LEVEL_DIR)
    .filter((name) => name.endsWith(".json"))
    .sort();
  return files.map((name) => JSON.parse(readFileSync(path.join(LEVEL_DIR, name), "utf8")) as Level);
}

test("60 levels are generated, saved, and solved by their standard solution", () => {
  const generated = generateAll();
  assert.equal(generated.length, LEVEL_COUNT);
  const packed = readPacked();
  assert.equal(packed.length, LEVEL_COUNT);
  let crossings = 0;
  for (let id = 1; id <= LEVEL_COUNT; id++) {
    const level = generateLevel(id);
    assert.equal(level.id, id);
    assert.deepEqual(packed[id - 1], level);
    const checked = validateLevel(level);
    assert.equal(checked.ok, true, `${id}: ${checked.errors.join(",")}`);
    const [lo, hi] = band(id);
    assert.equal(level.arrows.length, arrowCountForLevel(id));
    assert.ok(level.arrows.length >= lo && level.arrows.length <= hi, `band ${id}`);
    const axes = new Set(level.lines.map((line) => line.axis));
    if (axes.has("H") && axes.has("V")) crossings += 1;
  }
  assert.ok(crossings >= 40, `expected most levels to cross, got ${crossings}`);
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
