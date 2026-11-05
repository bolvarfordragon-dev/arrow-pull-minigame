/** 设计分辨率下、从屏幕边缘往里让出的距离。原点与 Cocos 的安全区矩形一致：左下角。 */

export interface EdgeInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface SizeLike {
  width: number;
  height: number;
}

export interface RectLike {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** 微信 getMenuButtonBoundingClientRect，单位是屏幕像素，原点在左上角。 */
export interface MenuButtonRect {
  top: number;
  bottom: number;
  left: number;
  right: number;
  width: number;
  height: number;
}

const ZERO: EdgeInsets = { top: 0, bottom: 0, left: 0, right: 0 };

function clampEdge(value: number, max: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.min(value, max);
}

function clampInsets(visible: SizeLike, insets: EdgeInsets): EdgeInsets {
  const maxX = visible.width * 0.34;
  const maxY = visible.height * 0.34;
  return {
    top: clampEdge(insets.top, maxY),
    bottom: clampEdge(insets.bottom, maxY),
    left: clampEdge(insets.left, maxX),
    right: clampEdge(insets.right, maxX),
  };
}

/**
 * 把 sys.getSafeAreaRect() 换成四边内边距。
 * 非刘海屏引擎会给一个和 visibleSize 一样大的矩形，这时四边都是 0。
 * 拿不到矩形时也是 0，浏览器预览就按整屏排。
 */
export function safeAreaInsets(visible: SizeLike, safe: RectLike | null | undefined): EdgeInsets {
  if (!visible || visible.width <= 0 || visible.height <= 0 || !safe) return { ...ZERO };
  if (![safe.x, safe.y, safe.width, safe.height].every((n) => Number.isFinite(n))) return { ...ZERO };
  if (safe.width <= 0 || safe.height <= 0) return { ...ZERO };
  return clampInsets(visible, {
    top: visible.height - safe.y - safe.height,
    bottom: safe.y,
    left: safe.x,
    right: visible.width - safe.x - safe.width,
  });
}

/**
 * 右上角胶囊经常比安全区顶更低。顶栏取两者里更靠下的那条。
 * 没有菜单按钮或屏幕尺寸时保持原内边距。
 */
export function withMenuButton(
  visible: SizeLike,
  insets: EdgeInsets,
  menu: MenuButtonRect | null | undefined,
  screen: SizeLike | null | undefined,
): EdgeInsets {
  if (!visible || visible.height <= 0 || !menu || !screen || screen.width <= 0 || screen.height <= 0) return insets;
  if (![menu.top, menu.bottom, menu.height, menu.width].every((n) => Number.isFinite(n))) return insets;
  if (menu.bottom <= 0 || menu.height <= 0 || menu.width <= 0) return insets;
  const scaleY = visible.height / screen.height;
  const menuBottom = menu.bottom * scaleY + 8;
  return clampInsets(visible, { ...insets, top: Math.max(insets.top, menuBottom) });
}
