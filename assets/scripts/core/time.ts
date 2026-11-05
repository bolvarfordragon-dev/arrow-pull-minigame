import { TIMED_FROM_LEVEL } from "./types";

/**
 * 第 1–10 关不限时。第 11 关起为 max(25, 20 + 6×箭数) 秒。
 * 下限写进公式，即使箭数很少也不会低于 25 秒。
 */
export function timeLimitSeconds(levelId: number, arrowCount: number): number | null {
  if (levelId < TIMED_FROM_LEVEL) return null;
  return Math.max(25, 20 + 6 * arrowCount);
}
