/** 直线轨道上的拔箭头关卡。箭头只沿朝向直行，不中途转向。 */

export type Dir = "N" | "E" | "S" | "W";
export type Axis = "H" | "V";

export interface LineDef {
  axis: Axis;
  /** 水平线的 y，或垂直线的 x。 */
  fixed: number;
  start: number;
  end: number;
  /** 坐标较小的一端可以滑出。 */
  exitStart: boolean;
  /** 坐标较大的一端可以滑出。 */
  exitEnd: boolean;
}

export interface ArrowDef {
  id: string;
  x: number;
  y: number;
  dir: Dir;
}

export interface Level {
  id: number;
  lines: LineDef[];
  arrows: ArrowDef[];
  /** 一组保证可通关的拔出顺序。 */
  solution: string[];
}

export interface Cell {
  x: number;
  y: number;
}

export type TraceResult = "exit" | "arrow" | "wall";

export interface Trace {
  arrowId: string;
  result: TraceResult;
  /** 含起点、途经格，以及出口外或撞点的最后一格。 */
  points: Cell[];
  hit: Cell | null;
  blockerId: string | null;
}

export interface LevelBank {
  maxId: number;
  get(id: number): Level;
}

export interface Kv {
  get(key: string): string | null;
  set(key: string, value: string): void;
}

export const LEVEL_COUNT = 60;
export const TIMED_FROM_LEVEL = 11;
export const HINT_FROM_LEVEL = 6;
export const TUTORIAL_UNTIL_LEVEL = 2;
export const INTERSTITIAL_FROM_LEVEL = 8;
export const FREE_HINTS_START = 3;
export const HINTS_PER_LEVEL = 2;
export const FREE_UNDOS_PER_LEVEL = 1;
export const PAID_UNDOS_PER_LEVEL = 2;
export const REVIVES_PER_LEVEL = 2;
export const REVIVE_SECONDS = 20;
export const AD_GAP_MS = 30_000;
export const SAVE_KEY = "arrow-pull-save-v1";
