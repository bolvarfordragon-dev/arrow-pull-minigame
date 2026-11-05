// 不是 Cocos Creator 构建产物。说明见同目录 BUILD_GAP.md。
var message = "无法在云端构建。本目录不是 Creator 3.8.6 打出来的微信小游戏，请在 Windows 或 macOS 上重新构建。";

if (typeof wx !== "undefined" && wx.showModal) {
  wx.showModal({
    title: "无法在云端构建",
    content: message,
    showCancel: false,
  });
} else {
  console.error(message);
}
