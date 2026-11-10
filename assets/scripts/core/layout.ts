import type { EdgeInsets, SizeLike } from "./safe-area";

/**
 * 以前格子有 92 的上限，高度又只用屏幕的 52%。
 * 第 1 关只有 4 个格子，轨道画出来大约只有屏宽的三分之一，字号和按钮是写死的像素，
 * 所以高屏幕上棋盘和按钮都缩在中间，上下大片空白。
 * 这里按安全区之间剩下的区域排：格子放大到刚好塞进这块区域。
 * 格子少就变大，格子多就缩小，但不会再被一个固定上限卡住。
 */

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PuzzleLayoutInput {
  visible: SizeLike;
  insets: EdgeInsets;
  /** 轨道占据的列数、行数，含首尾格子。 */
  spanX: number;
  spanY: number;
  showTimer: boolean;
  showHint: boolean;
  showGuide?: boolean;
  /**
   * 可见宽度对应的屏幕宽度（pt 或 CSS 像素）。
   * 有的话，按钮至少按 46pt 来，避免高分辨率上点击区域太小。
   */
  screenWidth?: number;
}

export interface PuzzleLayout {
  cellSize: number;
  boardShiftY: number;
  shiftX: number;
  hitRadius: number;
  armDistance: number;
  tokenRadius: number;
  trackWidth: number;
  fonts: { title: number; timer: number; instruction: number; button: number; modalTitle: number; modalBody: number };
  title: Box;
  timer: Box | null;
  instruction: Box;
  board: Box;
  table: Box;
  buttons: Box[];
  buttonNames: Array<"undo" | "hint" | "restart">;
  modalTitle: Box;
  modalBody: Box;
  modalPrimary: Box;
  modalSecondary: Box;
}

/** 箭头圆牌直径占格子的比例。圆牌比轨道粗，相邻箭头才能分开。 */
const TOKEN = 0.68;
const HIT_FRACTION = 0.48;

export function boxTop(box: Box): number {
  return box.y + box.height / 2;
}

export function boxBottom(box: Box): number {
  return box.y - box.height / 2;
}

export function boxLeft(box: Box): number {
  return box.x - box.width / 2;
}

export function boxRight(box: Box): number {
  return box.x + box.width / 2;
}

/** 适配宽度时，设计宽度不变，高度跟着手机比例长。 */
export function visibleSizeForFitWidth(screen: SizeLike, designWidth = 750): SizeLike {
  return {
    width: designWidth,
    height: (designWidth * screen.height) / screen.width,
  };
}

/** 把 pt / CSS 像素上的安全区换成当前可见区域里的距离。 */
export function insetsFromPoints(visible: SizeLike, screen: SizeLike, points: EdgeInsets): EdgeInsets {
  const sx = visible.width / screen.width;
  const sy = visible.height / screen.height;
  return {
    left: points.left * sx,
    right: points.right * sx,
    top: points.top * sy,
    bottom: points.bottom * sy,
  };
}

function clamp(value: number, min: number, max: number): number {
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  return Math.min(hi, Math.max(lo, value));
}

function spanUnits(span: number): number {
  return Math.max(1, span) - 1 + TOKEN;
}

