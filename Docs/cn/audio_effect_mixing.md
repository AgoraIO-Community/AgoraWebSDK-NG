---
id: audio_effect_mixing
title: 播放音频文件
sidebar_label: 播放音频文件
---

## 功能描述
在通话或直播过程中，除了用户自己说话的声音，有时候需要播放自定义的声音或者音乐文件并且让频道内的其他人也听到，比如需要给游戏添加音效，或者需要播放背景音乐等。在 Agora Web SDK NG 中，如果发布了多个本地音频轨道，SDK 会自动将这些音频混音，所以我们可以通过创建并发布多个本地音频轨道来实现这个需求。

在开始前，请确保已在你的项目中实现基本的实时音视频功能。详见[实现音视频通话](basic_call.md)。

## 实现方法
无论是音效还是背景音乐，本质上都是一个本地或者在线的音频文件，所以我们只需要通过音频文件来创建一个本地音频轨道对象，再将这个轨道和通过麦克风创建的音频轨道一起发布即可实现添加音效或者播放背景音乐等功能。

### 通过音频文件创建音频轨道

SDK 提供 `createBufferSourceAudioTrack` 方法来读取本地或者线上的音频文件并创建对应的本地音频轨道对象(`BufferSourceAudioTrack`)。

```js
// 通过在线音乐创建音频轨道
const audioFileTrack = await AgoraRTC.createBufferSourceAudioTrack({
  source: "https://web-demos-static.agora.io/agora/smlt.flac",
});
console.log("create audio file track success");
```

如果此时直接调用 `audioFileTrack.play()` 或者调用 `client.publish([audioFileTrack])`，你会发现无论是本地还是远端都无法听到音乐声。这是因为通过音频文件创建的音频轨道在音频数据的处理流程上和麦克风音频轨道不同，具体可以看下面的图片介绍：

![](assets/microphone_audio_track.png)

对于麦克风音频来说，SDK 会源源不断地从目标麦克风设备中采集最新的音频数据（AudioBuffer），如果用户调用了 `play()` 方法，这些音频数据就会发送给本地播放组件最终被本地用户听到。如果用户调用了 `publish()` 方法，这些音频数据就会被发送到 Agora 的 SD-RTN 中最终被远端的用户听到。一旦麦克风音频轨道被创建，这个采集操作就会一直进行直到用户自己主动调用 `close()` 方法才会停止，此时音频轨道也将不再可用。

而通过音频文件创建的音频轨道对象（BufferSourceAudioTrack）则不同

![](assets/buffer_source_audio_track.png)

我们无法去 “采集” 一个音频文件，只能通过读取文件来达到一个类似的效果，也就是上图的 `processing` 过程。对于采集来说，一旦开始采集就无法暂停，因为我们永远只能采集到最新的音频数据，但是文件读取则不同，我们可以灵活地选择读取音频数据的方式。我们可以通过暂停文件的读取来实现暂停播放，通过跳转文件读取的位置来实现跳转播放，通过循环读取来实现循环播放等等，这些控制音频文件读取的操作也就是 `BufferSourceAudioTrack` 所提供的核心功能。

回到开始的问题，之所以直接调用 `audioFileTrack.play()` 无法听到声音是因为 `BufferSourceAudioTrack` 默认没有读取音频文件。只要我们调用 `audioFileTrack.startProcessAudioBuffer()` 之后，SDK 就会读取音频文件，开始音频数据的处理流程，从而本地和远端就能听到声音了。

### 控制音频文件的播放

如同上文所说，除了调用 `startProcessAudioBuffer` 开始音频数据的处理流程之外，SDK 还支持暂停/恢复/跳转等功能，详细的 API 见下：

- [startProcessAudioBuffer](/api/cn/interfaces/ibuffersourceaudiotrack.html#startprocessaudiobuffer): 开始读取音乐文件，处理音频数据，该方法还支持设置循环/开始位置等参数。
- [pauseProcessAudioBuffer](/api/cn/interfaces/ibuffersourceaudiotrack.html#pauseprocessaudiobuffer): 暂停处理音频数据。
- [resumeProcessAudioBuffer](/api/cn/interfaces/ibuffersourceaudiotrack.html#resumeprocessaudiobuffer): 恢复处理音频数据。
- [stopProcessAudioBuffer](/api/cn/interfaces/ibuffersourceaudiotrack.html#stopprocessaudiobuffer): 停止处理音频数据。
- [seekAudioBuffer](/api/cn/interfaces/ibuffersourceaudiotrack.html#seekaudiobuffer): 跳转到指定位置。

如果调用了 `play()` 和 `publish()`，处理后的音频数据将发送到本地播放模块和远端，因此以上方法会同时影响本地和远端用户听到的声音。

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

在某些场景中不需要在本地听到音乐，你可以通过 `stop()` 方法关闭音乐在本地的播放，这不会影响远端收到的音频数据。


### 发布多个音频轨道以实现混音

Agora Web SDK NG 支持发布多个音频轨道，如果想实现麦克风和音乐的混音，只要将 `audioFileTrack` 和通过麦克风创建的音频轨道一起发布即可。

```js
const microphoneTrack = await AgoraRTC.createMicrophoneAudioTrack();

// 开始处理来自音频文件的音频数据
audioFileTrack.startProcessAudioBuffer();

// 将 audioFileTrack 和麦克风一起发布开始混音
await client.publish([microphoneTrack, audioFileTrack]);

// 如果想停止混音，可以停止处理音频文件的数据
audioFileTrack.stopProcessAudioBuffer();
// 或者直接将音频文件轨道取消发布
await client.unpublish([audioFileTrack]);
```


## API 参考

- [`createBufferSourceAudioTrack`](/api/cn/interfaces/iagorartc.html#createbuffersourceaudiotrack)
- [`BufferSourceAudioTrack`](/api/cn/interfaces/ibuffersourceaudiotrack.html)

## 开发注意事项
- 请注意线上音频文件的 [CORS](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS) 已经配置好。
- 支持的音频格式为 MP3，AAC 以及浏览器支持的其他音频格式。
- Safari 12 以下的版本不支持混音，所以无法发布多个音频轨道。
- 本地文件仅支持浏览器原生的 [File 对象](https://developer.mozilla.org/zh-CN/docs/Web/API/File)。
- 无论本地发布了几个音频轨道，SDK 都会自动混合为一个音频轨道，因此远端用户只会获取到一个 `RemoteAudioTrack`。