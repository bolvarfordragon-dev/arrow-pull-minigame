/**
 * 微信流量主广告位 ID。提示、加时、额外撤销共用 rewarded 这一条激励视频。
 *
 * 发布前由 Alvin 换成流量主后台里的真实广告位（形如 `adunit-` 加一串十六进制）。
 * 不要填伪造的 ID，这里留的就是占位符。
 *
 * 值为空、只有空白，或仍然含有 placeholder 时，运行时不会调用
 * wx.createRewardedVideoAd / wx.createInterstitialAd，界面提示「广告暂时不能播放」。
 */
export const AD_UNITS = {
  /** 激励视频。换成真实 ID 之前保持占位符。 */
  rewarded: "adunit-rewarded-placeholder",
  /** 插屏。换成真实 ID 之前保持占位符。 */
  interstitial: "adunit-interstitial-placeholder",
};

/** 空字符串和占位符都不去创建微信广告组件。 */
export function isPlayableAdUnit(id: string | null | undefined): boolean {
  if (typeof id !== "string") return false;
  const trimmed = id.trim();
  if (!trimmed) return false;
  return !/placeholder/i.test(trimmed);
}
