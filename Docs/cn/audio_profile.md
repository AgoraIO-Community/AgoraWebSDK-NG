---
id: audio_profile
title: 设置音频编码属性
sidebar_label: 设置音频编码属性
---

## 功能描述
在一些比较专业的场景里，用户对声音的效果尤为敏感，比如语音电台，此时就需要对双声道和高音质的支持。
所谓的高音质指的是我们提供采样率为 48 Khz、码率 192 Kbps 的能力，帮助用户实现高逼真的音乐场景，这种能力在语音电台、唱歌比赛类直播场景中应用较多。

## 实现方法
在开始前，请确保已在你的项目中实现基本的实时音视频功能。详见 [实现音视频通话](basic_call.md)。

Agora Web SDK NG 提供了 `createMicrophoneAudioTrack` / `createBufferSourceAudioTrack` / `createCustomAudioTrack` 3 种方法给开发者创建本地音频轨道，您可以通过修改这些方法中的的 `encoderConfig` 参数来来调整音频的编码配置。

`encoderConfig` 支持传入 2 种参数：
- SDK 内置的音频编码预设值
- 自定义各种音频编码参数的对象

### 示例代码
```js
// 使用预设值调整音频属性
AgoraRTC.createMicrophoneAudioTrack({
  encoderConfig: "high_quality_stereo",
}).then(/**...**/);

// 自定义音频编码
AgoraRTC.createMicrophoneAudioTrack({
  encoderConfig: {
    sampleRate: 48000,
    stereo: true,
    bitrate: 128,
  },
}).then(/**...**/);
```

### API 参考
- [`createMicrophoneAudioTrack`](/api/cn/interfaces/iagorartc.html#createmicrophoneaudiotrack)
- [`createBufferSourceAudioTrack`](/api/cn/interfaces/iagorartc.html#createbuffersourceaudiotrack)
- [`createCustomAudioTrack`](/api/cn/interfaces/iagorartc.html#createcustomaudiotrack)