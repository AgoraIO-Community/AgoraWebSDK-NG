---
id: create_local_track
title: 创建本地轨道
sidebar_label: 创建本地轨道
---

## 功能介绍

本章将详细介绍如何使用 Agora Web SDK NG 来创建本地的音视频轨道对象。在介绍详细的 API 之前，你首先需要了解本地轨道对象的一些设计细节。

Agora Web SDK NG 使用了面向对象的设计模式，我们首先设计了 [LocalTrack](/api/cn/interfaces/ilocaltrack.html) 这一个基础的抽象类来描述所有的本地轨道对象，它定义了本地轨道对象的公共方法和行为，所有的本地轨道对象都继承于 `LocalTrack`。比如在我们 [publish](/api/cn/interfaces/iagorartcclient.html#publish) 方法的函数签名中，我们只要求发布的对象是 `LocalTrack` 即可。所以无论通过什么方式创建的本地轨道对象，它都满足 `publish` 方法的参数要求。

在 `LocalTrack` 之上，我们还定义了 [LocalAudioTrack](/api/cn/interfaces/ilocalaudiotrack.html) 和 [LocalVideoTrack](/api/cn/interfaces/ilocalvideotrack.html) 代表本地音频轨道对象和本地视频轨道对象。这两个类分别针对音视频不同的特性增加了不同的方法，比如 `LocalAudioTrack` 增加了获取和音量控制等方法、`LocalVideoTrack` 增加了美颜。

最后，我们再通过不同的创建方式，根据不同应用场景基于 `LocalAudioTrack` 和 `LocalVideoTrack` 创建了更上层的本地轨道类。比如继承自 `LocalVideoTrack` 的 [CameraVideoTrack](/api/cn/interfaces/icameravideotrack.html)，这个类表明这个本地视频轨道是来自于摄像头采集的，所以这个类增加了控制摄像头/调整分辨率等方法。

详细的信息可以访问我们的 API 文档查看，SDK 之所以这么设计是为了更好地管理和区分不同对象的方法，以及防止一些非法调用。比如所有的本地轨道都可以被播放，所以 [play](/api/cn/interfaces/ilocaltrack.html#play) 方法在 `LocalTrack` 里就有定义，但是只有本地音频轨道才可以获取音量，所以 [getVolumeLevel](/api/cn/interfaces/ilocalaudiotrack.html#getvolumelevel) 只在 `LocalAudioTrack` 里有定义，本地视频轨道尝试调用的话就会出错。

## 创建轨道
在了解了 SDK 内部关于本地轨道对象的设计后，现在让我们详细梳理一下创建本地轨道对象的各种方法：

### 采集麦克风和摄像头

最常用的方法就是直接通过采集麦克风或者摄像头来创建本地轨道对象，SDK 提供了三种方法来实现采集麦克风和摄像头：
- [createCameraVideoTrack](/api/cn/interfaces/iagorartc.html#createcameravideotrack) 采集摄像头来创建本地视频轨道，返回一个 [CameraVideoTrack](/api/en/interfaces/icameravideotrack.html) 对象
- [createMicrophoneAudioTrack](/api/en/interfaces/iagorartc.html#createmicrophoneaudiotrack) 采集麦克风来创建本地音频轨道，返回一个 [MicrophoneAudioTrack](/api/en/interfaces/imicrophoneaudiotrack.html) 对象
- [createMicrophoneAndCameraTracks](/api/en/interfaces/iagorartc.html#createmicrophoneandcameratracks) 同时采集麦克风和摄像头，返回一个包含 [CameraVideoTrack](/api/en/interfaces/icameravideotrack.html) 和 [MicrophoneAudioTrack](/api/en/interfaces/imicrophoneaudiotrack.html) 的列表

需要注意的是，如果使用 `createMicrophoneAndCameraTracks` 创建本地轨道，因为采集是一次性完成的，所以只要摄像头和麦克风其中一个无法完成采集就会导致整个采集的失败。相反如果分别调用 `createCameraVideoTrack` 和 `createMicrophoneAudioTrack` 其中一个采集失败并不会影响另外一个。请根据你的实际需求选用合适的方法。

调用以上方法时你可以传入一个配置参数来控制采集的行为，详细的参数定义可以参考 [CameraVideoTrackInitConfig](/api/cn/interfaces/cameravideotrackinitconfig.html) 或者 [MicrophoneAudioTrackInitConfig](/api/cn/interfaces/microphoneaudiotrackinitconfig.html)。

```js
// 采集摄像头
const cameraTrack = await AgoraRTC.createCameraVideoTrack();

// 采集麦克风
const microphoneTrack = await AgoraRTC.createMicrophoneAudioTrack();

// 同时采集摄像头和麦克风
const [microphoneTrack, cameraTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
```

> 以上方法均为异步方法，使用时需要配合 async/await 或者 Promise。

### 使用屏幕共享

SDK 提供 [createScreenVideoTrack](/api/cn/interfaces/iagorartc.html#createscreenvideotrack) 方法来创建屏幕共享轨道，这个方法会返回 [LocalVideoTrack](/api/cn/interfaces/ilocalvideotrack.html) 对象，这意味这通过屏幕共享创建的轨道对象只能使用一些视频轨道对象的基础方法，无法像摄像头轨道那样控制分辨率和调整设备。

```js
const screenTrack = await AgoraRTC.createScreenVideoTrack();
```

> 该方法为异步方法，使用时需要配合 async/await 或者 Promise。

如果你需要在 Electron 或较老版本的 Chrome 上使用屏幕共享，又或者你希望了解屏幕共享携带音频的细节，请阅读这篇 [屏幕共享](screensharing.md) 详细了解。


### 使用本地或在线的音频文件

SDK 提供 [createBufferSourceAudioTrack](/api/cn/interfaces/iagorartc.html#createbuffersourceaudiotrack) 方法来通过本地或者在线的音频文件来创建本地音频轨道对象。通过该方法创建的对象类型为 [BufferSourceAudioTrack](/api/cn/interfaces/iagorartc.html#createbuffersourceaudiotrack)，该对象继承自 `LocalAudioTrack`，在其之上增加了控制音频文件播放行为的方法，比如暂停播放/跳转播放/循环播放等。

```js
const audioFileTrack = await AgoraRTC.createBufferSourceAudioTrack({
  source: "https://web-demos-static.agora.io/agora/smlt.flac",
});

// 在播放之前需要调用该方法开始音频文件的读取
audioFileTrack.startProcessAudioBuffer();

audioFileTrack.play();
```

> 该方法为异步方法，使用时需要配合 async/await 或者 Promise。

你可以利用这个方法实现类似混音或者音效的需求，详细可以阅读这篇 [播放音效/混音](audio_effect_mixing.md)。

### 使用自定义的方式创建本地轨道

如果你熟悉 `WebRTC` 或者 [MediaStreamTrack](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack) 相关的 API，你可以通过自己实现采集来完成 `MediaStreamTrack` 的创建。然后通过 [createCustomAudioTrack](/api/cn/interfaces/iagorartc.html#createcustomaudiotrack) 或者 [createCustomVideoTrack](/api/cn/interfaces/iagorartc.html#createcustomvideotrack) 方法来将 `MediaStreamTrack` 对象转换成 SDK 内部的 `LocalAudioTrack` 或者 `LocalVideoTrack` 对象。

```js
// 通过自己实现采集获取 `MediaStreamTrack` 对象
const customMediaStreamTrack = getMediaStreamTrackFromXXX(/* .. */);

const customTrack = AgoraRTC.createCustomVideoTrack({
  mediaStreamTrack: customMediaStreamTrack,
});
```

## 启用/禁用本地轨道
当我们创建好本地的轨道对象后，因为一些产品需求可能需要暂时禁用该轨道以达到暂时关闭麦克风/摄像头的效果。此时你可以使用 [LocalTrack.setEnabled](/api/cn/interfaces/ilocaltrack.html#setenabled) 来启用或者禁用当前的本地轨道对象。

当轨道被禁用后，该轨道的本地播放将会停止，如果该轨道已经发布，发布也会停止，此时远端会收到 `user-unpublished` 回调。根据本地轨道类型的不同，调用 `setEnabled` 后会有一些不同的行为：
- 通过设备采集创建的本地轨道（`CameraVideoTrack`/`MicrophoneAudioTrack`）：当调用 `setEnabled(false)` 后，会停止采集并释放其占用的设备，如果摄像头或麦克风有指示灯，此时指示灯会熄灭。当调用 `setEnabled(true)` 后，会自动恢复采集。
- 通过其他方式创建的本地轨道：当调用 `setEnabled(false)` 后，会默认编码黑屏帧（视频轨道）或者静音包（音频轨道）。当调用 `setEnabled(true)` 后，会自动恢复正常编码。

```js
const videoTrack = await AgoraRTC.createCameraVideoTrack();

// 暂时关闭摄像头采集
await videoTrack.setEnabled(false);

// ...

// 恢复摄像头采集
await videoTrack.setEnabled(true);
```

> 该方法为异步方法，使用时需要配合 async/await 或者 Promise。

## 错误处理
在创建本地音视频对象的过程中，由于不同设备和浏览器之间的差异，SDK 可能在调用上述方法时抛出异常。下面列举在调用采集方法时可能会遇到的错误：

- NOT_SUPPORT 使用的功能在这个浏览器上不支持
- MEDIA_OPTION_INVALID 指定的采集参数无法被满足，一般是设备不支持指定的分辨率/帧率
- DEVICE_NOT_FOUND 找不到指定的采集设备
- PERMISSION_DENIED 用户拒绝授予访问摄像头/麦克风的权限，或者屏幕共享选择共享源时用户关闭了选择窗口
- CONSTRAINT_NOT_SATISFIED 浏览器不支持指定的采集选项
- SHARE_AUDIO_NOT_ALLOWED 屏幕共享分享音频时用户没有勾选 “分享音频”