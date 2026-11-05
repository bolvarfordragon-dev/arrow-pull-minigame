import { denyInterstitial, denyRewarded, rewardGranted, type AdDenyReason } from "./ads";
import { hintArrowId, traceArrow, type Trace } from "./trace";
import { timeLimitSeconds } from "./time";
import {
  FREE_HINTS_START,
  FREE_UNDOS_PER_LEVEL,
  HINT_FROM_LEVEL,
  HINTS_PER_LEVEL,
  PAID_UNDOS_PER_LEVEL,
  REVIVE_SECONDS,
  REVIVES_PER_LEVEL,
  SAVE_KEY,
  TUTORIAL_UNTIL_LEVEL,
  type ArrowDef,
  type Kv,
  type Level,
  type LevelBank,
  type LineDef,
} from "./types";

export type Phase = "play" | "slide" | "timeout" | "win" | "cleared";

export interface SaveData {
  freeHints: number;
  levelId: number;
}

export interface PrepareResult {
  action: "free" | "need-ad" | "blocked" | "hidden" | "capped" | "unsolvable" | "empty";
  reason?: AdDenyReason | "phase" | "no-charge";
  arrowId?: string;
}

export interface FinishResult {
  granted: boolean;
  reason?: string;
  arrowId?: string;
}

interface PendingSlide {
  id: string;
  trace: Trace;
}

function defaultSave(): SaveData {
  return { freeHints: FREE_HINTS_START, levelId: 1 };
}

export function loadSave(kv: Kv): SaveData {
  const raw = kv.get(SAVE_KEY);
  if (!raw) return defaultSave();
  try {
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    const freeHints = Number.isInteger(parsed.freeHints) ? Math.max(0, parsed.freeHints as number) : FREE_HINTS_START;
    const levelId = Number.isInteger(parsed.levelId) ? Math.max(1, parsed.levelId as number) : 1;
    return { freeHints, levelId };
  } catch {
    return defaultSave();
  }
}

/**
 * 一局的规则状态：预览不改棋面，滑行结束才结算，
 * 激励视频只有 isEnded 才发奖，插屏按关卡保护与连续通关节奏决定。
 */
export class Game {
  phase: Phase = "play";
  fingerDown = false;
  sliding = false;
  highlightId: string | null = null;
  stuck = false;
  lastAdAtMs: number | null = null;
  consecutiveClears = 0;
  freeHints: number;
  levelId: number;
  undoFreeLeft = FREE_UNDOS_PER_LEVEL;
  undoPaidLeft = PAID_UNDOS_PER_LEVEL;
  hintsUsed = 0;
  reviveLeft = REVIVES_PER_LEVEL;
  timeLeft: number | null = null;
  timeLimit: number | null = null;
  rewardedThisAttempt = false;

  private level: Level;
  private remaining: ArrowDef[] = [];
  private undoStack: ArrowDef[] = [];
  private pending: PendingSlide | null = null;
  private pendingTimeout = false;
  private winReady = false;

  constructor(
    private readonly bank: LevelBank,
    private readonly kv: Kv,
    private readonly now: () => number,
    opts?: { levelId?: number },
  ) {
    const saved = loadSave(kv);
    this.freeHints = saved.freeHints;
    const requested = opts?.levelId ?? saved.levelId;
    this.levelId = Math.min(this.bank.maxId, Math.max(1, requested));
    this.level = this.bank.get(this.levelId);
    this.resetAttempt();
  }

  get maxLevel(): number {
    return this.bank.maxId;
  }

  get lines(): readonly LineDef[] {
    return this.level.lines;
  }

  get arrows(): readonly ArrowDef[] {
    return this.remaining;
  }

  get solution(): readonly string[] {
    return this.level.solution;
  }

  get warnTime(): boolean {
    return this.timeLeft != null && this.timeLeft > 0 && this.timeLeft <= 10;
  }

  get hintVisible(): boolean {
    return this.levelId >= HINT_FROM_LEVEL;
  }

  get tutorialText(): string | null {
    if (this.levelId === 1 && this.phase === "play" && this.undoStack.length === 0) {
      return "顺着箭头的方向滑出去";
    }
    return null;
  }

  get tutorialLocked(): boolean {
    return this.levelId <= TUTORIAL_UNTIL_LEVEL;
  }

  setFingerDown(down: boolean): void {
    this.fingerDown = down;
  }

  preview(arrowId: string): Trace | null {
    if (!this.canInput()) return null;
    if (!this.remaining.some((a) => a.id === arrowId)) return null;
    return traceArrow(this.level, this.remaining, arrowId);
  }

