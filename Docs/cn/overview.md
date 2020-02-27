---
id: overview
title: Agora Web SDK NG 概述
sidebar_label: 概览
---
## 简介
Agora Web SDK NG 是基于 Agora Web SDK 开发的下一代 SDK。能实现基于 Agora SD-RTN 的音视频实时通信功能，支持语音通话、视频通话、音频互动直播、视频互动直播等场景。Agora Web SDK NG 是一个全量重构的版本，主要针对 API 的易用性和内部架构做了较大的调整。

如果您之前接触过官网版本的 [Agora Web SDK](https://docs.agora.io/cn/Video/start_call_web?platform=Web)，新的 SDK 在使用和开发步骤上和原有 SDK 有较大的不同。在 Agora Web SDK NG 中，我们删除了原来的 `Stream` 对象，通过 `LocalTrack`/`RemoteTrack` 对象来控制媒体流（具体可以参阅后面的介绍）。如果您之前没有接触过 Agora Web 相关的产品，Agora Web SDK NG 将会成为一个很好的起点。


## 浏览器兼容性
Agora Web SDK NG 兼容大部分主流浏览器，如下表所示：

|平台|Chrome 58+|Firefox 56+|Safari 11+|Opera 45+|QQ 浏览器最新版|360 安全浏览器|微信浏览器|
|---|---|---|---|---|---|---|---|
|Android 4.1+|	✔|	✘|	N/A|	✘|	✘|	✘|	✘|
|iOS 11+|	✘|	✘|	✔|	✘|	✘|	✘|	✘|
|macOS 10+|	✔|	✔|	✔|	✔|	✔|	✘|	✘|
|Windows 7+|	✔|	✔|	N/A|	✔|	✔|	✔|	✘|

