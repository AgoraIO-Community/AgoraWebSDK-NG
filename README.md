# AgoraWebSDK NG

Agora Web SDK NG 是基于 Agora Web SDK 开发的下一代 SDK。能实现基于 Agora SD-RTN 的音视频实时通信功能，支持语音通话、视频通话、音频互动直播、视频互动直播等场景。Agora Web SDK NG 是一个全量重构的版本，主要针对 API 的易用性和内部架构做了较大的调整。

接入指南和使用文档请访问我们的文档站 https://agoraio-community.github.io/AgoraWebSDK-NG/zh-CN/

接入过程中，你可以在本仓库参考 Agora Web SDK NG 的 [Demo 源码](./Demo)，或者体验 [Demo](https://agoraio-community.github.io/AgoraWebSDK-NG/demo/)

> 如果您在接入 Agora Web SDK NG 时遇到问题，或者有任何建议，都可以在本仓库的 Issues 区发帖讨论，我们会尽快处理大家的反馈

## Quick Start

```shell
npm install agora-rtc-sdk-ng --save
```

```js
import AgoraRTC from "agora-rtc-sdk-ng"

const client = AgoraRTC.createClient()

async function publish() {
  const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
  const videoTrack = await AgoraRTC.createCameraVideoTrack();

  await client.publish([audioTrack, videoTrack]);
}

publish().then(/** ... **/).catch(console.error);
```
