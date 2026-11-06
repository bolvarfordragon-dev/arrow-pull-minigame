import assert from "node:assert/strict";
import test from "node:test";
import { generateLevel } from "../assets/scripts/core/generate";
import {
  boxBottom,
  boxLeft,
  boxRight,
  boxTop,
  insetsFromPoints,
  layoutPuzzle,
  visibleSizeForFitWidth,
  type Box,
  type PuzzleLayout,
} from "../assets/scripts/core/layout";
import { withMenuButton, type EdgeInsets, type MenuButtonRect } from "../assets/scripts/core/safe-area";
import { lineCells } from "../assets/scripts/core/trace";
import type { Level } from "../assets/scripts/core/types";

interface Phone {
  name: string;
  screen: { width: number; height: number };
  safe: EdgeInsets;
  menu?: MenuButtonRect | null;
  /** 浏览器预览有时直接把窗口像素当成可见区域，而不是 750 宽的设计分辨率。 */
  raw?: boolean;
}

const PHONES: Phone[] = [
  { name: "iPhone SE", screen: { width: 375, height: 667 }, safe: { top: 20, bottom: 0, left: 0, right: 0 } },
  {
    name: "iPhone 12",
    screen: { width: 390, height: 844 },
    safe: { top: 47, bottom: 34, left: 0, right: 0 },
    menu: { top: 48, bottom: 84, left: 296, right: 374, width: 78, height: 36 },
  },
  {
    name: "iPhone 14 Pro",
    screen: { width: 393, height: 852 },
    safe: { top: 59, bottom: 34, left: 0, right: 0 },
    menu: { top: 54, bottom: 90, left: 300, right: 378, width: 78, height: 36 },
  },
  { name: "iPhone 14 Pro Max", screen: { width: 430, height: 932 }, safe: { top: 59, bottom: 34, left: 0, right: 0 } },
  { name: "Android", screen: { width: 360, height: 800 }, safe: { top: 28, bottom: 24, left: 0, right: 0 } },
  {
    name: "side inset",
    screen: { width: 390, height: 844 },
    safe: { top: 47, bottom: 34, left: 24, right: 10 },
  },
  { name: "tall browser frame", screen: { width: 746, height: 1546 }, safe: { top: 0, bottom: 0, left: 0, right: 0 }, raw: true },
];

const LEVELS = [1, 2, 7, 10, 50, 60];

function spanOf(level: Level): { spanX: number; spanY: number } {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const line of level.lines) {
    for (const cell of lineCells(line)) {
      minX = Math.min(minX, cell.x);
      maxX = Math.max(maxX, cell.x);
      minY = Math.min(minY, cell.y);
      maxY = Math.max(maxY, cell.y);
    }
  }
  return { spanX: maxX - minX + 1, spanY: maxY - minY + 1 };
}

function phoneVisible(phone: Phone): { width: number; height: number } {
  return phone.raw ? phone.screen : visibleSizeForFitWidth(phone.screen);
}

function phoneInsets(phone: Phone, visible: { width: number; height: number }): EdgeInsets {
  const safe = insetsFromPoints(visible, phone.screen, phone.safe);
  if (!phone.menu) return safe;
  return withMenuButton(visible, safe, phone.menu, phone.screen);
}

function layoutFor(phone: Phone, levelId: number): { layout: PuzzleLayout; visible: { width: number; height: number }; insets: EdgeInsets; spanX: number; spanY: number } {
  const level = generateLevel(levelId);
  const span = spanOf(level);
  const visible = phoneVisible(phone);
  const insets = phoneInsets(phone, visible);
  const layout = layoutPuzzle({
    visible,
    insets,
    spanX: span.spanX,
    spanY: span.spanY,
    showTimer: levelId >= 11,
    showHint: levelId >= 6,
    screenWidth: phone.screen.width,
  });
  return { layout, visible, insets, ...span };
}

function gapAbove(upper: Box, lower: Box): number {
  return boxBottom(upper) - boxTop(lower);
}

function insideHorizontal(box: Box, visible: { width: number }, insets: EdgeInsets, slop = 1): boolean {
  return boxLeft(box) >= -visible.width / 2 + insets.left - slop && boxRight(box) <= visible.width / 2 - insets.right + slop;
}

test("level 1 on a tall phone is not stuck at the old 92px cell cap", () => {
  const phone = PHONES.find((item) => item.name === "iPhone 12")!;
  const visible = phoneVisible(phone);
  const oldCell = Math.min(92, (visible.width * 0.84) / 4, (visible.height * 0.52) / 1);
  const { layout } = layoutFor(phone, 1);
  assert.ok(oldCell <= 92);
  assert.ok(layout.cellSize > oldCell + 40, `cell ${layout.cellSize} old ${oldCell}`);
  assert.ok(layout.board.width / visible.width > 0.72, `board width fraction ${layout.board.width / visible.width}`);
});

test("the tall browser frame gives level 7 a wide board and taller controls", () => {
  const phone = PHONES.find((item) => item.name === "tall browser frame")!;
  const { layout, visible } = layoutFor(phone, 7);
  assert.ok(layout.board.width / visible.width > 0.7, `width fraction ${layout.board.width / visible.width}`);
  assert.ok(layout.buttons[0].height >= 80);
  assert.ok(layout.fonts.title >= 48);
  assert.ok(layout.fonts.instruction >= 36);
});

