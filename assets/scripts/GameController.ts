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
  UITransform,
  Vec2,
  Vec3,
  view,
} from "cc";
import { Game, type PrepareResult } from "./core/game";
import { LEVEL_PACK } from "./core/level-pack";
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

interface Anim {
  id: string;
  points: Vec2[];
  duration: number;
  elapsed: number;
  bounce: boolean;
}

function uiNode(name: string): Node {
  const node = new Node(name);
  node.layer = Layers.Enum.UI_2D;
  return node;
}

function dirVector(dir: Dir): Vec2 {
  switch (dir) {
    case "E":
      return new Vec2(1, 0);
    case "W":
      return new Vec2(-1, 0);
    case "N":
      return new Vec2(0, 1);
    default:
      return new Vec2(0, -1);
  }
}

@ccclass("GameController")
export class GameController extends Component {
  private game!: Game;
  private board!: Node;
  private gfx!: Graphics;
  private title!: Label;
  private timer!: Label;
  private toast!: Label;
  private hintButton!: Node;
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
  private ghost = 0;

  onLoad(): void {
    const bank: LevelBank = {
      maxId: LEVEL_PACK.length,
      get: (id) => {
        const level = LEVEL_PACK.find((item) => item.id === id);
        if (!level) throw new Error(`missing level ${id}`);
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
    view.setResizeCallback(() => undefined);
  }

  update(dt: number): void {
    this.blink += dt;
    this.ghost += dt;
    const tick = this.game.tick(dt);
    if (tick.timedOut) this.openTimeout();
    if (this.anim) this.stepAnim(dt);
    this.redraw();
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
    this.toast.node.active = false;

    const undo = this.makeButton("Undo", "撤销", 150);
    const hint = this.makeButton("Hint", "提示", 150);
    const restart = this.makeButton("Restart", "重开", 150);
    this.hintButton = hint;
    undo.on(Node.EventType.TOUCH_END, () => this.onUndo(), this);
    hint.on(Node.EventType.TOUCH_END, () => this.onHint(), this);
    restart.on(Node.EventType.TOUCH_END, () => {
      this.hideModal();
      this.game.restart();
      this.settling = false;
      this.anim = null;
      this.preview = null;
      this.layout();
    }, this);

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
    g.roundRect(-width / 2, -height / 2, width, height, 14);
    g.fill();
    g.strokeColor = ACCENT;
    g.lineWidth = 2;
    g.roundRect(-width / 2, -height / 2, width, height, 14);
    g.stroke();
  }

  private layout(): void {
    const size = view.getVisibleSize();
    const cam = this.node.getChildByName("Camera")?.getComponent(Camera);
    if (cam) cam.orthoHeight = size.height / 2;
    const boardUi = this.board.getComponent(UITransform)!;
    boardUi.setContentSize(size.width, size.height);
    this.board.setPosition(0, 0, 0);

    const bounds = this.gridBounds();
    const spanX = Math.max(1, bounds.maxX - bounds.minX + 1);
    const spanY = Math.max(1, bounds.maxY - bounds.minY + 1);
    this.cellSize = Math.min(92, (size.width * 0.84) / spanX, (size.height * 0.52) / spanY);
    this.originX = (bounds.minX + bounds.maxX) / 2;
    this.originY = (bounds.minY + bounds.maxY) / 2;
    this.boardShiftY = size.height * 0.04;

    this.title.node.setPosition(0, size.height / 2 - 78, 0);
    this.timer.node.setPosition(0, size.height / 2 - 128, 0);
    this.toast.node.setPosition(0, -size.height / 2 + 210, 0);
    const y = -size.height / 2 + 96;
    const gap = Math.min(180, size.width * 0.24);
    this.node.getChildByName("Undo")?.setPosition(-gap, y, 0);
    this.hintButton.setPosition(0, y, 0);
    this.node.getChildByName("Restart")?.setPosition(gap, y, 0);
    this.hintButton.active = this.game.hintVisible;

    const modalUi = this.modal.getComponent(UITransform)!;
    modalUi.setContentSize(size.width, size.height);
    this.modal.setPosition(0, 0, 0);
    const dim = this.modal.getComponent(Graphics)!;
    dim.clear();
    dim.fillColor = new Color(6, 8, 14, 188);
    dim.rect(-size.width / 2, -size.height / 2, size.width, size.height);
    dim.fill();
    this.modalTitle.node.setPosition(0, 70, 0);
    this.modalBody.node.setPosition(0, 10, 0);
    this.modalA.setPosition(0, -70, 0);
    this.modalB.setPosition(0, -150, 0);
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
    return new Vec2((cell.x - this.originX) * this.cellSize, (cell.y - this.originY) * this.cellSize + this.boardShiftY);
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
    for (const line of this.game.lines) {
      const cells = lineCells(line);
      if (cells.length === 0) continue;
      g.strokeColor = PATH;
      g.lineWidth = Math.max(8, this.cellSize * 0.16);
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
    if (this.game.levelId === 1 && this.game.phase === "play" && !this.anim && this.game.arrows.length === 1) {
      this.drawGhost(g, this.game.arrows[0]);
    }
  }

  private drawExitCap(g: Graphics, cells: Cell[], open: boolean, which: "start" | "end"): void {
    if (!open || cells.length < 2) return;
    const tip = which === "end" ? cells[cells.length - 1] : cells[0];
    const inward = which === "end" ? cells[cells.length - 2] : cells[1];
    const dx = tip.x - inward.x;
    const dy = tip.y - inward.y;
    if (dx === 0 && dy === 0) return;
    const p = this.toLocal(tip);
    const len = this.cellSize * 0.28;
    g.strokeColor = ACCENT;
    g.lineWidth = 3;
    g.moveTo(p.x, p.y);
    g.lineTo(p.x + dx * len, p.y + dy * len);
    g.stroke();
  }

  private drawPreview(g: Graphics, trace: Trace): void {
    const points = trace.points.map((cell) => this.toLocal(cell));
    const alpha = trace.result === "exit" ? 230 : Math.round(140 + 100 * Math.abs(Math.sin(this.blink * 8)));
    const color = ACCENT.clone();
    color.a = alpha;
    g.strokeColor = color;
    g.lineWidth = 4;
    const dash = Math.max(10, this.cellSize * 0.22);
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
      g.fillColor = color;
      g.circle(hit.x, hit.y, this.cellSize * 0.12);
      g.fill();
    }
  }

  private drawArrow(g: Graphics, x: number, y: number, dir: Dir, scale: number, hot: boolean): void {
    const d = dirVector(dir);
    const color = hot ? ACCENT : INK;
    const len = this.cellSize * 0.34 * scale;
    const head = this.cellSize * 0.2 * scale;
    g.strokeColor = color;
    g.lineWidth = hot ? 7 : 5;
    g.moveTo(x - d.x * len * 0.35, y - d.y * len * 0.35);
    g.lineTo(x + d.x * len, y + d.y * len);
    g.stroke();
    const px = -d.y;
    const py = d.x;
    const tipX = x + d.x * len;
    const tipY = y + d.y * len;
    g.fillColor = color;
    g.moveTo(tipX, tipY);
    g.lineTo(tipX - d.x * head + px * head * 0.55, tipY - d.y * head + py * head * 0.55);
    g.lineTo(tipX - d.x * head - px * head * 0.55, tipY - d.y * head - py * head * 0.55);
    g.close();
    g.fill();
  }

  private drawGhost(g: Graphics, arrow: ArrowDef): void {
    const origin = this.toLocal(arrow);
    const d = dirVector(arrow.dir);
    const t = (Math.sin(this.ghost * 2.2) + 1) / 2;
    const x = origin.x + d.x * this.cellSize * 0.55 * t;
    const y = origin.y + d.y * this.cellSize * 0.55 * t;
    g.fillColor = new Color(242, 193, 78, 90);
    g.circle(x, y, this.cellSize * 0.14);
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
    this.armed = along > Math.max(28, this.cellSize * 0.38);
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
    const ui = event.getUILocation();
    const local = this.board.getComponent(UITransform)!.convertToNodeSpaceAR(new Vec3(ui.x, ui.y, 0));
    return new Vec2(local.x, local.y);
  }

  private pickArrow(point: Vec2): string | null {
    let best: string | null = null;
    let bestDist = this.cellSize * 0.55;
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
    const points = trace.points.map((cell) => this.toLocal(cell));
    let length = 0;
    for (let i = 1; i < points.length; i++) length += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
    const duration = Math.max(0.12, length / 900);
    this.anim = { id, points, duration: trace.result === "exit" ? duration : duration, elapsed: 0, bounce: trace.result !== "exit" };
  }

  private stepAnim(dt: number): void {
    if (!this.anim) return;
    this.anim.elapsed += dt;
    const limit = this.anim.bounce ? this.anim.duration * 2 : this.anim.duration;
    if (this.anim.elapsed < limit) return;
    const result = this.game.commitSlide();
    this.anim = null;
    this.layout();
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
    return new Vec2(a.x + (b.x - a.x) * local, a.y + (b.y - a.y) * local);
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

  private async settleWin(): Promise<void> {
    if (this.settling) return;
    this.settling = true;
    this.flashToast("完成");
    await this.wait(0.8);
    const decision = this.game.interstitialDecision();
    if (decision.show) {
      await this.playInterstitial();
      this.game.markAdShown();
    }
    const next = this.game.advance();
    this.settling = false;
    this.hideToast();
    this.layout();
    if (next === "done") {
      this.showModal("全部通过", "60 关都拔完了。", "再来一局", () => {
        this.hideModal();
        this.game.replayFromStart();
        this.layout();
      }, null, null);
    }
  }

  private wait(seconds: number): Promise<void> {
    return new Promise((resolve) => this.scheduleOnce(resolve, seconds));
  }

  private openTimeout(): void {
    if (this.modal.active || this.settling) return;
    this.showModal(
      "时间到了",
      this.game.reviveLeft > 0 ? `还可以加时 ${this.game.reviveLeft} 次` : "本关加时次数已用完",
      "加时 +20 秒",
      () => void this.onRevive(),
      "重开",
      () => {
        this.hideModal();
        this.game.restart();
        this.layout();
      },
    );
  }

  private async onRevive(): Promise<void> {
    const prepared = this.game.prepareRevive();
    if (prepared.action === "capped") {
      this.flashToast("本关加时次数已用完");
      return;
    }
    if (prepared.action !== "need-ad") {
      this.flashToast(this.denyText(prepared));
      return;
    }
    const watched = await this.watchRewarded();
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

  private watchRewarded(): Promise<{ isEnded: boolean }> {
    return new Promise((resolve) => {
      void showRewarded().then((result) => {
        if (result !== "no-wx") {
          resolve(result);
          return;
        }
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
      });
    });
  }

  private playInterstitial(): Promise<void> {
    return new Promise((resolve) => {
      void showInterstitial().then((result) => {
        if (result === "shown" || result === "failed") {
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
