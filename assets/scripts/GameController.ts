import {
  _decorator,
  BlockInputEvents,
  Camera,
  Color,
  Component,
  EventTouch,
  game as cocosGame,
  Game as CocosGame,
  Graphics,
  Label,
  Layers,
  Node,
  sys,
  UIOpacity,
  UITransform,
  Vec2,
  Vec3,
  view,
} from "cc";
import { Game, type PrepareResult } from "./core/game";
import { generateAll } from "./core/generate";
import { layoutPuzzle, type Box } from "./core/layout";
import { safeAreaInsets, withMenuButton, type EdgeInsets, type MenuButtonRect } from "./core/safe-area";
import { lineCells } from "./core/trace";
import type { ArrowDef, Cell, Dir, LevelBank, Trace } from "./core/types";
import { showInterstitial, showRewarded } from "./WxAds";

const { ccclass } = _decorator;

const TABLE = {
  backdrop: new Color(255, 249, 233, 255),
  cloud: new Color(253, 235, 193, 255),
  mint: new Color(226, 243, 231, 255),
  shadow: new Color(117, 79, 45, 58),
  base: new Color(188, 100, 71, 255),
  edge: new Color(248, 172, 124, 255),
  face: new Color(255, 238, 204, 255),
  bevel: new Color(221, 153, 106, 255),
  grain: new Color(180, 126, 83, 56),
  groove: new Color(229, 197, 153, 255),
  rail: new Color(147, 117, 87, 255),
  stop: new Color(140, 82, 62, 255),
};
const ACCENT = new Color(158, 89, 6, 255);
const OPEN = new Color(12, 119, 99, 255);
const INK = new Color(38, 58, 67, 255);
const GUIDE_INK = new Color(85, 61, 44, 255);
const MUTED = new Color(97, 83, 71, 255);
const DANGER = new Color(187, 51, 62, 255);
const BUTTON = new Color(255, 252, 240, 255);
const BUTTON_HINT = new Color(209, 241, 217, 255);
const BUTTON_RIM = new Color(197, 154, 113, 255);
const BUTTON_HINT_RIM = new Color(109, 158, 126, 255);
const DIM = new Color(61, 44, 38, 136);
const GHOST = new Color(12, 119, 99, 137);
const TOKEN = new Color(29, 132, 166, 255);
const TOKEN_SELECTED = new Color(17, 129, 108, 255);
const TOKEN_HOT = new Color(255, 205, 98, 255);
const TOKEN_RIM = new Color(16, 76, 100, 255);
const TOKEN_INNER = new Color(255, 252, 240, 112);
const TOKEN_ARROW = new Color(255, 252, 240, 255);
const TOKEN_HOT_INK = new Color(101, 54, 17, 255);
const EXIT_PULSE = OPEN.clone();
const EXIT_MARK_LENGTH = 0.22;
const EXIT_PULSE_TIME = 0.5;

const DIR_VECTOR: Record<Dir, Vec2> = {
  E: new Vec2(1, 0),
  W: new Vec2(-1, 0),
  N: new Vec2(0, 1),
  S: new Vec2(0, -1),
};

interface Anim {
  trace: Trace;
  duration: number;
  elapsed: number;
}

type ButtonIcon = "undo" | "hint" | "restart";

interface WxWindowInfo {
  windowWidth?: number;
  windowHeight?: number;
  screenWidth?: number;
  screenHeight?: number;
}

interface WxHost {
  getMenuButtonBoundingClientRect?: () => MenuButtonRect;
  getWindowInfo?: () => WxWindowInfo;
  getSystemInfoSync?: () => WxWindowInfo;
}

function uiNode(name: string): Node {
  const node = new Node(name);
  node.layer = Layers.Enum.UI_2D;
  return node;
}

function dirVector(dir: Dir): Vec2 {
  return DIR_VECTOR[dir];
}

@ccclass("GameController")
export class GameController extends Component {
  private game!: Game;
  private board!: Node;
  private backdrop!: Graphics;
  private table!: Graphics;
  private gfx!: Graphics;
  private title!: Label;
  private timer!: Label;
  private toast!: Label;
  private undoButton!: Node;
  private hintButton!: Node;
  private restartButton!: Node;
  private screenWidth: number | null = null;
  private hitRadius = 48;
  private armDistance = 36;
  private tokenRadius = 28;
  private trackWidth = 10;
  private restartEnabled = true;
  private modal!: Node;
  private modalTitle!: Label;
  private modalBody!: Label;
  private modalA!: Node;
  private modalB!: Node;
  private modalALabel!: Label;
  private modalBLabel!: Label;
  private modalActionA: (() => void) | null = null;
  private modalActionB: (() => void) | null = null;

  private cellSize = 72;
  private originX = 0;
  private originY = 0;
  private boardShiftY = 30;
  private anim: Anim | null = null;
  private exitPulse: { trace: Trace; elapsed: number } | null = null;
  private preview: Trace | null = null;
  private holdId: string | null = null;
  private holdStart = new Vec2();
  private armed = false;
  private activeTouch: number | null = null;
  private settling = false;
  private settleToken = 0;
  private settleWait: (() => void) | null = null;
  private ghost = 0;
  private drawnFingerprint = "";
  private cachedLevelId = -1;
  private cachedLines: Cell[][] = [];
  private coordCache = new Map<string, Vec2>();
  private coordStamp = "";
  private readonly traceEndOut = new Vec2();
  private readonly animPointOut = new Vec2();
  private readonly touchUi = new Vec2();
  private readonly touchWorld = new Vec3();
  private readonly touchLocal3 = new Vec3();
  private readonly touchLocal = new Vec2();

