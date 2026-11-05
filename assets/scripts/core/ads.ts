import {
  AD_GAP_MS,
  INTERSTITIAL_FROM_LEVEL,
  TUTORIAL_UNTIL_LEVEL,
} from "./types";

export type AdDenyReason =
  | "tutorial"
  | "finger"
  | "sliding"
  | "cooldown"
  | "rewarded-this-level"
  | "cadence"
  | "before-level-8";

export interface AdWorld {
  levelId: number;
  fingerDown: boolean;
  sliding: boolean;
  rewardedThisAttempt: boolean;
  lastAdAtMs: number | null;
  nowMs: number;
  /** 已经连续通关的次数（含刚打过的这一关）。 */
  consecutiveClears: number;
  /** 刚通关的关卡号；插屏用。 */
  clearedLevelId: number;
}

export function rewardGranted(result: { isEnded?: boolean } | null | undefined): boolean {
  return !!result && result.isEnded === true;
}

function sharedDeny(world: AdWorld): AdDenyReason | null {
  if (world.levelId <= TUTORIAL_UNTIL_LEVEL) return "tutorial";
  if (world.fingerDown) return "finger";
  if (world.sliding) return "sliding";
  if (world.lastAdAtMs != null && world.nowMs - world.lastAdAtMs < AD_GAP_MS) return "cooldown";
  return null;
}

/** 玩家主动点的激励视频：提示、加时、额外撤销。第 1–2 关不播。 */
export function denyRewarded(world: AdWorld): AdDenyReason | null {
  return sharedDeny(world);
}

/**
 * 插屏只在通关结算之后。通关第 8 关之前不播。
 * 连续通关次数为偶数才播（从第 1 关累计，失败或重开会把连续次数清零），
 * 因此在不失败时落在第 8、10、12… 关之后。
 * 本关刚看过激励视频、或距上一次广告不足 30 秒，则跳过。
 */
export function denyInterstitial(world: AdWorld): AdDenyReason | null {
  if (world.clearedLevelId < INTERSTITIAL_FROM_LEVEL) return "before-level-8";
  const shared = sharedDeny(world);
  if (shared) return shared;
  if (world.rewardedThisAttempt) return "rewarded-this-level";
  if (world.consecutiveClears % 2 !== 0) return "cadence";
  return null;
}
