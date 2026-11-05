import assert from "node:assert/strict";
import test from "node:test";
import { safeAreaInsets, withMenuButton } from "../assets/scripts/core/safe-area";

const visible = { width: 750, height: 1334 };

test("a full-screen safe rect and a missing menu leave zero insets", () => {
  const insets = safeAreaInsets(visible, { x: 0, y: 0, width: 750, height: 1334 });
  assert.deepEqual(insets, { top: 0, bottom: 0, left: 0, right: 0 });
  assert.deepEqual(safeAreaInsets(visible, null), insets);
  assert.deepEqual(withMenuButton(visible, insets, null, { width: 375, height: 812 }), insets);
});

test("safe area rect becomes edge insets, and the menu button can push the top further down", () => {
  const insets = safeAreaInsets(visible, { x: 0, y: 40, width: 750, height: 1214 });
  assert.equal(insets.bottom, 40);
  assert.equal(insets.top, 80);
  assert.equal(insets.left, 0);
  assert.equal(insets.right, 0);

  const withMenu = withMenuButton(
    visible,
    insets,
    { top: 48, bottom: 88, left: 280, right: 365, width: 85, height: 40 },
    { width: 375, height: 812 },
  );
  const menuBottom = 88 * (1334 / 812) + 8;
  assert.ok(withMenu.top > insets.top);
  assert.equal(withMenu.top, menuBottom);
  assert.equal(withMenu.bottom, 40);
});

test("a broken menu rect does not change insets", () => {
  const insets = safeAreaInsets(visible, { x: 12, y: 20, width: 720, height: 1280 });
  const same = withMenuButton(
    visible,
    insets,
    { top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0 },
    { width: 375, height: 812 },
  );
  assert.deepEqual(same, insets);
  assert.equal(insets.left, 12);
  assert.ok(insets.top > 0);
});
