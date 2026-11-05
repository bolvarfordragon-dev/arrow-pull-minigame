import assert from "node:assert/strict";
import test from "node:test";
import { generateAll } from "../assets/scripts/core/generate";
import { Game, type SaveData } from "../assets/scripts/core/game";
import { timeLimitSeconds } from "../assets/scripts/core/time";
import {
  AD_GAP_MS,
  FREE_HINTS_START,
  REVIVE_SECONDS,
  SAVE_KEY,
  type Kv,
  type Level,
  type LevelBank,
} from "../assets/scripts/core/types";

function memoryKv(initial?: SaveData): Kv {
  const values = new Map<string, string>();
  if (initial) values.set(SAVE_KEY, JSON.stringify(initial));
  return {
    get: (key) => values.get(key) ?? null,
    set: (key, value) => {
      values.set(key, value);
    },
  };
}

function bankOf(levels: Level[]): LevelBank {
  const map = new Map(levels.map((level) => [level.id, level]));
  return {
    maxId: Math.max(...levels.map((level) => level.id)),
    get: (id) => {
      const level = map.get(id);
      if (!level) throw new Error(`missing ${id}`);
      return level;
    },
  };
}

const campaignBank = bankOf(generateAll());

function playSolution(game: Game): void {
  for (const id of game.solution) {
    const trace = game.beginSlide(id);
    assert.equal(trace?.result, "exit", `${game.levelId}:${id}`);
    game.commitSlide();
  }
  assert.equal(game.phase, "win");
}

test("preview does not move arrows; bounce does not undo-stack", () => {
  const game = new Game(campaignBank, memoryKv(), () => 0, { levelId: 2 });
  const before = game.arrows.map((arrow) => arrow.id).join(",");
  const preview = game.preview("a2");
  assert.equal(preview?.result, "arrow");
  assert.equal(game.arrows.map((arrow) => arrow.id).join(","), before);
  assert.equal(game.phase, "play");
  const slide = game.beginSlide("a2");
  assert.equal(slide?.result, "arrow");
  const committed = game.commitSlide();
  assert.equal(committed.outcome, "bounce");
  assert.equal(committed.stuck, false);
  assert.equal(game.prepareUndo().action, "empty");
  assert.equal(game.arrows.length, 2);
});

test("standard solutions clear every level and interstitial follows the cadence", () => {
  const clock = { t: 1_000 };
  const game = new Game(campaignBank, memoryKv(), () => clock.t, { levelId: 1 });
  for (let level = 1; level <= 60; level++) {
    assert.equal(game.levelId, level);
    assert.equal(game.timeLimit, timeLimitSeconds(level, game.arrows.length));
    if (level < 11) assert.equal(game.timeLeft, null);
    else assert.ok((game.timeLimit ?? 0) >= 25);
    playSolution(game);
    const ad = game.interstitialDecision();
    const expectShow = level >= 8 && level % 2 === 0;
    assert.equal(ad.show, expectShow, `level ${level} ${ad.reason}`);
    if (ad.show) {
      game.markAdShown();
      clock.t += AD_GAP_MS;
    }
    const next = game.advance();
    if (level === 60) assert.equal(next, "done");
    else assert.equal(next, "next");
  }
  assert.equal(game.phase, "cleared");
  const hintsLeft = game.freeHints;
  game.replayFromStart();
  assert.equal(game.levelId, 1);
  assert.equal(game.phase, "play");
  assert.equal(game.freeHints, hintsLeft);
  assert.equal(game.arrows.length, 1);
});

test("restart breaks the clear streak so level 8 does not get an interstitial", () => {
  const game = new Game(campaignBank, memoryKv(), () => 0, { levelId: 1 });
  for (let level = 1; level <= 7; level++) {
    playSolution(game);
    assert.equal(game.interstitialDecision().show, false);
    game.advance();
  }
  game.restart();
  assert.equal(game.levelId, 8);
  playSolution(game);
  assert.equal(game.interstitialDecision().show, false);
  assert.equal(game.interstitialDecision().reason, "cadence");
});

