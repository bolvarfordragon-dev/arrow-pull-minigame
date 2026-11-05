import { AD_UNITS } from "./AdUnits";

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

/** 没有微信环境时返回 "no-wx"，由界面弹出可关闭的桩。看完才返回 isEnded: true。 */
export async function showRewarded(): Promise<{ isEnded: boolean } | "no-wx"> {
  const wx = wxApi();
  const ad = cached(rewardedCache, AD_UNITS.rewarded, wx?.createRewardedVideoAd);
  if (!ad) return "no-wx";
  return new Promise((resolve) => {
    const onClose = (res?: { isEnded?: boolean }) => {
      ad.offClose(onClose);
      ad.offError(onError);
      resolve({ isEnded: res?.isEnded === true });
    };
    const onError = () => {
      ad.offClose(onClose);
      ad.offError(onError);
      resolve({ isEnded: false });
    };
    ad.onClose(onClose);
    ad.onError(onError);
    present(ad).catch(onError);
  });
}

export async function showInterstitial(): Promise<"shown" | "no-wx" | "failed"> {
  const wx = wxApi();
  const ad = cached(interstitialCache, AD_UNITS.interstitial, wx?.createInterstitialAd);
  if (!ad) return "no-wx";
  return new Promise((resolve) => {
    const done = (value: "shown" | "failed") => {
      ad.offClose(onClose);
      ad.offError(onError);
      resolve(value);
    };
    const onClose = () => done("shown");
    const onError = () => done("failed");
    ad.onClose(onClose);
    ad.onError(onError);
    present(ad).catch(onError);
  });
}
