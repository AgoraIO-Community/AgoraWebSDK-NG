---
id: optimization_mode
title: 清晰优先和流畅优先
sidebar_label: 清晰优先和流畅优先
---

## 功能描述
在不同的视频场景和产品需求中，对视频体验的侧重点不同，有些需求希望在网络波动时视频画面即使卡顿也要尽量保持清晰，有些需求要求视频画面不能卡顿但是可以模糊。对于这两种需求，Agora Web SDK NG 对本地视频轨道提供了清晰优先和流畅优先两种优化模式的选项。

## 实现方法
在创建本地视频轨道时，我们可以通过 `optimizationMode` 来设置该视频是清晰优先还是流畅优先。如果该参数留空，则使用 SDK 默认的优化策略：
- 对于屏幕共享的轨道，SDK 默认的优化策略为清晰优先
- 对于其他类型的本地视频轨道，SDK 默认的优化策略为兼顾清晰和流畅，也就是说帧率和分辨率在弱网下都会被调整。


如果你设置了清晰优先：
- SDK 会自动根据你采集的分辨率/帧率设置一个最小清晰码率，以保证当你遭遇网络波动时，发送码率不会低于这个值。
- 视频编码器大部分情况下将不会降低发送分辨率，但是可能会降低帧率

如果你设置了流畅优先:
- SDK 将不会启用最小码率策略，证当你遭遇网络波动时，发送端将会尽可能地降低码率来保证订阅端的画面不会出现中断和卡顿
- 视频编码器大部分情况下将不会降低帧率，但是可能会降低发送分辨率

### 示例代码

```js
const videoTrack = await AgoraRTC.createCameraVideoTrack({
  // 使用清晰优先
  optimizationMode: "detail",
});


const videoTrack2 = await AgoraRTC.createCameraVideoTrack({
  // 使用流畅优先
  optimizationMode: "motion",
});

// 使用默认策略
const videoTrack2 = await AgoraRTC.createScreenVideoTrack();
```

### API 参考

- [CameraVideoTrackInitConfig.optimizationMode](/api/cn/interfaces/cameravideotrackinitconfig.html#optimizationmode)
- [ScreenVideoTrackInitConfig.optimizationMode](/api/cn/interfaces/screenvideotrackinitconfig.html#optimizationmode)
- [CustomVideoTrackInitConfig.optimizationMode](api/cn/interfaces/screenvideotrackinitconfig.html#optimizationmode)