  beginSlide(arrowId: string): Trace | null {
    if (!this.canInput()) return null;
    if (!this.remaining.some((a) => a.id === arrowId)) return null;
    const trace = traceArrow(this.level, this.remaining, arrowId);
    this.pending = { id: arrowId, trace };
    this.sliding = true;
    this.phase = "slide";
    this.highlightId = null;
    this.stuck = false;
    return trace;
  }

  commitSlide(): { outcome: "exit" | "bounce" | "win"; stuck: boolean } {
    if (!this.pending) throw new Error("no slide");
    const { id, trace } = this.pending;
    this.pending = null;
    this.sliding = false;
    if (trace.result === "exit") {
      const arrow = this.remaining.find((a) => a.id === id);
      if (!arrow) throw new Error(`missing ${id}`);
      this.remaining = this.remaining.filter((a) => a.id !== id);
      this.undoStack.push({ ...arrow });
      this.stuck = false;
      if (this.remaining.length === 0) {
        this.phase = "win";
        this.winReady = true;
        this.pendingTimeout = false;
        this.consecutiveClears += 1;
        return { outcome: "win", stuck: false };
      }
    } else {
      this.stuck = !this.remaining.some((a) => traceArrow(this.level, this.remaining, a.id).result === "exit");
    }
    if (this.pendingTimeout || this.timeLeft === 0) {
      this.phase = "timeout";
      this.pendingTimeout = false;
    } else {
      this.phase = "play";
    }
    return { outcome: trace.result === "exit" ? "exit" : "bounce", stuck: this.stuck };
  }

  tick(dt: number): { timedOut: boolean } {
    if (this.timeLeft == null) return { timedOut: false };
    if (this.phase === "win" || this.phase === "cleared" || this.phase === "timeout") {
      return { timedOut: false };
    }
    if (dt < 0) return { timedOut: false };
    this.timeLeft = Math.max(0, this.timeLeft - dt);
    if (this.timeLeft > 0) return { timedOut: false };
    if (this.sliding) {
      this.pendingTimeout = true;
      return { timedOut: false };
    }
    this.phase = "timeout";
    return { timedOut: true };
  }

  restart(): void {
    this.consecutiveClears = 0;
    this.winReady = false;
    this.resetAttempt();
  }

  /** 通关 60 关之后从第 1 关再开一局。免费提示次数保留。 */
  replayFromStart(): void {
    this.levelId = 1;
    this.consecutiveClears = 0;
    this.winReady = false;
    this.level = this.bank.get(1);
    this.resetAttempt();
  }

  prepareHint(): PrepareResult {
    if (!this.hintVisible) return { action: "hidden" };
    if (this.phase !== "play" || this.sliding) return { action: "blocked", reason: "phase" };
    if (this.hintsUsed >= HINTS_PER_LEVEL) return { action: "capped" };
    const arrowId = hintArrowId(this.level, this.remaining);
    if (!arrowId) return { action: "unsolvable" };
    if (this.freeHints > 0) return { action: "free", arrowId };
    const deny = this.rewardDeny();
    if (deny) return { action: "blocked", reason: deny };
    return { action: "need-ad", arrowId };
  }

  finishHint(result: { isEnded?: boolean } | null): FinishResult {
    const prepared = this.prepareHint();
    if (prepared.action === "free" && prepared.arrowId) {
      this.freeHints -= 1;
      this.hintsUsed += 1;
      this.highlightId = prepared.arrowId;
      this.persist();
      return { granted: true, arrowId: prepared.arrowId };
    }
    if (prepared.action !== "need-ad" || !prepared.arrowId) {
      return { granted: false, reason: prepared.action };
    }
    this.markAdShown();
    if (!rewardGranted(result)) return { granted: false, reason: "not-ended" };
    this.hintsUsed += 1;
    this.rewardedThisAttempt = true;
    this.highlightId = prepared.arrowId;
    return { granted: true, arrowId: prepared.arrowId };
  }

  prepareUndo(): PrepareResult {
    if (this.phase !== "play" || this.sliding) return { action: "blocked", reason: "phase" };
    if (this.undoStack.length === 0) return { action: "empty" };
    if (this.undoFreeLeft > 0) return { action: "free" };
    if (this.undoPaidLeft <= 0) return { action: "capped" };
    const deny = this.rewardDeny();
    if (deny) return { action: "blocked", reason: deny };
    return { action: "need-ad" };
  }

