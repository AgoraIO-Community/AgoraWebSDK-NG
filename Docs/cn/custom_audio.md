---
id: custom_audio
title: 自定义音频采集
sidebar_label: 自定义音频采集
---

## 功能介绍
实时音视频传输过程中，Agora SDK 通常会启动默认的音视频模块进行采集。在以下场景中，你可能会发现默认的音视频模块无法满足开发需求：
- app 中已有自己的音频或视频模块
- 希望使用非 Microphone 采集的音频源，比如裸 PCM 数据
- 需要使用自定义的音频前处理库（变声等）

本文介绍如何使用 Agora Web SDK NG 在项目中实现自定义的音频采集。

## 实现方法
在开始前，请确保已在你的项目中实现基本的实时音视频功能。详见 [实现音视频通话](basic_call.md)。

在创建本地音频轨道时，除了使用 [createMicrophoneAudioTrack](/api/cn/interfaces/iagorartc.html#createmicrophoneaudiotrack) 通过麦克风来创建以外，SDK 还提供了 [createCustomAudioTrack](/api/cn/interfaces/iagorartc.html#createcustomaudiotrack) 来让开发者通过传入一个 [MediaStreamTrack](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack) 对象来创建本地音频轨道。

如果你想自己实现音频采集或者前处理，只需要获取到 `MediaStreamTrack` 对象，就可以通过这个接口来实现自定义音频采集。 例如，你可以自己调用 `getUserMedia` 方法来获取 `MediaStreamTrack`，再通过 `createCustomAudioTrack` 来获取可以在 SDK 中使用本地音频对象。

```js
navigator.mediaDevices.getUserMedia({ video: false, audio: true })
  .then((mediaStream) => {
    const audioMediaStreamTrack = mediaStream.getAudioTracks()[0];
    // create custom audio track
    return AgoraRTC.createCustomAudioTrack({
      mediaStreamTrack: audioMediaStreamTrack,
    });
  })
  .then((localAudioTrack) => {
    // ...
  });
```

> MediaStreamTrack 对象是指浏览器原生支持的 MediaStreamTrack 对象，具体用法和浏览器支持状况请参考 [MediaStreamTrack API 说明](https://developer.mozilla.org/zh-CN/docs/Web/API/MediaStreamTrack)。

同样，您也可以利用强大的 WebAudio API 来获取 MediaStreamTrack，以实现一些更定制化的音频处理。

## 相关 API
- [createCustomAudioTrack](/api/cn/interfaces/iagorartc.html#createcustomaudiotrack)
- [LocalAudioTrack](/api/cn/interfaces/ilocalaudiotrack.html)