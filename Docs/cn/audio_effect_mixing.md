---
id: audio_effect_mixing
title: 播放音效/音乐混音
sidebar_label: 播放音效/混音
---

## 功能描述
在通话或直播过程中，除了用户自己说话的声音，有时候需要播放自定义的声音或者音乐文件并且让频道内的其他人也听到，比如需要给游戏添加音效，或者需要播放背景音乐等。在 Agora Web SDK NG 中，如果发布了多个本地音频轨道，SDK 会自动将这些音频混音，所以我们可以通过创建并发布多个本地音频轨道来实现这个需求。

在开始前，请确保已在你的项目中实现基本的实时音视频功能。详见 [实现音视频通话](basic_call.md)。

## 通过音频文件创建本地音频轨道
无论是音效还是背景音乐，本质上都是一个本地或者在线的音频文件。所以首先我们需要通过音频文件来创建一个本地音频轨道对象，再将这个轨道和通过麦克风创建的音频轨道一起发布即可。

Agora Web SDK NG 提供了 `createBufferSourceAudioTrack` 来读取本地或者线上的音频文件，并创建对应的本地音频轨道对象。因为音频数据来自音频文件而不是来自麦克风输入，所以这个音频轨道对象还提供了额外的方法来控制音频文件的播放行为（开始/暂停/跳转等）。详细的描述可以参考 [BufferSourceAudioTrack](/api/cn/interfaces/ibuffersourceaudiotrack.html) 的 API 文档。

```js
// 通过在线音乐创建音频轨道
const audioFileTrack = await AgoraRTC.createBufferSourceAudioTrack({
  source: "https://web-demos-static.agora.io/agora/smlt.flac",
});
console.log("create audio file track success");

// 开始处理音频数据源
audioFileTrack.startProcessAudioBuffer();
// 将处理后的音频数据播放到本地
audioFileTrack.play();
```

此时，我们就可以在本地听到音乐了。注意这里我们播放本地音乐用了两个 API，`startProcessAudioBuffer` 和 `play`。`startProcessAudioBuffer` 指开始从音乐文件的开头处理音乐数据，之后再调用 `play` 才会将当前处理的音乐数据送入声卡，从而被本地听到。

为什么要将播放操作拆成两个 API ？是因为某些需求下，我们不希望在本地听到音乐但是希望将音乐数据发布到频道中。这种时候，就只调用 `startProcessAudioBuffer` 不调用 `play` 即可。

除了 `startProcessAudioBuffer`，SDK 还提供了播放暂停/播放停止/播放跳转等方法来方便用户对音频文件的播放进行控制。

```js
// 暂停处理音频数据
audioFileTrack.pauseProcessAudioBuffer();
// 恢复处理音频数据
audioFileTrack.resumeProcessAudioBuffer();
// 停止处理音频数据
audioFileTrack.stopProcessAudioBuffer();
// 以循环播放的模式开始处理音频数据
audioFileTrack.startProcessAudioBuffer({ loop: true });

// 获取当前的音处理的进度 (秒)
audioFileTrack.getCurrentTime();
// 当前音频文件的总时长（秒）
audioFileTrack.duration;
// 跳转到 50 秒的位置
audioFileTrack.seekAudioBuffer(50);
```

## 发布多个音频轨道以实现混音
当我们创建好了 `audioFileTrack` 之后，再将它和通过麦克风创建的音频轨道一起发布即可。

```js
const microphoneTrack = await AgoraRTC.createMicrophoneAudioTrack();

// 将 audioFileTrack，和麦克风一起发布开始混音
await client.publish([microphoneTrack, audioFileTrack]);

// 如果你想暂时停止混音，可以停止处理音频文件的数据
microphoneTrack.stopProcessAudioBuffer
// 或者直接将音频文件轨道取消发布
await client.unpublish([microphoneTrack]);
```

## API 参考
- [createBufferSourceAudioTrack](/api/cn/interfaces/iagorartc.html#createbuffersourceaudiotrack)
- [BufferSourceAudioTrack](/api/cn/interfaces/ibuffersourceaudiotrack.html)

## 开发注意实现
- 请注意线上音频文件的 [CORS](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS) 已经配置好
- 支持的音频格式为 MP3，AAC 以及浏览器支持的其他音频格式
- Safari 12 以下的版本不支持混音，所以无法发布多路音频
- 本地文件仅支持浏览器原生的 [File 对象](https://developer.mozilla.org/zh-CN/docs/Web/API/File)
- 无论本地发布了几路音频，因为混音的存在，对于远端都只会获取到一个 `RemoteAudioTrack`。