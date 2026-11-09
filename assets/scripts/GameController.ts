import {
  _decorator,
  BlockInputEvents,
  Camera,
  Color,
  Component,
  EventTouch,
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
import { layoutPuzzle } from "./core/layout";
import { safeAreaInsets, withMenuButton, type EdgeInsets, type MenuButtonRect } from "./core/safe-area";
import { lineCells } from "./core/trace";
import type { ArrowDef, Cell, Dir, LevelBank, Trace } from "./core/types";
import { showInterstitial, showRewarded } from "./WxAds";

const { ccclass } = _decorator;

const PATH = new Color(198, 208, 220, 255);
const ACCENT = new Color(242, 193, 78, 255);
const INK = new Color(244, 246, 250, 255);
const MUTED = new Color(154, 162, 178, 255);
const DANGER = new Color(232, 112, 96, 255);
const BUTTON = new Color(38, 44, 60, 255);
const DIM = new Color(6, 8, 14, 188);
const GHOST = new Color(242, 193, 78, 90);
const PREVIEW_COLOR = ACCENT.clone();
const TOKEN = new Color(44, 52, 70, 255);
const TOKEN_HOT = new Color(78, 62, 34, 255);
const TOKEN_RIM = new Color(186, 196, 214, 255);

const DIR_VECTOR: Record<Dir, Vec2> = {
  E: new Vec2(1, 0),
  W: new Vec2(-1, 0),
  N: new Vec2(0, 1),
  S: new Vec2(0, -1),
};

interface Anim {
  id: string;
  points: Vec2[];
  duration: number;
  elapsed: number;
  bounce: boolean;
}

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
  private preview: Trace | null = null;
  private holdId: string | null = null;
  private holdStart = new Vec2();
  private armed = false;
  private activeTouch: number | null = null;
  private blink = 0;
  private settling = false;
  private settleToken = 0;
  private settleWait: (() => void) | null = null;
  private ghost = 0;
  private drawnFingerprint = "";
  private cachedLevelId = -1;
  private cachedLines: Cell[][] = [];
  private coordCache = new Map<string, Vec2>();
  private coordStamp = "";
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
    this.board.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    view.setResizeCallback(() => this.layout());
  }

  start(): void {
    this.layout();
    this.scheduleOnce(() => this.layout(), 0);
  }

  onDestroy(): void {
    this.cancelPendingSettle();
    view.setResizeCallback(() => undefined);
  }

  update(dt: number): void {
    this.blink += dt;
    this.ghost += dt;
    const tick = this.game.tick(dt);
    if (tick.timedOut) this.openTimeout();
    if (this.anim) this.stepAnim(dt);
    // 静止棋盘不每帧清掉重画。预览闪烁、滑行和第一关虚影才需要连帧。
    const motion = this.anim != null || this.preview != null || this.showsGhost();
    const fingerprint = motion ? null : this.boardFingerprint();
    if (motion || fingerprint !== this.drawnFingerprint) {
      this.redraw();
      this.drawnFingerprint = fingerprint ?? "";
    }
    this.syncHud();
  }

  private buildUi(): void {
    this.board = uiNode("Board");
    this.board.addComponent(UITransform);
    this.node.addChild(this.board);
    this.gfx = this.board.addComponent(Graphics);

    this.title = this.makeLabel("Title", 40, INK);
    this.timer = this.makeLabel("Timer", 32, ACCENT);
    this.toast = this.makeLabel("Toast", 28, INK);
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
    label.string = text;
    label.node.getComponent(UITransform)!.setContentSize(width, 68);
    label.node.setPosition(0, 0, 0);
    return node;
  }

  private paintButton(g: Graphics, width: number, height: number): void {
    g.clear();
    g.fillColor = BUTTON;
    const radius = Math.min(18, height * 0.28);
    g.roundRect(-width / 2, -height / 2, width, height, radius);
    g.fill();
    g.strokeColor = ACCENT;
    g.lineWidth = 2;
    g.roundRect(-width / 2, -height / 2, width, height, radius);
    g.stroke();
  }

  private applyLabel(label: Label, box: { x: number; y: number; width: number; height: number }, font: number): void {
    const size = Math.round(font);
    label.fontSize = size;
    label.lineHeight = size + 8;
    const ui = label.node.getComponent(UITransform)!;
    ui.setContentSize(box.width, box.height);
    label.node.setPosition(box.x, box.y, 0);
  }

  private applyButton(node: Node, box: { x: number; y: number; width: number; height: number }, font: number): void {
    node.setPosition(box.x, box.y, 0);
    const ui = node.getComponent(UITransform)!;
    ui.setContentSize(box.width, box.height);
    const graphics = node.getComponent(Graphics);
    if (graphics) this.paintButton(graphics, box.width, box.height);
    const label = node.getComponentInChildren(Label);
    if (!label) return;
    const size = Math.round(font);
    label.fontSize = size;
    label.lineHeight = size + 6;
    label.node.getComponent(UITransform)!.setContentSize(box.width, box.height);
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
    if (cam) cam.orthoHeight = size.height / 2;
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
      screenWidth: this.screenWidth ?? undefined,
    });
    this.cellSize = metrics.cellSize;
    this.hitRadius = metrics.hitRadius;
    this.armDistance = metrics.armDistance;
    this.tokenRadius = metrics.tokenRadius;
    this.trackWidth = metrics.trackWidth;
    this.originX = (bounds.minX + bounds.maxX) / 2;
    this.originY = (bounds.minY + bounds.maxY) / 2;
    this.boardShiftY = metrics.boardShiftY;
    this.board.setPosition(metrics.shiftX, 0, 0);

    this.applyLabel(this.title, metrics.title, metrics.fonts.title);
    if (metrics.timer) this.applyLabel(this.timer, metrics.timer, metrics.fonts.timer);
    this.applyLabel(this.toast, metrics.instruction, metrics.fonts.instruction);
    const buttonFont = metrics.fonts.button;
    for (let i = 0; i < metrics.buttonNames.length; i++) {
      const name = metrics.buttonNames[i];
      const box = metrics.buttons[i];
      const node = name === "undo" ? this.undoButton : name === "hint" ? this.hintButton : this.restartButton;
      this.applyButton(node, box, buttonFont);
    }

    const modalUi = this.modal.getComponent(UITransform)!;
    modalUi.setContentSize(size.width, size.height);
    this.modal.setPosition(0, 0, 0);
    const dim = this.modal.getComponent(Graphics)!;
    dim.clear();
    dim.fillColor = DIM;
    dim.rect(-size.width / 2, -size.height / 2, size.width, size.height);
    dim.fill();
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
    ];
    for (const arrow of this.game.arrows) parts.push(arrow.id, String(arrow.x), String(arrow.y), arrow.dir);
    return parts.join(",");
  }

  private showsGhost(): boolean {
    return this.game.levelId === 1 && this.game.phase === "play" && !this.anim && this.game.arrows.length === 1;
  }

  private syncHud(): void {
    const cleared = this.game.phase === "cleared";
    this.title.string = cleared ? "全部通过" : `第 ${this.game.levelId} 关`;
    if (this.game.timeLeft == null) {
      this.timer.node.active = false;
    } else {
      this.timer.node.active = true;
      this.timer.string = `${Math.ceil(this.game.timeLeft)} 秒`;
      this.timer.color = this.game.warnTime ? DANGER : ACCENT;
    }
    const guide = this.game.tutorialText;
    if (guide && !this.toast.node.active) {
      this.toast.string = guide;
      this.toast.node.active = true;
    }
    this.hintButton.active = this.game.hintVisible && !this.modal.active;
  }

  private redraw(): void {
    const g = this.gfx;
    g.clear();
    g.lineCap = Graphics.LineCap.ROUND;
    g.lineJoin = Graphics.LineJoin.ROUND;
    const cached = this.levelLineCells();
    for (let lineIndex = 0; lineIndex < cached.length; lineIndex++) {
      const cells = cached[lineIndex];
      const line = this.game.lines[lineIndex];
      if (!line || cells.length === 0) continue;
      g.strokeColor = PATH;
      g.lineWidth = this.trackWidth;
      const first = this.toLocal(cells[0]);
      g.moveTo(first.x, first.y);
      for (let i = 1; i < cells.length; i++) {
        const p = this.toLocal(cells[i]);
        g.lineTo(p.x, p.y);
      }
      g.stroke();
      this.drawExitCap(g, cells, line.exitStart, "start");
      this.drawExitCap(g, cells, line.exitEnd, "end");
    }

    if (this.preview) this.drawPreview(g, this.preview);
    const moving = this.anim ? this.animPoint(this.anim) : null;
    for (const arrow of this.game.arrows) {
      if (this.anim && arrow.id === this.anim.id && moving) {
        const squash = this.anim.bounce && this.animFraction(this.anim) > 0.42 && this.animFraction(this.anim) < 0.62;
        this.drawArrow(g, moving.x, moving.y, arrow.dir, squash ? 0.82 : 1, true);
        continue;
      }
      const p = this.toLocal(arrow);
      const hot = arrow.id === this.holdId || arrow.id === this.game.highlightId;
      this.drawArrow(g, p.x, p.y, arrow.dir, 1, hot);
    }
    if (this.showsGhost()) this.drawGhost(g, this.game.arrows[0]);
  }

  private drawExitCap(g: Graphics, cells: Cell[], open: boolean, which: "start" | "end"): void {
    if (!open || cells.length < 2) return;
    const tip = which === "end" ? cells[cells.length - 1] : cells[0];
    const inward = which === "end" ? cells[cells.length - 2] : cells[1];
    const dx = tip.x - inward.x;
    const dy = tip.y - inward.y;
    if (dx === 0 && dy === 0) return;
    const p = this.toLocal(tip);
    const len = this.cellSize * 0.22;
    g.strokeColor = ACCENT;
    g.lineWidth = Math.max(2, this.cellSize * 0.04);
    g.moveTo(p.x, p.y);
    g.lineTo(p.x + dx * len, p.y + dy * len);
    g.stroke();
  }

  private drawPreview(g: Graphics, trace: Trace): void {
    const points = trace.points.map((cell) => this.toLocal(cell));
    const alpha = trace.result === "exit" ? 230 : Math.round(140 + 100 * Math.abs(Math.sin(this.blink * 8)));
    PREVIEW_COLOR.a = alpha;
    g.strokeColor = PREVIEW_COLOR;
    g.lineWidth = Math.max(3, this.cellSize * 0.06);
    const dash = Math.max(8, this.cellSize * 0.2);
    const gap = dash * 0.65;
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i];
      const b = points[i + 1];
      const len = Math.hypot(b.x - a.x, b.y - a.y);
      if (len < 1) continue;
      const ux = (b.x - a.x) / len;
      const uy = (b.y - a.y) / len;
      let walked = 0;
      while (walked < len) {
        const end = Math.min(len, walked + dash);
        g.moveTo(a.x + ux * walked, a.y + uy * walked);
        g.lineTo(a.x + ux * end, a.y + uy * end);
        walked = end + gap;
      }
    }
    g.stroke();
    if (trace.hit) {
      const hit = this.toLocal(trace.hit);
      g.fillColor = PREVIEW_COLOR;
      g.circle(hit.x, hit.y, this.cellSize * 0.12);
      g.fill();
    }
  }

  private drawArrow(g: Graphics, x: number, y: number, dir: Dir, scale: number, hot: boolean): void {
    const d = dirVector(dir);
    const radius = Math.max(8, this.tokenRadius * scale);
    g.fillColor = hot ? TOKEN_HOT : TOKEN;
    g.circle(x, y, radius);
    g.fill();
    g.strokeColor = hot ? ACCENT : TOKEN_RIM;
    g.lineWidth = Math.max(2, radius * 0.14);
    g.circle(x, y, radius);
    g.stroke();
    const len = radius * 1.35;
    const head = radius * 0.78;
    const ink = hot ? ACCENT : INK;
    g.strokeColor = ink;
    g.lineWidth = Math.max(3, radius * 0.32);
    g.moveTo(x - d.x * len * 0.2, y - d.y * len * 0.2);
    g.lineTo(x + d.x * len * 0.72, y + d.y * len * 0.72);
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
    const t = (Math.sin(this.ghost * 2.2) + 1) / 2;
    const x = origin.x + d.x * this.cellSize * 0.55 * t;
    const y = origin.y + d.y * this.cellSize * 0.55 * t;
    g.fillColor = GHOST;
    g.circle(x, y, Math.max(8, this.tokenRadius * 0.55));
    g.fill();
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
    const id = this.holdId;
    const launch = this.armed;
    this.activeTouch = null;
    this.holdId = null;
    this.armed = false;
    this.preview = null;
    this.game.setFingerDown(false);
    if (id && launch) this.launch(id);
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
    const points = trace.points.map((cell) => {
      const local = this.toLocal(cell);
      return new Vec2(local.x, local.y);
    });
    let length = 0;
    for (let i = 1; i < points.length; i++) length += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
    const duration = Math.max(0.12, length / 900);
    this.anim = { id, points, duration, elapsed: 0, bounce: trace.result !== "exit" };
  }

  private stepAnim(dt: number): void {
    if (!this.anim) return;
    this.anim.elapsed += dt;
    const limit = this.anim.bounce ? this.anim.duration * 2 : this.anim.duration;
    if (this.anim.elapsed < limit) return;
    const result = this.game.commitSlide();
    this.anim = null;
    this.layout();
    if (result.firstBounce && this.game.bounceTip) this.flashToast(this.game.bounceTip);
    if (result.outcome === "win") {
      void this.settleWin();
      return;
    }
    if (result.stuck) this.scheduleOnce(this.showStuckToast, 1);
    if (this.game.phase === "timeout") this.openTimeout();
  }

  private animFraction(anim: Anim): number {
    const limit = anim.bounce ? anim.duration * 2 : anim.duration;
    return Math.min(1, anim.elapsed / Math.max(0.01, limit));
  }

  private animPoint(anim: Anim): Vec2 {
    const span = Math.max(1, anim.points.length - 1);
    let t = this.animFraction(anim);
    if (anim.bounce) t = t <= 0.5 ? t * 2 : (1 - t) * 2;
    const dist = t * span;
    const index = Math.min(span - 1, Math.floor(dist));
    const local = dist - index;
    const a = anim.points[index];
    const b = anim.points[index + 1] ?? a;
    this.animPointOut.set(a.x + (b.x - a.x) * local, a.y + (b.y - a.y) * local);
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
    this.preview = null;
    this.holdId = null;
    this.armed = false;
    this.activeTouch = null;
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