export function layoutPuzzle(input: PuzzleLayoutInput): PuzzleLayout {
  const { visible, insets } = input;
  const width = Math.max(1, visible.width);
  const height = Math.max(1, visible.height);
  const spanX = Math.max(1, input.spanX);
  const spanY = Math.max(1, input.spanY);
  const shiftX = (insets.left - insets.right) / 2;

  const titleFont = clamp(width * 0.074, 36, 64);
  const instructionFont = clamp(width * 0.056, 28, 48);
  const buttonFont = clamp(width * 0.046, 24, 40);
  const timerFont = clamp(width * 0.05, 26, 44);
  const modalTitleFont = clamp(width * 0.064, 32, 52);
  const modalBodyFont = clamp(width * 0.044, 24, 36);

  let buttonH = clamp(width * 0.128, Math.min(72, height * 0.1), height * 0.12);
  if (input.screenWidth && input.screenWidth > 0) {
    const minByPoint = 46 * (width / input.screenWidth);
    buttonH = clamp(Math.max(buttonH, minByPoint), buttonH, height * 0.14);
  }

  const titleH = titleFont + 12;
  const timerH = input.showTimer ? timerFont + 10 : 0;
  const instructionH = instructionFont * 2.3;
  const sidePad = Math.max(16, width * 0.045);
  const availableW = Math.max(48, width - insets.left - insets.right - sidePad * 2);

  const titlePad = 18;
  const topBlock = insets.top + titlePad + titleH + (input.showTimer ? 8 + timerH : 0) + 18;
  const buttonPad = 24;
  const instructionGap = 16;
  const bottomBlock = insets.bottom + buttonPad + buttonH + 12 + instructionH + instructionGap;
  const availableH = Math.max(48, height - topBlock - bottomBlock);

  const cellFromW = availableW / spanUnits(spanX);
  const cellFromH = availableH / spanUnits(spanY);
  const cellSize = Math.max(8, Math.min(cellFromW, cellFromH));
  const tokenRadius = (cellSize * TOKEN) / 2;
  const boardW = spanUnits(spanX) * cellSize;
  const boardH = spanUnits(spanY) * cellSize;

  const titleY = height / 2 - insets.top - titlePad - titleH / 2;
  const timerY = input.showTimer ? titleY - titleH / 2 - 8 - timerH / 2 : 0;
  const titleBottom = input.showTimer ? timerY - timerH / 2 : titleY - titleH / 2;
  const buttonY = -height / 2 + insets.bottom + buttonPad + buttonH / 2;
  const buttonTop = buttonY + buttonH / 2;

  const minCenter = buttonTop + 12 + instructionH + instructionGap + boardH / 2;
  const maxCenter = titleBottom - 18 - boardH / 2;
  const boardShiftY = (minCenter + maxCenter) / 2;
  const instructionY = boardShiftY - boardH / 2 - instructionGap - instructionH / 2;
  const framePad = clamp(width * 0.032, 14, 26);
  const tableTop = Math.min(titleBottom - 8, boardShiftY + boardH / 2 + (input.showGuide ? framePad * 2.2 : framePad));
  const tableBottom = Math.max(
    buttonTop + 6,
    input.showGuide ? instructionY - instructionH / 2 - 6 : boardShiftY - boardH / 2 - framePad,
  );

  const names: Array<"undo" | "hint" | "restart"> = input.showHint ? ["undo", "hint", "restart"] : ["undo", "restart"];
  const gap = Math.max(12, width * 0.03);
  let buttonW = (availableW - gap * (names.length - 1)) / names.length;
  buttonW = Math.min(buttonW, width * 0.4);
  buttonW = Math.max(buttonW, Math.min(buttonH * 1.7, availableW / names.length));
  const used = names.length * buttonW + (names.length - 1) * gap;
  if (used > availableW) buttonW = (availableW - gap * (names.length - 1)) / names.length;
  const rowW = names.length * buttonW + (names.length - 1) * gap;
  const buttons = names.map((name, index) => {
    const x = shiftX - rowW / 2 + buttonW / 2 + index * (buttonW + gap);
    return { x, y: buttonY, width: buttonW, height: buttonH, name };
  });

  const textW = Math.max(120, availableW);
  const modalW = Math.min(availableW, Math.max(buttonW * 1.35, width * 0.62));
  const modalButtonH = buttonH;
  const modalPrimaryY = 8 - modalButtonH * 0.15;
  const modalSecondaryY = modalPrimaryY - modalButtonH - 16;

  return {
    cellSize,
    boardShiftY,
    shiftX,
    hitRadius: cellSize * HIT_FRACTION,
    armDistance: Math.max(cellSize * 0.34, width * 0.045),
    tokenRadius,
    trackWidth: clamp(cellSize * 0.1, 5, 16),
    fonts: {
      title: titleFont,
      timer: timerFont,
      instruction: instructionFont,
      button: buttonFont,
      modalTitle: modalTitleFont,
      modalBody: modalBodyFont,
    },
    title: { x: shiftX, y: titleY, width: textW, height: titleH },
    timer: input.showTimer ? { x: shiftX, y: timerY, width: textW, height: timerH } : null,
    instruction: { x: shiftX, y: instructionY, width: textW, height: instructionH },
    board: { x: shiftX, y: boardShiftY, width: boardW, height: boardH },
    table: { x: shiftX, y: (tableTop + tableBottom) / 2, width: availableW + sidePad, height: tableTop - tableBottom },
    buttons: buttons.map(({ x, y, width: w, height: h }) => ({ x, y, width: w, height: h })),
    buttonNames: names,
    modalTitle: { x: 0, y: modalPrimaryY + modalButtonH + 78, width: textW, height: modalTitleFont + 16 },
    modalBody: { x: 0, y: modalPrimaryY + modalButtonH + 28, width: textW * 0.92, height: modalBodyFont * 2.4 },
    modalPrimary: { x: 0, y: modalPrimaryY, width: modalW, height: modalButtonH },
    modalSecondary: { x: 0, y: modalSecondaryY, width: modalW, height: modalButtonH },
  };
}