test("rewarded video this attempt skips the interstitial after the cooldown", () => {
  const clock = { t: 5_000 };
  const game = new Game(campaignBank, memoryKv(), () => clock.t, { levelId: 7 });
  playSolution(game);
  assert.equal(game.interstitialDecision().show, false);
  game.advance();
  assert.equal(game.levelId, 8);
  const first = game.solution[0];
  assert.equal(game.beginSlide(first)?.result, "exit");
  game.commitSlide();
  assert.equal(game.finishUndo(null).granted, true);
  assert.equal(game.beginSlide(first)?.result, "exit");
  game.commitSlide();
  assert.equal(game.prepareUndo().action, "need-ad");
  assert.equal(game.finishUndo({ isEnded: true }).granted, true);
  assert.equal(game.rewardedThisAttempt, true);
  for (const id of game.solution) {
    if (!game.arrows.some((arrow) => arrow.id === id)) continue;
    assert.equal(game.beginSlide(id)?.result, "exit");
    game.commitSlide();
  }
  assert.equal(game.phase, "win");
  clock.t += AD_GAP_MS;
  const ad = game.interstitialDecision();
  assert.equal(ad.show, false);
  assert.equal(ad.reason, "rewarded-this-level");
});

test("timer pauses its failure panel until the slide ends, then revive needs isEnded", () => {
  const clock = { t: 0 };
  const game = new Game(campaignBank, memoryKv(), () => clock.t, { levelId: 11 });
  const limit = game.timeLimit ?? 0;
  assert.equal(limit, Math.max(25, 20 + 6 * game.arrows.length));
  assert.equal(game.tick(limit - 6).timedOut, false);
  assert.equal(game.warnTime, true);
  assert.equal(game.phase, "play");
  assert.ok(game.beginSlide(game.solution[0]));
  assert.equal(game.tick(10).timedOut, false);
  assert.equal(game.phase, "slide");
  const committed = game.commitSlide();
  assert.notEqual(committed.outcome, "win");
  assert.equal(game.phase, "timeout");

  assert.equal(game.prepareRevive().action, "need-ad");
  assert.equal(game.finishRevive({ isEnded: false }).granted, false);
  assert.equal(game.phase, "timeout");
  assert.equal(game.reviveLeft, 2);

  clock.t += AD_GAP_MS;
  assert.equal(game.finishRevive({ isEnded: true }).granted, true);
  assert.equal(game.phase, "play");
  assert.equal(game.timeLeft, REVIVE_SECONDS);
  assert.equal(game.reviveLeft, 1);

  game.tick(REVIVE_SECONDS);
  assert.equal(game.phase, "timeout");
  clock.t += AD_GAP_MS;
  assert.equal(game.finishRevive({ isEnded: true }).granted, true);
  assert.equal(game.reviveLeft, 0);
  game.tick(REVIVE_SECONDS);
  assert.equal(game.phase, "timeout");
  clock.t += AD_GAP_MS;
  assert.equal(game.prepareRevive().action, "capped");
});

test("levels 1-2 never offer ads; hints start at level 6 and obey isEnded", () => {
  const early = new Game(campaignBank, memoryKv(), () => 0, { levelId: 2 });
  assert.equal(early.hintVisible, false);
  assert.equal(early.prepareHint().action, "hidden");
  assert.equal(early.beginSlide("a1")?.result, "exit");
  early.commitSlide();
  assert.equal(early.finishUndo(null).granted, true);
  assert.equal(early.beginSlide("a1")?.result, "exit");
  early.commitSlide();
  assert.equal(early.prepareUndo().action, "blocked");
  assert.equal(early.prepareUndo().reason, "tutorial");

  const clock = { t: 0 };
  const kv = memoryKv();
  const game = new Game(campaignBank, kv, () => clock.t, { levelId: 6 });
  assert.equal(game.freeHints, FREE_HINTS_START);
  assert.equal(game.prepareHint().action, "free");
  assert.equal(game.finishHint(null).arrowId, "a1");
  assert.equal(game.highlightId, "a1");
  assert.equal(game.freeHints, 2);
  assert.equal(game.finishHint(null).granted, true);
  assert.equal(game.freeHints, 1);
  assert.equal(game.prepareHint().action, "capped");

  const next = new Game(campaignBank, kv, () => clock.t, { levelId: 7 });
  assert.equal(next.freeHints, 1);
  assert.equal(next.finishHint(null).granted, true);
  assert.equal(next.prepareHint().action, "need-ad");
  assert.equal(next.finishHint({ isEnded: false }).granted, false);
  assert.equal(next.hintsUsed, 1);
  clock.t += AD_GAP_MS;
  const paid = next.finishHint({ isEnded: true });
  assert.equal(paid.granted, true);
  assert.equal(paid.arrowId, "a1");
  assert.equal(next.rewardedThisAttempt, true);
});