  onLoad(): void {
    const levels = generateAll();
    const bank: LevelBank = {
      maxId: levels.length,
      get: (id) => {
        const level = levels[id - 1];
        if (!level || level.id !== id) throw new Error(`missing level ${id}`);
        return level;
      },
    };
    this.game = new Game(
      bank,
      {
        get: (key) => sys.localStorage.getItem(key),
        set: (key, value) => sys.localStorage.setItem(key, value),
      },
      () => Date.now(),
    );
    this.buildUi();
    this.board.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
    this.board.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    this.board.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    this.board.on(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    cocosGame.on(CocosGame.EVENT_HIDE, this.clearTouch, this);
    view.setResizeCallback(() => {
      this.clearTouch();
      this.layout();
    });
  }

  start(): void {
    this.layout();
    this.scheduleOnce(() => this.layout(), 0);
  }

  onDestroy(): void {
    this.cancelPendingSettle();
    cocosGame.off(CocosGame.EVENT_HIDE, this.clearTouch, this);
    view.setResizeCallback(() => undefined);
  }

  update(dt: number): void {
    this.ghost += dt;
    const tick = this.game.tick(dt);
    if (tick.timedOut) this.openTimeout();
    if (this.exitPulse) {
      this.exitPulse.elapsed += dt;
      if (this.exitPulse.elapsed >= EXIT_PULSE_TIME) this.exitPulse = null;
    }
    if (this.anim) this.stepAnim(dt);
    // 底盘单独绘制，滑行、通关亮灯和新手虚影只刷新前景。
    const motion = this.anim != null || this.exitPulse != null || this.showsGhost();
    const fingerprint = motion ? null : this.boardFingerprint();
    if (motion || fingerprint !== this.drawnFingerprint) {
      this.redraw();
      this.drawnFingerprint = fingerprint ?? "";
    }
    this.syncHud();
  }

  private buildUi(): void {
    const backdropNode = uiNode("Backdrop");
    backdropNode.addComponent(UITransform);
    this.node.addChild(backdropNode);
    this.backdrop = backdropNode.addComponent(Graphics);

    const tableNode = uiNode("Table");
    tableNode.addComponent(UITransform);
    this.node.addChild(tableNode);
    this.table = tableNode.addComponent(Graphics);

    this.board = uiNode("Board");
    this.board.addComponent(UITransform);
    this.node.addChild(this.board);
    this.gfx = this.board.addComponent(Graphics);

    this.title = this.makeLabel("Title", 40, INK);
    this.title.isBold = true;
    this.timer = this.makeLabel("Timer", 32, GUIDE_INK);
    this.toast = this.makeLabel("Toast", 28, GUIDE_INK);
    this.toast.verticalAlign = Label.VerticalAlign.TOP;
    this.toast.node.active = false;

    const undo = this.makeButton("Undo", "撤销", 150);
    const hint = this.makeButton("Hint", "提示", 150);
    const restart = this.makeButton("Restart", "重开", 150);
    this.undoButton = undo;
    this.hintButton = hint;
    this.restartButton = restart;
    restart.addComponent(UIOpacity);
    undo.on(Node.EventType.TOUCH_END, () => this.onUndo(), this);
    hint.on(Node.EventType.TOUCH_END, () => this.onHint(), this);
    restart.on(Node.EventType.TOUCH_END, () => this.onRestart(), this);

    this.modal = uiNode("Modal");
    const modalUi = this.modal.addComponent(UITransform);
    modalUi.setAnchorPoint(0.5, 0.5);
    this.modal.addComponent(BlockInputEvents);
    this.modal.addComponent(Graphics);
    this.node.addChild(this.modal);
    this.modalTitle = this.makeLabel("ModalTitle", 36, INK, this.modal);
    this.modalTitle.isBold = true;
    this.modalBody = this.makeLabel("ModalBody", 26, MUTED, this.modal);
    this.modalA = this.makeButton("ModalA", "确定", 220, this.modal);
    this.modalB = this.makeButton("ModalB", "取消", 220, this.modal);
    this.modalALabel = this.modalA.getComponentInChildren(Label)!;
    this.modalBLabel = this.modalB.getComponentInChildren(Label)!;
    this.modalA.on(Node.EventType.TOUCH_END, () => this.modalActionA?.(), this);
    this.modalB.on(Node.EventType.TOUCH_END, () => this.modalActionB?.(), this);
    this.modal.active = false;
  }

  private makeLabel(name: string, size: number, color: Color, parent: Node = this.node): Label {
    const node = uiNode(name);
    const ui = node.addComponent(UITransform);
    ui.setContentSize(640, size + 16);
    ui.setAnchorPoint(0.5, 0.5);
    parent.addChild(node);
    const label = node.addComponent(Label);
    label.useSystemFont = true;
    label.fontSize = size;
    label.lineHeight = size + 8;
    label.color = color;
    label.horizontalAlign = Label.HorizontalAlign.CENTER;
    label.verticalAlign = Label.VerticalAlign.CENTER;
    label.overflow = Label.Overflow.RESIZE_HEIGHT;
    return label;
  }

  private makeButton(name: string, text: string, width: number, parent: Node = this.node): Node {
    const node = uiNode(name);
    const ui = node.addComponent(UITransform);
    ui.setContentSize(width, 68);
    ui.setAnchorPoint(0.5, 0.5);
    parent.addChild(node);
    const g = node.addComponent(Graphics);
    this.paintButton(g, width, 68);
    const label = this.makeLabel(`${name}Label`, 26, INK, node);
    label.isBold = true;
    label.string = text;
    label.node.getComponent(UITransform)!.setContentSize(width, 68);
    label.node.setPosition(0, 0, 0);
    return node;
  }

  private paintButton(g: Graphics, width: number, height: number, icon?: ButtonIcon, font = 26, primary = false): void {
    g.clear();
    const radius = Math.min(32, height * 0.36);
    const highlight = primary || icon === "hint";
    const rim = highlight ? BUTTON_HINT_RIM : BUTTON_RIM;
    g.fillColor = rim;
    g.roundRect(-width / 2, -height / 2 - 5, width, height, radius);
    g.fill();
    g.fillColor = highlight ? BUTTON_HINT : BUTTON;
    g.roundRect(-width / 2, -height / 2, width, height, radius);
    g.fill();
    g.strokeColor = rim;
    g.lineWidth = 2;
    g.roundRect(-width / 2, -height / 2, width, height, radius);
    g.stroke();
    if (icon) this.drawButtonIcon(g, icon, -font * 1.06, font * 0.88);
  }

  private drawButtonIcon(g: Graphics, icon: ButtonIcon, x: number, size: number): void {
    const r = size * 0.42;
    g.lineWidth = Math.max(3.5, size * 0.15);
    g.lineCap = Graphics.LineCap.ROUND;
    g.lineJoin = Graphics.LineJoin.ROUND;
    g.strokeColor = INK;
    if (icon === "hint") {
      this.drawSpark(g, x, 0, r * 1.24, OPEN);
    } else if (icon === "undo") {
      g.moveTo(x + r, -r * 0.55);
      g.bezierCurveTo(x + r, r * 0.45, x + r * 0.55, r * 0.63, x - r, r * 0.63);
      g.moveTo(x - r * 0.38, r * 1.18);
      g.lineTo(x - r, r * 0.63);
      g.lineTo(x - r * 0.38, r * 0.09);
      g.stroke();
    } else {
      g.moveTo(x + r * 0.72, r * 0.57);
      g.bezierCurveTo(x - r * 0.4, r * 1.55, x - r * 1.45, r * 0.32, x - r * 0.83, -r * 0.55);
      g.bezierCurveTo(x - r * 0.3, -r * 1.33, x + r * 0.96, -r * 0.96, x + r * 0.96, -r * 0.13);
      g.moveTo(x + r * 0.8, r * 1.11);
      g.lineTo(x + r * 0.8, r * 0.51);
      g.lineTo(x + r * 0.23, r * 0.46);
      g.stroke();
    }
  }

  private applyLabel(label: Label, box: { x: number; y: number; width: number; height: number }, font: number): void {
    const size = Math.round(font);
    label.fontSize = size;
    label.lineHeight = size + 8;
    const ui = label.node.getComponent(UITransform)!;
    ui.setContentSize(box.width, box.height);
    label.node.setPosition(box.x, box.y, 0);
  }

  private applyButton(node: Node, box: Box, font: number, icon?: ButtonIcon): void {
    node.setPosition(box.x, box.y, 0);
    const ui = node.getComponent(UITransform)!;
    ui.setContentSize(box.width, box.height);
    const graphics = node.getComponent(Graphics);
    if (graphics) this.paintButton(graphics, box.width, box.height, icon, font, node === this.modalA);
    const label = node.getComponentInChildren(Label);
    if (!label) return;
    const size = Math.round(font);
    label.fontSize = size;
    label.lineHeight = size + 6;
    label.node.getComponent(UITransform)!.setContentSize(box.width, box.height);
    label.node.setPosition(icon ? size * 0.55 : 0, 0, 0);
  }

  private readInsets(size: { width: number; height: number }): EdgeInsets {
    let safe: { x: number; y: number; width: number; height: number } | null = null;
    try {
      const rect = sys.getSafeAreaRect();
      if (rect) safe = { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    } catch {
      safe = null;
    }
    let menu: MenuButtonRect | null = null;
    let screen: { width: number; height: number } | null = null;
    try {
      const wx = (globalThis as { wx?: WxHost }).wx;
      if (wx?.getMenuButtonBoundingClientRect) {
        menu = wx.getMenuButtonBoundingClientRect();
        const info = wx.getWindowInfo?.() ?? wx.getSystemInfoSync?.();
        // 胶囊坐标相对屏幕左上角，优先用屏幕宽高，没有再退回窗口宽高。
        const width = info?.screenWidth || info?.windowWidth || 0;
        const height = info?.screenHeight || info?.windowHeight || 0;
        if (width > 0 && height > 0) {
          screen = { width, height };
          this.screenWidth = width;
        }
      }
    } catch {
      menu = null;
      screen = null;
    }
    return withMenuButton(size, safeAreaInsets(size, safe), menu, screen);
  }

  private layout(): void {
    const size = view.getVisibleSize();
    if (size.width < 2 || size.height < 2) return;
    const insets = this.readInsets(size);
    const cam = this.node.getChildByName("Camera")?.getComponent(Camera);
    if (cam) {
      cam.orthoHeight = size.height / 2;
      cam.clearColor = TABLE.backdrop;
    }
    const boardUi = this.board.getComponent(UITransform)!;
    boardUi.setContentSize(size.width, size.height);

    const bounds = this.gridBounds();
    const spanX = Math.max(1, bounds.maxX - bounds.minX + 1);
    const spanY = Math.max(1, bounds.maxY - bounds.minY + 1);
    const metrics = layoutPuzzle({
      visible: { width: size.width, height: size.height },
      insets,
      spanX,
      spanY,
      showTimer: this.game.timeLeft != null,
      showHint: this.game.hintVisible,
      showGuide: this.game.levelId <= 2,
      screenWidth: this.screenWidth ?? undefined,
    });
    this.cellSize = metrics.cellSize;
    this.hitRadius = metrics.hitRadius;
    this.armDistance = metrics.armDistance;
    this.tokenRadius = Math.max(8, metrics.tokenRadius);
    this.trackWidth = metrics.trackWidth;
    this.originX = (bounds.minX + bounds.maxX) / 2;
    this.originY = (bounds.minY + bounds.maxY) / 2;
    this.boardShiftY = metrics.boardShiftY;
    this.board.setPosition(metrics.shiftX, 0, 0);
    this.table.node.setPosition(metrics.table.x, 0, 0);
    this.table.getComponent(UITransform)!.setContentSize(size.width, size.height);
    this.paintTable(metrics.table);

    this.backdrop.getComponent(UITransform)!.setContentSize(size.width, size.height);
    this.paintBackdrop(size, metrics.title, metrics.fonts.title);
    this.applyLabel(this.title, metrics.title, metrics.fonts.title);
    if (metrics.timer) this.applyLabel(this.timer, metrics.timer, metrics.fonts.timer);
    this.applyLabel(this.toast, metrics.instruction, metrics.fonts.instruction);
    const buttonFont = metrics.fonts.button;
    for (let i = 0; i < metrics.buttonNames.length; i++) {
      const name = metrics.buttonNames[i];
      const box = metrics.buttons[i];
      const node = name === "undo" ? this.undoButton : name === "hint" ? this.hintButton : this.restartButton;
      this.applyButton(node, box, buttonFont, name);
    }

    const modalUi = this.modal.getComponent(UITransform)!;
    modalUi.setContentSize(size.width, size.height);
    this.modal.setPosition(0, 0, 0);
    const dim = this.modal.getComponent(Graphics)!;
    dim.clear();
    dim.fillColor = DIM;
    dim.rect(-size.width / 2, -size.height / 2, size.width, size.height);
    dim.fill();
    const panelWidth = metrics.modalTitle.width + 14;
    const panelTop = metrics.modalTitle.y + metrics.modalTitle.height / 2 + 24;
    const panelBottom = metrics.modalSecondary.y - metrics.modalSecondary.height / 2 - 22;
    dim.fillColor = BUTTON;
    dim.roundRect(-panelWidth / 2, panelBottom, panelWidth, panelTop - panelBottom, 36);
    dim.fill();
    dim.strokeColor = BUTTON_RIM;
    dim.lineWidth = 3;
    dim.roundRect(-panelWidth / 2, panelBottom, panelWidth, panelTop - panelBottom, 36);
    dim.stroke();
    this.applyLabel(this.modalTitle, metrics.modalTitle, metrics.fonts.modalTitle);
    this.applyLabel(this.modalBody, metrics.modalBody, metrics.fonts.modalBody);
    this.applyButton(this.modalA, metrics.modalPrimary, buttonFont);
    this.applyButton(this.modalB, metrics.modalSecondary, buttonFont);
    this.syncHud();
  }

  private gridBounds(): { minX: number; maxX: number; minY: number; maxY: number } {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    const push = (cell: Cell) => {
      minX = Math.min(minX, cell.x);
      maxX = Math.max(maxX, cell.x);
      minY = Math.min(minY, cell.y);
      maxY = Math.max(maxY, cell.y);
    };
    for (const line of this.game.lines) {
      for (const cell of lineCells(line)) push(cell);
    }
    if (!Number.isFinite(minX)) return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    return { minX, maxX, minY, maxY };
  }

  private toLocal(cell: Cell): Vec2 {
    const stamp = `${this.cellSize},${this.originX},${this.originY},${this.boardShiftY}`;
    if (stamp !== this.coordStamp) {
      this.coordCache.clear();
      this.coordStamp = stamp;
    }
    const key = `${cell.x},${cell.y}`;
    let point = this.coordCache.get(key);
    if (!point) {
      point = new Vec2(
        (cell.x - this.originX) * this.cellSize,
        (cell.y - this.originY) * this.cellSize + this.boardShiftY,
      );
      this.coordCache.set(key, point);
    }
    return point;
  }

  private levelLineCells(): Cell[][] {
    if (this.cachedLevelId !== this.game.levelId) {
      this.cachedLevelId = this.game.levelId;
      this.cachedLines = this.game.lines.map((line) => lineCells(line));
    }
    return this.cachedLines;
  }

  private boardFingerprint(): string {
    const parts = [
      String(this.game.levelId),
      String(this.cellSize),
      String(this.originX),
      String(this.originY),
      String(this.boardShiftY),
      this.game.highlightId ?? "",
      this.holdId ?? "",
      this.armed ? "armed" : "",
    ];
    for (const arrow of this.game.arrows) parts.push(arrow.id, String(arrow.x), String(arrow.y), arrow.dir);
    return parts.join(",");
  }

  private showsGhost(): boolean {
    return this.game.levelId === 1 && this.game.phase === "play" && !this.holdId && !this.anim && this.game.arrows.length === 1;
  }

  private syncHud(): void {
    const cleared = this.game.phase === "cleared";
    this.title.string = cleared ? "全部通过" : `第 ${this.game.levelId} 关`;
    if (this.game.timeLeft == null) {
      this.timer.node.active = false;
    } else {
      this.timer.node.active = true;
      this.timer.string = `${Math.ceil(this.game.timeLeft)} 秒`;
      this.timer.color = this.game.warnTime ? DANGER : GUIDE_INK;
    }
    const guide = this.game.tutorialText;
    if (guide && !this.toast.node.active) {
      this.toast.string = guide;
      this.toast.node.active = true;
    }
    this.hintButton.active = this.game.hintVisible && !this.modal.active;
  }

  private drawSpark(g: Graphics, x: number, y: number, r: number, color: Color): void {
    const waist = r * 0.27;
    g.fillColor = color;
    g.moveTo(x, y + r);
    g.lineTo(x + waist, y + waist);
    g.lineTo(x + r, y);
    g.lineTo(x + waist, y - waist);
    g.lineTo(x, y - r);
    g.lineTo(x - waist, y - waist);
    g.lineTo(x - r, y);
    g.lineTo(x - waist, y + waist);
    g.close();
    g.fill();
  }

  private paintBackdrop(size: { width: number; height: number }, title: Box, titleFont: number): void {
    const g = this.backdrop;
    g.clear();
    g.fillColor = TABLE.cloud;
    g.circle(-size.width * 0.56, size.height * 0.26, size.width * 0.24);
    g.fill();
    g.fillColor = TABLE.mint;
    g.circle(size.width * 0.55, -size.height * 0.27, size.width * 0.25);
    g.fill();
    this.drawSpark(g, size.width * 0.33, size.height * 0.27, 13, TABLE.cloud);
    this.drawSpark(g, -size.width * 0.32, -size.height * 0.26, 12, TABLE.mint);

    const width = Math.min(title.width, titleFont * 5.3);
    const height = title.height + 8;
    const left = title.x - width / 2;
    const bottom = title.y - height / 2;
    g.fillColor = TABLE.shadow;
    g.roundRect(left, bottom - 5, width, height, height / 2);
    g.fill();
    g.fillColor = BUTTON;
    g.roundRect(left, bottom, width, height, height / 2);
    g.fill();
    g.strokeColor = BUTTON_RIM;
    g.lineWidth = 2;
    g.roundRect(left, bottom, width, height, height / 2);
    g.stroke();
  }

  private paintTable(box: Box): void {
    const g = this.table;
    g.clear();
    const left = -box.width / 2;
    const bottom = box.y - box.height / 2;
    const corner = Math.min(48, box.height * 0.25);
    g.fillColor = TABLE.shadow;
    g.roundRect(left, bottom - 5, box.width, box.height, corner);
    g.fill();
    g.fillColor = TABLE.base;
    g.roundRect(left, bottom, box.width, box.height, corner);
    g.fill();
    g.fillColor = TABLE.edge;
    g.roundRect(left, bottom + 8, box.width, box.height - 8, corner);
    g.fill();
    g.strokeColor = TABLE.base;
    g.lineWidth = 3;
    g.roundRect(left, bottom + 8, box.width, box.height - 8, corner);
    g.stroke();
    g.fillColor = TABLE.face;
    g.roundRect(left + 11, bottom + 20, box.width - 22, box.height - 31, corner - 8);
    g.fill();
    g.strokeColor = TABLE.bevel;
    g.lineWidth = 2.5;
    g.roundRect(left + 11, bottom + 20, box.width - 22, box.height - 31, corner - 8);
    g.stroke();

    g.fillColor = TABLE.grain;
    for (let y = bottom + 37; y < bottom + box.height - 31; y += 28) {
      for (let x = left + 35; x < -left - 34; x += 28) g.circle(x, y, 1.8);
    }
    g.fill();

    g.lineCap = Graphics.LineCap.ROUND;
    const cached = this.levelLineCells();
    // 先画所有轨道的凹槽，再画槽内线，交叉处不会把另一条轨道切断。
    for (const [color, width] of [[TABLE.groove, this.trackWidth + 7], [TABLE.rail, this.trackWidth]] as const) {
      g.strokeColor = color;
      g.lineWidth = width;
      for (const cells of cached) {
        if (cells.length < 2) continue;
        const start = this.toLocal(cells[0]);
        const end = this.toLocal(cells[cells.length - 1]);
        g.moveTo(start.x, start.y);
        g.lineTo(end.x, end.y);
      }
      g.stroke();
    }
    for (let lineIndex = 0; lineIndex < cached.length; lineIndex++) {
      const cells = cached[lineIndex];
      const line = this.game.lines[lineIndex];
      if (!line || cells.length < 2) continue;
      this.drawTrackEnd(g, cells[0], cells[1], line.exitStart);
      this.drawTrackEnd(g, cells[cells.length - 1], cells[cells.length - 2], line.exitEnd);
    }
  }

  private redraw(): void {
    const g = this.gfx;
    g.clear();
    g.lineCap = Graphics.LineCap.ROUND;
    g.lineJoin = Graphics.LineJoin.ROUND;
    if (this.preview) this.drawPreview(g, this.preview);
    if (this.exitPulse) this.drawExitPulse(g, this.exitPulse.trace, this.exitPulse.elapsed / EXIT_PULSE_TIME);
    const anim = this.anim;
    const moving = anim ? this.animPoint(anim) : null;
    const blockerId = this.preview?.blockerId ?? (anim && anim.elapsed >= anim.duration ? anim.trace.blockerId : null);
    for (const arrow of this.game.arrows) {
      if (arrow.id === anim?.trace.arrowId && moving) {
        this.drawArrow(g, moving.x, moving.y, arrow.dir, true);
        continue;
      }
      const p = this.toLocal(arrow);
      const hinted = arrow.id === this.game.highlightId;
      const held = arrow.id === this.holdId;
      this.drawArrow(g, p.x, p.y, arrow.dir, held || hinted, held && this.armed);
      if (arrow.id === blockerId) this.drawTokenRing(g, p, DANGER);
      else if (held && this.armed) this.drawTokenRing(g, p, ACCENT);
      else if (hinted && !held) this.drawTokenRing(g, p, OPEN);
    }
    if (this.showsGhost()) this.drawGhost(g, this.game.arrows[0]);
  }

  private drawTrackEnd(g: Graphics, tip: Cell, inward: Cell, open: boolean): void {
    const dx = tip.x - inward.x;
    const dy = tip.y - inward.y;
    const p = this.toLocal(tip);
    const wing = this.trackWidth * 0.9 + 3;
    g.strokeColor = open ? OPEN : TABLE.stop;
    g.lineWidth = Math.max(4, Math.min(6, this.trackWidth * 0.55));
    if (open) {
      const length = this.cellSize * EXIT_MARK_LENGTH;
      for (const side of [-1, 1]) {
        g.moveTo(p.x - dy * wing * 0.52 * side, p.y + dx * wing * 0.52 * side);
        g.lineTo(p.x + dx * length - dy * wing * side, p.y + dy * length + dx * wing * side);
      }
    } else {
      const x = p.x + dx * this.trackWidth / 2;
      const y = p.y + dy * this.trackWidth / 2;
      g.moveTo(x - dy * wing, y + dx * wing);
      g.lineTo(x + dy * wing, y - dx * wing);
    }
    g.stroke();
  }

  private drawExitPulse(g: Graphics, trace: Trace, progress: number): void {
    const end = this.traceEndpoint(trace, true);
    const radius = Math.max(8, this.cellSize * (0.08 + progress * 0.13));
    EXIT_PULSE.a = Math.round(220 * (1 - progress));
    g.strokeColor = EXIT_PULSE;
    g.lineWidth = Math.max(2, this.trackWidth * 0.28);
    g.circle(end.x, end.y, radius);
    g.stroke();
  }

  private drawPreview(g: Graphics, trace: Trace): void {
    const start = this.toLocal(trace.points[0]);
    const end = this.traceEndpoint(trace, true);
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.hypot(dx, dy);
    if (length < 1) return;
    const ux = dx / length;
    const uy = dy / length;
    const blocked = trace.result !== "exit";
    g.strokeColor = blocked ? DANGER : this.armed ? ACCENT : OPEN;
    g.lineWidth = Math.max(3, this.cellSize * 0.06);
    const dash = Math.max(8, this.cellSize * 0.2);
    for (let offset = 0; offset < length; offset += dash * 1.65) {
      const stop = Math.min(length, offset + dash);
      g.moveTo(start.x + ux * offset, start.y + uy * offset);
      g.lineTo(start.x + ux * stop, start.y + uy * stop);
    }
    if (blocked) {
      const cap = Math.max(5, this.tokenRadius * 0.28);
      g.moveTo(end.x - uy * cap, end.y + ux * cap);
      g.lineTo(end.x + uy * cap, end.y - ux * cap);
    }
    g.stroke();
  }

  private tokenRimWidth(): number {
    return Math.max(2, this.tokenRadius * 0.14);
  }

  private drawTokenRing(g: Graphics, p: Vec2, color: Color): void {
    g.strokeColor = color;
    g.lineWidth = Math.max(4, this.tokenRadius * 0.12);
    g.circle(p.x, p.y, this.tokenRadius + Math.max(4, this.tokenRadius * 0.2));
    g.stroke();
  }

  private drawArrow(g: Graphics, x: number, y: number, dir: Dir, selected: boolean, armed = false): void {
    const d = dirVector(dir);
    const radius = this.tokenRadius;
    g.fillColor = TABLE.shadow;
    g.circle(x, y - Math.max(2, radius * 0.14), radius * 1.02);
    g.fill();
    g.fillColor = armed ? TOKEN_HOT : selected ? TOKEN_SELECTED : TOKEN;
    g.circle(x, y, radius);
    g.fill();
    g.strokeColor = armed ? ACCENT : selected ? OPEN : TOKEN_RIM;
    g.lineWidth = this.tokenRimWidth();
    g.circle(x, y, radius);
    g.stroke();
    g.fillColor = TOKEN_INNER;
    g.ellipse(x - radius * 0.23, y + radius * 0.69, radius * 0.28, radius * 0.085);
    g.fill();
    const len = radius * 0.79;
    const head = radius * 0.71;
    const ink = armed ? TOKEN_HOT_INK : TOKEN_ARROW;
    g.strokeColor = ink;
    g.lineWidth = Math.max(3, radius * 0.34);
    g.moveTo(x - d.x * radius * 0.57, y - d.y * radius * 0.57);
    g.lineTo(x + d.x * len * 0.45, y + d.y * len * 0.45);
    g.stroke();
    const px = -d.y;
    const py = d.x;
    const tipX = x + d.x * len;
    const tipY = y + d.y * len;
    g.fillColor = ink;
    g.moveTo(tipX, tipY);
    g.lineTo(tipX - d.x * head + px * head * 0.58, tipY - d.y * head + py * head * 0.58);
    g.lineTo(tipX - d.x * head - px * head * 0.58, tipY - d.y * head - py * head * 0.58);
    g.close();
    g.fill();
  }

  private drawGhost(g: Graphics, arrow: ArrowDef): void {
    const origin = this.toLocal(arrow);
    const d = dirVector(arrow.dir);
    const phase = (this.ghost % 1.8) / 1.8;
    const t = Math.min(1, phase / 0.82);
    const distance = this.cellSize * (0.15 + 0.52 * t);
    const x = origin.x + d.x * distance;
    const y = origin.y + d.y * distance - this.tokenRadius * 0.28;
    const size = Math.max(16, this.tokenRadius * 0.63);
    g.strokeColor = GHOST;
    g.lineWidth = Math.max(2, size * 0.06);
    g.circle(x, y + size * 0.55, size * 0.29);
    g.stroke();
    g.fillColor = BUTTON;
    this.drawHandPath(g, x, y, size);
    g.fill();
    g.strokeColor = TOKEN_RIM;
    g.lineWidth = Math.max(2.5, size * 0.085);
    this.drawHandPath(g, x, y, size);
    g.stroke();
  }

  private drawHandPath(g: Graphics, x: number, y: number, s: number): void {
    g.moveTo(x - s * 0.14, y - s * 0.13);
    g.lineTo(x - s * 0.14, y + s * 0.48);
    g.bezierCurveTo(x - s * 0.14, y + s * 0.68, x + s * 0.18, y + s * 0.68, x + s * 0.18, y + s * 0.48);
    g.lineTo(x + s * 0.18, y + s * 0.08);
    g.bezierCurveTo(x + s * 0.51, y + s * 0.08, x + s * 0.64, y - s * 0.12, x + s * 0.54, y - s * 0.42);
    g.bezierCurveTo(x + s * 0.49, y - s * 0.59, x + s * 0.31, y - s * 0.66, x + s * 0.1, y - s * 0.63);
    g.bezierCurveTo(x - s * 0.09, y - s * 0.61, x - s * 0.25, y - s * 0.44, x - s * 0.41, y - s * 0.25);
    g.bezierCurveTo(x - s * 0.53, y - s * 0.1, x - s * 0.34, y + s * 0.02, x - s * 0.23, y - s * 0.07);
    g.close();
  }

  private onTouchStart(event: EventTouch): void {
    if (this.modal.active || this.anim || this.settling || this.game.phase !== "play") return;
    if (this.activeTouch != null) return;
    this.activeTouch = event.getID();
    const point = this.touchPoint(event);
    const id = this.pickArrow(point);
    if (!id) return;
    this.holdId = id;
    this.holdStart.set(point);
    this.armed = false;
    this.game.setFingerDown(true);
    this.preview = this.game.preview(id);
  }

  private onTouchMove(event: EventTouch): void {
    if (event.getID() !== this.activeTouch || !this.holdId) return;
    const arrow = this.game.arrows.find((item) => item.id === this.holdId);
    if (!arrow) return;
    const point = this.touchPoint(event);
    const d = dirVector(arrow.dir);
    const along = (point.x - this.holdStart.x) * d.x + (point.y - this.holdStart.y) * d.y;
    this.armed = along > this.armDistance;
  }

  private onTouchEnd(event: EventTouch): void {
    if (event.getID() !== this.activeTouch) return;
    const id = this.armed ? this.holdId : null;
    this.clearTouch();
    if (id) this.launch(id);
  }

  private onTouchCancel(event: EventTouch): void {
    if (event.getID() === this.activeTouch) this.clearTouch();
  }

  private clearTouch(): void {
    this.activeTouch = null;
    this.holdId = null;
    this.armed = false;
    this.preview = null;
    this.game.setFingerDown(false);
  }

  private touchPoint(event: EventTouch): Vec2 {
    const ui = event.getUILocation(this.touchUi);
    this.touchWorld.set(ui.x, ui.y, 0);
    this.board.getComponent(UITransform)!.convertToNodeSpaceAR(this.touchWorld, this.touchLocal3);
    this.touchLocal.set(this.touchLocal3.x, this.touchLocal3.y);
    return this.touchLocal;
  }

  private pickArrow(point: Vec2): string | null {
    let best: string | null = null;
    let bestDist = this.hitRadius;
    for (const arrow of this.game.arrows) {
      const p = this.toLocal(arrow);
      const dist = Math.hypot(p.x - point.x, p.y - point.y);
      if (dist < bestDist) {
        bestDist = dist;
        best = arrow.id;
      }
    }
    return best;
  }

  private launch(id: string): void {
    const trace = this.game.beginSlide(id);
    if (!trace) return;
    const start = this.toLocal(trace.points[0]);
    const end = this.traceEndpoint(trace, false);
    const length = Math.hypot(end.x - start.x, end.y - start.y);
    const duration = Math.max(0.12, length / 900);
    this.anim = { trace, duration, elapsed: 0 };
  }

  private stepAnim(dt: number): void {
    if (!this.anim) return;
    this.anim.elapsed += dt;
    const limit = this.anim.trace.result === "exit" ? this.anim.duration : this.anim.duration * 2;
    if (this.anim.elapsed < limit) return;
    const trace = this.anim.trace;
    const result = this.game.commitSlide();
    this.anim = null;
    this.layout();
    if (result.firstBounce && this.game.bounceTip) this.flashToast(this.game.bounceTip);
    if (result.outcome === "win") {
      this.exitPulse = { trace, elapsed: 0 };
      void this.settleWin();
      return;
    }
    if (result.stuck) this.scheduleOnce(this.showStuckToast, 1);
    if (this.game.phase === "timeout") this.openTimeout();
  }

  private traceEndpoint(trace: Trace, preview: boolean): Vec2 {
    const start = this.toLocal(trace.points[0]);
    const end = this.toLocal(trace.points[trace.points.length - 1]);
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.hypot(dx, dy);
    const edge = this.tokenRadius + this.tokenRimWidth() / 2;
    // 预览指到障碍边缘。动画还要给滑行的圆牌留出自身半径。
    let inset = preview ? this.cellSize * (1 - EXIT_MARK_LENGTH) : 0;
    if (trace.result === "arrow") inset = preview ? edge : edge * 2;
    if (trace.result === "wall") {
      // 规则轨迹的墙在轨道外一格，画面上以轨道末端为界。
      inset = this.cellSize - this.trackWidth / 2 + (preview ? 0 : edge);
    }
    const t = distance === 0 ? 0 : Math.max(0, 1 - inset / distance);
    this.traceEndOut.set(start.x + dx * t, start.y + dy * t);
    return this.traceEndOut;
  }

  private animPoint(anim: Anim): Vec2 {
    const start = this.toLocal(anim.trace.points[0]);
    const end = this.traceEndpoint(anim.trace, false);
    const progress = anim.elapsed / anim.duration;
    const t = progress <= 1 ? progress : Math.max(0, 2 - progress);
    this.animPointOut.set(start.x + (end.x - start.x) * t, start.y + (end.y - start.y) * t);
    return this.animPointOut;
  }

  private showStuckToast = (): void => {
    if (this.game.stuck && this.game.phase === "play") this.flashToast("好像卡住了，可以撤销或重开");
  };

  private flashToast(text: string): void {
    this.toast.string = text;
    this.toast.node.active = true;
    this.unschedule(this.hideToast);
    this.scheduleOnce(this.hideToast, 1.6);
  }

  private hideToast = (): void => {
    if (this.game.tutorialText) {
      this.toast.string = this.game.tutorialText;
      this.toast.node.active = true;
      return;
    }
    this.toast.node.active = false;
  };

  private setRestartEnabled(enabled: boolean): void {
    this.restartEnabled = enabled;
    if (!this.restartButton?.isValid) return;
    const opacity = this.restartButton.getComponent(UIOpacity) ?? this.restartButton.addComponent(UIOpacity);
    opacity.opacity = enabled ? 255 : 110;
  }

  /**
   * 通关后约 0.8 秒才 advance。这段时间重开按钮关掉。
   * 若仍然重开，先作废这一次结算，advance 看到 winReady 已清就返回 not-won。
   */
  private async settleWin(): Promise<void> {
    if (this.settling) return;
    this.settling = true;
    const token = ++this.settleToken;
    this.setRestartEnabled(false);
    this.flashToast("完成");
    try {
      await this.wait(0.8);
      if (!this.settleAlive(token)) return;
      const decision = this.game.interstitialDecision();
      if (decision.show) {
        await this.playInterstitial();
        if (!this.settleAlive(token)) return;
        this.game.markAdShown();
      }
      if (!this.settleAlive(token)) return;
      const next = this.game.advance();
      if (next === "not-won") return;
      this.hideToast();
      this.layout();
      if (next === "done") {
        this.showModal("全部通过", "60 关都拔完了。", "再来一局", () => {
          this.hideModal();
          this.cancelPendingSettle();
          this.game.replayFromStart();
          this.layout();
        }, null, null);
      }
    } finally {
      if (token === this.settleToken) {
        this.settling = false;
        this.setRestartEnabled(true);
      }
    }
  }

  private settleAlive(token: number): boolean {
    return token === this.settleToken && this.settling;
  }

  private cancelPendingSettle(): void {
    this.settleToken += 1;
    this.settling = false;
    const wake = this.settleWait;
    this.settleWait = null;
    if (wake) {
      this.unschedule(wake);
      wake();
    }
    this.setRestartEnabled(true);
  }

  private wait(seconds: number): Promise<void> {
    return new Promise((resolve) => {
      let settled = false;
      const wake = () => {
        if (settled) return;
        settled = true;
        if (this.settleWait === wake) this.settleWait = null;
        resolve();
      };
      this.settleWait = wake;
      this.scheduleOnce(wake, seconds);
    });
  }

  private onRestart(): void {
    if (this.settling || !this.restartEnabled) return;
    this.cancelPendingSettle();
    this.hideModal();
    this.game.restart();
    this.anim = null;
    this.exitPulse = null;
    this.clearTouch();
    this.layout();
  }

  private openTimeout(): void {
    if (this.modal.active || this.settling) return;
    this.showTimeoutModal();
  }

  private showTimeoutModal(): void {
    if (this.game.reviveLeft <= 0) {
      this.showModal("时间到了", "本关加时次数已用完", "重开", () => this.onRestart(), null, null);
      return;
    }
    this.showModal(
      "时间到了",
      `还可以加时 ${this.game.reviveLeft} 次`,
      "加时 +20 秒",
      () => void this.onRevive(),
      "重开",
      () => this.onRestart(),
    );
  }

  private async onRevive(): Promise<void> {
    const prepared = this.game.prepareRevive();
    if (prepared.action === "capped") {
      this.showTimeoutModal();
      return;
    }
    if (prepared.action !== "need-ad") {
      this.flashToast(this.denyText(prepared));
      return;
    }
    const watched = await this.watchRewarded();
    if (watched === "unavailable") return;
    const result = this.game.finishRevive(watched);
    if (!result.granted) {
      this.flashToast(result.reason === "not-ended" ? "需要看完才能获得" : "加时没有生效");
      this.openTimeout();
      return;
    }
    this.hideModal();
  }

  private async onUndo(): Promise<void> {
    if (this.modal.active || this.anim || this.settling) return;
    const prepared = this.game.prepareUndo();
    if (prepared.action === "free") {
      this.game.finishUndo(null);
      this.layout();
      return;
    }
    if (prepared.action !== "need-ad") {
      this.flashToast(this.denyText(prepared));
      return;
    }
    const watched = await this.watchRewarded();
    if (watched === "unavailable") return;
    const result = this.game.finishUndo(watched);
    if (!result.granted) this.flashToast(result.reason === "not-ended" ? "需要看完才能获得" : "撤销没有生效");
    this.layout();
  }

  private async onHint(): Promise<void> {
    if (this.modal.active || this.anim || this.settling) return;
    const prepared = this.game.prepareHint();
    if (prepared.action === "free") {
      this.game.finishHint(null);
      return;
    }
    if (prepared.action === "unsolvable") {
      this.flashToast("这一步解不开了，撤销或重开吧");
      return;
    }
    if (prepared.action !== "need-ad") {
      this.flashToast(this.denyText(prepared));
      return;
    }
    const watched = await this.watchRewarded();
    if (watched === "unavailable") return;
    const result = this.game.finishHint(watched);
    if (!result.granted) this.flashToast(result.reason === "not-ended" ? "需要看完才能获得" : "提示没有生效");
  }

  private denyText(prepared: PrepareResult): string {
    switch (prepared.reason) {
      case "cooldown":
        return "请稍后再看广告";
      case "tutorial":
        return "前两关没有广告";
      case "finger":
      case "sliding":
        return "等这步结束再试";
      case "phase":
        return "现在不能这样做";
      default:
        break;
    }
    switch (prepared.action) {
      case "empty":
        return "没有可以撤销的一步";
      case "capped":
        return "本关次数已用完";
      case "hidden":
        return "这一关还没有提示";
      default:
        return "现在不能这样做";
    }
  }

  private watchRewarded(): Promise<{ isEnded: boolean } | "unavailable"> {
    return new Promise((resolve) => {
      void showRewarded().then((result) => {
        if (result === "no-wx") {
          this.showModal(
            "模拟激励视频",
            "当前不是微信环境。看完才发奖，中途关闭不发奖。",
            "看完",
            () => {
              this.hideModal();
              resolve({ isEnded: true });
            },
            "关闭",
            () => {
              this.hideModal();
              resolve({ isEnded: false });
            },
          );
          return;
        }
        if (result.kind === "closed") {
          resolve({ isEnded: result.isEnded });
          return;
        }
        this.flashToast("广告暂时不能播放");
        resolve("unavailable");
      });
    });
  }

  private playInterstitial(): Promise<void> {
    return new Promise((resolve) => {
      void showInterstitial().then((result) => {
        if (result === "unconfigured" || result === "failed") {
          this.flashToast("广告暂时不能播放");
          resolve();
          return;
        }
        if (result === "shown") {
          resolve();
          return;
        }
        this.showModal("模拟插屏", "正式包会在这里播放微信插屏。", "继续", () => {
          this.hideModal();
          resolve();
        }, null, null);
      });
    });
  }

  private showModal(
    title: string,
    body: string,
    aText: string,
    aAction: () => void,
    bText: string | null,
    bAction: (() => void) | null,
  ): void {
    this.clearTouch();
    this.modalTitle.string = title;
    this.modalBody.string = body;
    this.modalALabel.string = aText;
    this.modalActionA = aAction;
    this.modalB.active = bText != null;
    if (bText) this.modalBLabel.string = bText;
    this.modalActionB = bAction;
    this.modal.active = true;
    this.hintButton.active = false;
  }

  private hideModal(): void {
    this.modal.active = false;
    this.modalActionA = null;
    this.modalActionB = null;
    this.hintButton.active = this.game.hintVisible;
  }
}
