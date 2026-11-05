import { AD_UNITS, isPlayableAdUnit } from "./AdUnits";

interface WxAd {
  show: () => Promise<void>;
  load: () => Promise<void>;
  onClose: (cb: (res?: { isEnded?: boolean }) => void) => void;
  offClose: (cb: (res?: { isEnded?: boolean }) => void) => void;
  onError: (cb: (err: unknown) => void) => void;
  offError: (cb: (err: unknown) => void) => void;
}

interface WxApi {
  createRewardedVideoAd?: (opts: { adUnitId: string }) => WxAd;
  createInterstitialAd?: (opts: { adUnitId: string }) => WxAd;
}

/** 看完或中途关闭。只有 isEnded === true 才发奖。 */
export interface RewardedClosed {
  kind: "closed";
  isEnded: boolean;
}

/** 广告位还没配，或加载/播放失败。不是玩家关掉视频。 */
export interface RewardedUnavailable {
  kind: "unconfigured" | "error";
}

export type RewardedOutcome = "no-wx" | RewardedClosed | RewardedUnavailable;

export type InterstitialOutcome = "shown" | "no-wx" | "failed" | "unconfigured";

const rewardedCache = new Map<string, WxAd>();
const interstitialCache = new Map<string, WxAd>();

function wxApi(): WxApi | null {
  const host = globalThis as { wx?: WxApi };
  return host.wx ?? null;
}

export function hasWechatAds(): boolean {
  const wx = wxApi();
  return !!wx?.createRewardedVideoAd && !!wx?.createInterstitialAd;
}

function cached(map: Map<string, WxAd>, id: string, create: ((opts: { adUnitId: string }) => WxAd) | undefined): WxAd | null {
  if (!create) return null;
  let ad = map.get(id);
  if (!ad) {
    ad = create({ adUnitId: id });
    map.set(id, ad);
  }
  return ad;
}

async function present(ad: WxAd): Promise<void> {
  try {
    await ad.show();
  } catch {
    await ad.load();
    await ad.show();
  }
}

/**
 * 没有微信环境时返回 "no-wx"，由界面弹出可关闭的桩。
 * 广告位为空或仍是占位符时不调用 wx.create*，返回 unconfigured。
 * onError / show 失败是 error；玩家关掉视频才是 closed 且 isEnded 可能为 false。
 */
export async function showRewarded(): Promise<RewardedOutcome> {
  const wx = wxApi();
  if (!wx?.createRewardedVideoAd) return "no-wx";
  if (!isPlayableAdUnit(AD_UNITS.rewarded)) return { kind: "unconfigured" };
  const ad = cached(rewardedCache, AD_UNITS.rewarded, wx.createRewardedVideoAd);
  if (!ad) return { kind: "unconfigured" };
  return new Promise((resolve) => {
    let settled = false;
    const finish = (value: RewardedClosed | RewardedUnavailable) => {
      if (settled) return;
      settled = true;
      ad.offClose(onClose);
      ad.offError(onError);
      resolve(value);
    };
    const onClose = (res?: { isEnded?: boolean }) => {
      finish({ kind: "closed", isEnded: res?.isEnded === true });
    };
    const onError = () => {
      finish({ kind: "error" });
    };
    ad.onClose(onClose);
    ad.onError(onError);
    present(ad).catch(() => finish({ kind: "error" }));
  });
}

export async function showInterstitial(): Promise<InterstitialOutcome> {
  const wx = wxApi();
  if (!wx?.createInterstitialAd) return "no-wx";
  if (!isPlayableAdUnit(AD_UNITS.interstitial)) return "unconfigured";
  const ad = cached(interstitialCache, AD_UNITS.interstitial, wx.createInterstitialAd);
  if (!ad) return "unconfigured";
  return new Promise((resolve) => {
    let settled = false;
    const finish = (value: "shown" | "failed") => {
      if (settled) return;
      settled = true;
      ad.offClose(onClose);
      ad.offError(onError);
      resolve(value);
    };
    const onClose = () => finish("shown");
    const onError = () => finish("failed");
    ad.onClose(onClose);
    ad.onError(onError);
    present(ad).catch(() => finish("failed"));
  });
}
