---
id: release_note
title: Release Note
sidebar_label: Release Note
---

本页提供 Agora Web SDK NG 的发版说明。

## 4.0.1 版

Agora Web SDK NG v4.0.0 于 2020 年 7 月 18 日发布。

### 问题修复

- 修复 Chrome 70 下发布失败的问题
- 修复某些情况下离开频道发布操作没有被中止的问题


## 4.0.0 版

Agora Web SDK NG v4.0.0 于 2020 年 7 月 15 日发布。

### 升级必看

v4.0.0 删除了 `setMute` 方法，新增 `setEnabled` 方法来实现启用或禁用本地轨道。这样做的好处在于：

- 彻底移除 Mute 这一概念，避免混淆 Mute 状态和发布状态。
  - 在 v4.0.0 之前的版本中，Mute 状态发生改变后 SDK 会触发 `Client.on("user-mute-updated")` 回调。
  - 在 v4.0.0 版本中，`setEnabled` 不会引入额外的远端回调事件。如果该本地轨道已发布，`setEnabled(false)` 后远端会触发 `Client.on("user-unpublished")` 回调，`setEnabled(true)` 后远端会触发 `Client.on("user-published")` 回调。
- `setMute(true)` 后，SDK 依然会发送黑帧和静音帧。对于视频轨道来说，Mute 后摄像头的指示灯并不会关闭，因而影响用户体验。而通过 `setEnabled(false)` 禁用本地视频轨道后，SDK 会立刻关闭摄像头并停止采集视频。

> 请注意，由于 `setEnabled` 涉及设备采集，所以是一个**异步方法**，通过 Promise 返回异步操作的结果。

### 新增特性

#### 视频编码策略

v4.0.0 在 `CameraVideoTrackInitConfig`、`ScreenVideoTrackInitConfig` 和 `CustomVideoTrackInitConfig` 类中新增 `optimizationMode` 字段，支持在调用 `createCameraVideoTrack`、`createCustomVideoTrack` 和 `createScreenVideoTrack` 方法创建视频轨道时选择视频画面是清晰优先还是流畅优先：

- 清晰优先：
  - SDK 会自动根据你的采集分辨率和帧率设定一个最小码率。即使遭遇网络波动，发送码率也不会低于这个值，从而确保清晰的视频画面。
  - 大部分情况下，视频编码器不会降低发送分辨率，但是可能会降低帧率。
- 流畅优先：
  - SDK 不会启用最小码率策略。遭遇网络波动时，发送端会降低码率来确保接收端的视频画面不会出现中断和卡顿。
  - 大部分情况下，视频编码器不会降低帧率，但是可能会降低发送分辨率。

> 通过 `createScreenVideoTrack` 创建的视频轨道默认设置为清晰优先。

### 改进

- 重新设计 `AgoraRTC.createScreenVideoTrack` 的 `withAudio` 参数，除了 `enable` 和 `disable` 外，还可设为 `auto`，根据浏览器是否支持决定是否分享音频，以满足更多屏幕共享音频的使用场景。
- 不允许 `mediaType` 参数携带 `"all"`，只能为 `"video"` 或 `"audio"`，以避免代码的重复。这一改动涉及以下 API：
  - `Client.subscribe` 方法中的 `mediaType` 参数不能设为 `"all"`，只能设为 `"audio"` 或 `"video"`。
  - `Client.on("user-published")` 和 `Client.on("user-unpublished")` 回调的 `mediaType` 参数不再报告 `"all"`，只会报告 `"audio"` 或 `"video"`。

### 问题修复

v4.0.0 修复了以下问题：

- 调用 `unpublish` 后远端会触发 `Client.on("user-left")` 回调。
- 在 `"rtc"` 模式下进行屏幕共享发生周期性模糊。
- 频繁发布和取消发布时偶现的发布失败。
- `Client.on("network-quality")` 回调不准。

### API 变更

#### 新增

- 新增 `Client.localTracks`，用于保存已发布的本地轨道对象列表。
- 新增 `LocalTrack.setEnabled`，用于启用或禁用本地轨道。
- `CameraVideoTrackInitConfig`、`ScreenVideoTrackInitConfig` 和 `CustomVideoTrackInitConfig` 类中新增 `optimizationMode` 字段，用于在创建视频轨道时设置视频画面是清晰优先还是流畅优先。

#### 更新

- `AgoraRTC.createScreenVideoTrack` 的 `withAudio` 参数新增支持设为 `auto`。
- `Client.subscribe` 的 `mediaType` 参数不能设为 `"all"`。
- [Client.on("user-published")](/api/cn/interfaces/iagorartcclient.html#event_user_published) 和 `Client.on("user-unpublished")` 回调的 `mediaType` 参数不再报告 `"all"`。

#### 废弃

- 废弃了 `LocalAudioTrackStats.muteState` 属性。
- 废弃了 `LocalVideoTrackStats.muteState` 属性。
- 废弃了 `RemoteAudioTrackStats.muteState` 属性。
- 废弃了 `RemoteVideoTrackStats.muteState` 属性。

#### 删除

- 删除了 `Client.on("user-mute-updated")` 回调。
- 删除了 `LocalTrack.setMute` 方法。
- 删除了 `AgoraRTCRemoteUser.audioMuted` 属性。
- 删除了 `AgoraRTCRemoteUser.videoMuted` 属性。
- 删除了 `LocalTrack.getUserId` 方法。