  finishUndo(result: { isEnded?: boolean } | null): FinishResult {
    const prepared = this.prepareUndo();
    if (prepared.action === "free") {
      this.undoFreeLeft -= 1;
      this.popUndo();
      return { granted: true };
    }
    if (prepared.action !== "need-ad") return { granted: false, reason: prepared.action };
    this.markAdShown();
    if (!rewardGranted(result)) return { granted: false, reason: "not-ended" };
    this.undoPaidLeft -= 1;
    this.rewardedThisAttempt = true;
    this.popUndo();
    return { granted: true };
  }

  prepareRevive(): PrepareResult {
    if (this.phase !== "timeout" || this.sliding) return { action: "blocked", reason: "phase" };
    if (this.reviveLeft <= 0) return { action: "capped" };
    const deny = this.rewardDeny();
    if (deny) return { action: "blocked", reason: deny };
    return { action: "need-ad" };
  }

  finishRevive(result: { isEnded?: boolean } | null): FinishResult {
    const prepared = this.prepareRevive();
    if (prepared.action !== "need-ad") return { granted: false, reason: prepared.action };
    this.markAdShown();
    if (!rewardGranted(result)) return { granted: false, reason: "not-ended" };
    this.reviveLeft -= 1;
    this.timeLeft = (this.timeLeft ?? 0) + REVIVE_SECONDS;
    this.pendingTimeout = false;
    this.phase = "play";
    this.rewardedThisAttempt = true;
    return { granted: true };
  }

  interstitialDecision(): { show: boolean; reason: AdDenyReason | null } {
    if (!this.winReady) return { show: false, reason: null };
    const reason = denyInterstitial({
      levelId: this.levelId,
      fingerDown: this.fingerDown,
      sliding: this.sliding,
      rewardedThisAttempt: this.rewardedThisAttempt,
      lastAdAtMs: this.lastAdAtMs,
      nowMs: this.now(),
      consecutiveClears: this.consecutiveClears,
      clearedLevelId: this.levelId,
    });
    return { show: reason == null, reason };
  }

  markAdShown(): void {
    this.lastAdAtMs = this.now();
  }

  /** 结算插屏决策之后再进入下一关，避免棋盘先于广告出现。 */
  advance(): "next" | "done" {
    if (!this.winReady) throw new Error("not won");
    this.winReady = false;
    if (this.levelId >= this.bank.maxId) {
      this.phase = "cleared";
      this.persist();
      return "done";
    }
    this.levelId += 1;
    this.level = this.bank.get(this.levelId);
    this.resetAttempt();
    this.persist();
    return "next";
  }

  private canInput(): boolean {
    // 按住预览时手指是按下的，不能把 fingerDown 当成禁止操作。
    // 广告在 denyRewarded / denyInterstitial 里单独看手指和滑行。
    return this.phase === "play" && !this.sliding;
  }

  private rewardDeny(): AdDenyReason | null {
    return denyRewarded(this.adWorld(this.levelId));
  }

  private adWorld(clearedLevelId: number) {
    return {
      levelId: this.levelId,
      fingerDown: this.fingerDown,
      sliding: this.sliding,
      rewardedThisAttempt: this.rewardedThisAttempt,
      lastAdAtMs: this.lastAdAtMs,
      nowMs: this.now(),
      consecutiveClears: this.consecutiveClears,
      clearedLevelId,
    };
  }

  private popUndo(): void {
    const arrow = this.undoStack.pop();
    if (!arrow) return;
    this.remaining = this.remaining.concat(arrow);
    this.stuck = false;
    this.highlightId = null;
  }

  private resetAttempt(): void {
    this.level = this.bank.get(this.levelId);
    this.remaining = this.level.arrows.map((a) => ({ ...a }));
    this.undoStack = [];
    this.pending = null;
    this.sliding = false;
    this.fingerDown = false;
    this.highlightId = null;
    this.stuck = false;
    this.pendingTimeout = false;
    this.rewardedThisAttempt = false;
    this.undoFreeLeft = FREE_UNDOS_PER_LEVEL;
    this.undoPaidLeft = PAID_UNDOS_PER_LEVEL;
    this.hintsUsed = 0;
    this.reviveLeft = REVIVES_PER_LEVEL;
    this.timeLimit = timeLimitSeconds(this.levelId, this.level.arrows.length);
    this.timeLeft = this.timeLimit;
    this.phase = "play";
    this.persist();
  }

  private persist(): void {
    const data: SaveData = { freeHints: this.freeHints, levelId: this.levelId };
    this.kv.set(SAVE_KEY, JSON.stringify(data));
  }
}