test("an unsolvable position asks for undo and does not play an ad", () => {
  const stuck: Level = {
    id: 6,
    lines: [{ axis: "H", fixed: 0, start: 0, end: 4, exitStart: true, exitEnd: true }],
    arrows: [
      { id: "a1", x: 1, y: 0, dir: "E" },
      { id: "a2", x: 3, y: 0, dir: "W" },
    ],
    solution: ["a1", "a2"],
  };
  const game = new Game(bankOf([stuck]), memoryKv(), () => 0, { levelId: 6 });
  assert.equal(game.prepareHint().action, "unsolvable");
  assert.equal(game.finishHint({ isEnded: true }).granted, false);
  assert.equal(game.lastAdAtMs, null);
  assert.equal(game.freeHints, FREE_HINTS_START);
  const slide = game.beginSlide("a1");
  assert.equal(slide?.result, "arrow");
  assert.equal(game.commitSlide().stuck, true);
});

test("finger down and sliding block a rewarded offer", () => {
  const game = new Game(campaignBank, memoryKv({ freeHints: 0, levelId: 6 }), () => 0, { levelId: 6 });
  game.setFingerDown(true);
  assert.equal(game.prepareHint().reason, "finger");
  game.setFingerDown(false);
  assert.equal(game.prepareHint().action, "need-ad");
  assert.ok(game.beginSlide("a1"));
  assert.equal(game.prepareHint().reason, "phase");
});

test("time floor is 25 seconds even when the arrow term is smaller", () => {
  assert.equal(timeLimitSeconds(10, 12), null);
  assert.equal(timeLimitSeconds(11, 0), 25);
  assert.equal(timeLimitSeconds(11, 1), 26);
  assert.equal(timeLimitSeconds(46, 12), 92);
});

test("restart during a win does not throw when advance runs afterwards", () => {
  const game = new Game(campaignBank, memoryKv(), () => 0, { levelId: 1 });
  playSolution(game);
  assert.equal(game.phase, "win");
  game.restart();
  assert.equal(game.advance(), "not-won");
  assert.equal(game.levelId, 1);
  assert.equal(game.phase, "play");
  assert.equal(game.arrows.length, 1);
});

test("level 2 says to pull the blocker first and tips on the first bounce", () => {
  const level1 = new Game(campaignBank, memoryKv(), () => 0, { levelId: 1 });
  assert.equal(level1.tutorialText, "顺着箭头的方向滑出去");
  assert.equal(level1.bounceTip, null);

  const game = new Game(campaignBank, memoryKv(), () => 0, { levelId: 2 });
  assert.equal(game.tutorialText, "挡路的要先拔");
  assert.equal(game.bounceTip, "被挡住了，先拔前面的");
  assert.equal(game.beginSlide("a2")?.result, "arrow");
  const first = game.commitSlide();
  assert.equal(first.outcome, "bounce");
  assert.equal(first.firstBounce, true);
  assert.equal(game.beginSlide("a2")?.result, "arrow");
  assert.equal(game.commitSlide().firstBounce, false);
  assert.equal(game.tutorialText, "挡路的要先拔");
  game.restart();
  assert.equal(game.beginSlide("a2")?.result, "arrow");
  assert.equal(game.commitSlide().firstBounce, true);
});

test("a failed ad playback is not a closed video and does not start the cooldown", () => {
  const clock = { t: 10_000 };
  const game = new Game(campaignBank, memoryKv({ freeHints: 0, levelId: 6 }), () => clock.t, { levelId: 6 });
  assert.equal(game.prepareHint().action, "need-ad");
  const failed = game.finishHint({ isEnded: false, failed: true });
  assert.equal(failed.granted, false);
  assert.equal(failed.reason, "playback-error");
  assert.equal(game.lastAdAtMs, null);
  assert.equal(game.hintsUsed, 0);
  const lied = game.finishHint({ isEnded: true, failed: true });
  assert.equal(lied.granted, false);
  assert.equal(lied.reason, "playback-error");
  assert.equal(game.lastAdAtMs, null);
  const closed = game.finishHint({ isEnded: false });
  assert.equal(closed.granted, false);
  assert.equal(closed.reason, "not-ended");
  assert.equal(game.lastAdAtMs, clock.t);
  assert.equal(game.hintsUsed, 0);
});
