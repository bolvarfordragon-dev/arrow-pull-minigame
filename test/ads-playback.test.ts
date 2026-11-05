import assert from "node:assert/strict";
import test from "node:test";
import { AD_UNITS, isPlayableAdUnit } from "../assets/scripts/AdUnits";
import { showInterstitial, showRewarded } from "../assets/scripts/WxAds";

interface CloseRes {
  isEnded?: boolean;
}

class FakeAd {
  onCloseCb?: (res?: CloseRes) => void;
  onErrorCb?: (err: unknown) => void;
  show: () => Promise<void> = async () => undefined;
  load: () => Promise<void> = async () => undefined;
  onClose(cb: (res?: CloseRes) => void): void {
    this.onCloseCb = cb;
  }
  offClose(): void {
    this.onCloseCb = undefined;
  }
  onError(cb: (err: unknown) => void): void {
    this.onErrorCb = cb;
  }
  offError(): void {
    this.onErrorCb = undefined;
  }
}

const original = { rewarded: AD_UNITS.rewarded, interstitial: AD_UNITS.interstitial };

test.afterEach(() => {
  AD_UNITS.rewarded = original.rewarded;
  AD_UNITS.interstitial = original.interstitial;
  delete (globalThis as { wx?: unknown }).wx;
});

test("placeholder and blank ad units are not playable", () => {
  assert.equal(isPlayableAdUnit(AD_UNITS.rewarded), false);
  assert.equal(isPlayableAdUnit(AD_UNITS.interstitial), false);
  assert.equal(isPlayableAdUnit(""), false);
  assert.equal(isPlayableAdUnit("   "), false);
  assert.equal(isPlayableAdUnit("adunit-rewarded-PLACEHOLDER"), false);
  assert.equal(isPlayableAdUnit("adunit-0123456789abcdef"), true);
});

test("placeholder units do not call wx.create", async () => {
  let created = 0;
  (globalThis as { wx?: unknown }).wx = {
    createRewardedVideoAd: () => {
      created += 1;
      return new FakeAd();
    },
    createInterstitialAd: () => {
      created += 1;
      return new FakeAd();
    },
  };
  assert.deepEqual(await showRewarded(), { kind: "unconfigured" });
  assert.equal(await showInterstitial(), "unconfigured");
  AD_UNITS.rewarded = "";
  AD_UNITS.interstitial = "   ";
  assert.deepEqual(await showRewarded(), { kind: "unconfigured" });
  assert.equal(await showInterstitial(), "unconfigured");
  assert.equal(created, 0);
});

test("closing early is isEnded false, and a load error is not that", async () => {
  const closed = new FakeAd();
  closed.show = async () => {
    closed.onCloseCb?.({ isEnded: false });
  };
  const failed = new FakeAd();
  failed.show = () => {
    failed.onErrorCb?.(new Error("no fill"));
    return new Promise(() => undefined);
  };
  const rejected = new FakeAd();
  rejected.show = async () => {
    throw new Error("show failed");
  };
  rejected.load = async () => {
    throw new Error("load failed");
  };
  const ads = [closed, failed, rejected];
  (globalThis as { wx?: unknown }).wx = {
    createRewardedVideoAd: () => {
      const next = ads.shift();
      if (!next) throw new Error("unexpected create");
      return next;
    },
    createInterstitialAd: () => new FakeAd(),
  };
  AD_UNITS.rewarded = "adunit-closed-case";
  assert.deepEqual(await showRewarded(), { kind: "closed", isEnded: false });
  AD_UNITS.rewarded = "adunit-error-case";
  assert.deepEqual(await showRewarded(), { kind: "error" });
  AD_UNITS.rewarded = "adunit-reject-case";
  assert.deepEqual(await showRewarded(), { kind: "error" });
});

test("a rewarded video grants only after a later successful show reports isEnded", async () => {
  const ad = new FakeAd();
  let shows = 0;
  ad.show = async () => {
    shows += 1;
    if (shows === 1) throw new Error("not ready");
    ad.onCloseCb?.({ isEnded: true });
  };
  (globalThis as { wx?: unknown }).wx = {
    createRewardedVideoAd: () => ad,
  };
  AD_UNITS.rewarded = "adunit-retry-case";
  assert.deepEqual(await showRewarded(), { kind: "closed", isEnded: true });
  assert.equal(shows, 2);
});

test("missing wx stays on the preview stub", async () => {
  AD_UNITS.rewarded = "adunit-0123456789abcdef";
  assert.equal(await showRewarded(), "no-wx");
  assert.equal(await showInterstitial(), "no-wx");
});