test("layout stays inside the safe playfield on phones, sparse levels, and dense levels", () => {
  for (const phone of PHONES) {
    for (const levelId of LEVELS) {
      const { layout, visible, insets, spanX, spanY } = layoutFor(phone, levelId);
      const where = `${phone.name} level ${levelId}`;
      assert.ok(layout.cellSize > 8, where);
      assert.ok(insideHorizontal(layout.board, visible, insets), `${where} board x`);
      assert.ok(insideHorizontal(layout.title, visible, insets), `${where} title x`);
      assert.ok(insideHorizontal(layout.instruction, visible, insets), `${where} instruction x`);
      for (const button of layout.buttons) assert.ok(insideHorizontal(button, visible, insets), `${where} button x`);

      assert.ok(boxTop(layout.title) <= visible.height / 2 - insets.top + 0.6, `${where} title under top inset`);
      for (const button of layout.buttons) {
        assert.ok(boxBottom(button) >= -visible.height / 2 + insets.bottom - 0.6, `${where} button above home indicator`);
      }
      const upper = layout.timer ?? layout.title;
      assert.ok(gapAbove(upper, layout.board) >= 8, `${where} title/timer clears board ${gapAbove(upper, layout.board)}`);
      assert.ok(gapAbove(layout.board, layout.instruction) >= 8, `${where} board clears instruction`);
      assert.ok(gapAbove(layout.instruction, layout.buttons[0]) >= 8, `${where} instruction clears buttons`);

      const widthUnits = spanX - 1 + 0.68;
      const heightUnits = spanY - 1 + 0.68;
      const limiting = widthUnits / (visible.width - insets.left - insets.right) >= heightUnits / (visible.height - insets.top - insets.bottom)
        ? layout.board.width
        : layout.board.height;
      const limitRoom = widthUnits / (visible.width - insets.left - insets.right) >= heightUnits / (visible.height - insets.top - insets.bottom)
        ? visible.width - insets.left - insets.right
        : visible.height - insets.top - insets.bottom;
      assert.ok(limiting / limitRoom > 0.62, `${where} occupancy ${limiting / limitRoom}`);

      assert.ok(layout.hitRadius * 2 < layout.cellSize, `${where} hits overlap`);
      const buttonPt = (layout.buttons[0].height * phone.screen.width) / visible.width;
      assert.ok(buttonPt >= 44, `${where} button ${buttonPt.toFixed(1)}pt`);
    }
  }
});

test("adjacent arrows are separate hit targets", () => {
  const { layout } = layoutFor(PHONES[1], 2);
  const reach = layout.hitRadius;
  assert.ok(Math.hypot(0, 0) <= reach);
  assert.ok(Math.hypot(layout.cellSize, 0) > reach);
  assert.ok(Math.hypot(layout.cellSize / 2, 0) > reach);
  assert.ok(layout.tokenRadius * 2 < layout.cellSize);
  assert.ok(layout.trackWidth < layout.tokenRadius * 2);
});

test("a taller phone does not shrink a sparse board, and a dense board still fits", () => {
  const se = PHONES.find((item) => item.name === "iPhone SE")!;
  const max = PHONES.find((item) => item.name === "iPhone 14 Pro Max")!;
  const sparseShort = layoutFor(se, 1).layout;
  const sparseTall = layoutFor(max, 1).layout;
  assert.ok(sparseTall.cellSize + 0.5 >= sparseShort.cellSize);
  const dense = layoutFor(max, 50);
  assert.ok(dense.layout.board.width <= dense.visible.width - dense.insets.left - dense.insets.right + 1);
  assert.ok(dense.layout.board.height < dense.visible.height - dense.insets.top - dense.insets.bottom);
  assert.ok(dense.layout.cellSize < sparseTall.cellSize);
});

test("the WeChat capsule pushes the title below the menu button", () => {
  const phone = PHONES.find((item) => item.name === "iPhone 12")!;
  const visible = phoneVisible(phone);
  const safeOnly = insetsFromPoints(visible, phone.screen, phone.safe);
  const withCapsule = phoneInsets(phone, visible);
  const span = spanOf(generateLevel(1));
  const plain = layoutPuzzle({
    visible,
    insets: safeOnly,
    ...span,
    showTimer: false,
    showHint: false,
    screenWidth: phone.screen.width,
  });
  const capped = layoutPuzzle({
    visible,
    insets: withCapsule,
    ...span,
    showTimer: false,
    showHint: false,
    screenWidth: phone.screen.width,
  });
  assert.ok(withCapsule.top > safeOnly.top);
  assert.ok(capped.title.y < plain.title.y);
  assert.ok(boxTop(capped.title) <= visible.height / 2 - withCapsule.top + 0.6);
});

test("hint hidden on early levels keeps two buttons from overlapping", () => {
  const { layout } = layoutFor(PHONES[1], 1);
  assert.deepEqual(layout.buttonNames, ["undo", "restart"]);
  assert.equal(layout.buttons.length, 2);
  assert.ok(boxRight(layout.buttons[0]) + 8 <= boxLeft(layout.buttons[1]));
  const later = layoutFor(PHONES[1], 7).layout;
  assert.deepEqual(later.buttonNames, ["undo", "hint", "restart"]);
  assert.ok(boxRight(later.buttons[0]) + 8 <= boxLeft(later.buttons[1]));
  assert.ok(boxRight(later.buttons[1]) + 8 <= boxLeft(later.buttons[2]));
});
