# 无法在云端构建

这个目录**不是** Cocos Creator 打出来的微信小游戏。不要把它导入微信开发者工具当正式包。

Cocos Creator **3.8.6 没有 Linux 编辑器**。这台云端环境也找不到 `CocosCreator` 可执行文件，所以跑不了 `CocosCreator --project ... --build "platform=wechatgame"`。主包大小（含 `cocos-js` 引擎）是：

**未知/无法在云端构建**

在装了 Creator 3.8.6 的 Windows 或 macOS 上打开本仓库，菜单选 **项目 → 构建发布**，平台选微信小游戏、竖屏，构建完成后用新的 `build/wechatgame` 覆盖这里。

## 这次能度量的体积

这些数字不是微信主包，只是仓库里的项目内容：

| 内容 | 大小 |
| --- | --- |
| `assets/` 里除 `.meta` 外的文件，zip 压缩后 | 25376 字节 |
| `assets/scripts/**/*.ts` 未压缩 | 71433 字节 |
| 已删除的 `level-pack.ts`（以前会打进脚本） | 78262 字节 |
| 已删除的 `assets/resources/levels/*.json`（以前会再进一份资源） | 60 个文件，67952 字节 |

关卡现在只留在 `assets/scripts/core/generate.ts`，运行时 `generateAll()`。`settings/v2/packages/engine.json` 的 `includeModules` 已去掉 `physics-2d-box2d-wasm`，2D 物理模块也关掉了。正式构建不应再把 box2d.wasm 打进主包；那个 wasm 有多大，要等上面的 Creator 构建才能量到。
