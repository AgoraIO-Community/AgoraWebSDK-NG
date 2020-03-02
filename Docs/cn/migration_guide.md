---
id: migration_guide
title: 从 Agora Web SDK 迁移到 Agora Web SDK NG
sidebar_label: 迁移指南
---

这篇文章面向的对象是已经使用过 [Agora Web SDK](https://docs.agora.io/cn/Video/start_call_web?platform=Web) 的用户，如果你希望把你的应用从 Agora Web SDK 迁移到 Agora Web SDK NG，希望这篇文档对你能有所帮助。

我们觉得首先需要提醒的是 Agora Web SDK NG 是一个 **不向下兼容** 的版本，这意味这迁移的过程可能不会那么顺利。因为我们移除了所有 `callback` 转而使用 `Promise` 的原因，70% 以上的 API 都需要手动修改，除此之外还有一些架构及逻辑层面的改动也需要注意，与其说是迁移，我们更希望你把迁移过程想象成从头重新集成 Agora Web SDK NG。

这篇文章首先会列出 Agora Web SDK NG 在哪些行为和方法上和官网版本有区别，之后会以一个多人会议应用为例，从创建 `Client` 开始详细对比和官网版本用法上的不同，最后我们会提供完整的 API 改动列表，方便进行后续的迁移工作。

## 改动简介

### 所有异步方法现在都会返回 Promise
这里的异步方法包括：加入/离开频道、发布订阅、获取媒体设备、开启/关闭转码推流等等。在官网版本中，这些异步操作通过会使用回调函数（比如加入房间）、事件通知（比如发布订阅）的方式来通知用户异步操作的结果，在 Agora Web SDK NG 中，统一使用 Promise。

### 基于音视频轨道的媒体控制
在 Agora Web SDK NG 中，我们移除了 [Stream](https://docs.agora.io/cn/Video/API%20Reference/web/interfaces/agorartc.stream.html) 对象，取而代之的是 `Track` 对象。一个音视频流是由多个音视频轨道构成的，我们现在不会去直接创建/发布/订阅一个流，而是去创建/发布/订阅一个或多个轨道来实现媒体管理。这样实现的好处是音视频的逻辑互不干扰各自独立，同时也比官网版本的 `Stream.addTrack`/`Stream.removeTrack` 这些方法用起来方便的多。

> Agora Web SDK NG 允许同时发布多个音频轨道，SDK 会自动混音，但是视频轨道只允许同时发布一个。

除了把 `Stream` 拆分成 `Track`，在 Agora Web SDK NG 中还会区分 `RemoteTrack` 和 `LocalTrack`，有些方法和对象只在本地有，有些只在远端有。

这个改动影响多个 API 的使用，包括本地媒体对象的采集/发布音视频/订阅音视频等等，你可以在稍后的 [具体介绍](#发布本地的音视频) 中查阅这些操作在 Agora Web SDK NG 中要怎么使用。

### 频道内事件通知机制变化
首先在我们在 Agora Web SDK NG 中对事件名的命名风格进行了统一，比如原来 Token 过期事件是 `onTokenPrivilegeWillExpire`，现在是 `token-privilege-will-expire`。还有对一些事件名称做了调整以便它可以更好地被理解，比如 `peer-online`/`peer-offline` 现在是 `user-joined`/`user-leaved`，`stream-added`/`stream-removed` 现在是 `user-published` / `user-unpublished` 等等，这些详细的列表你都可以稍后从[这里](#agora-web-sdk-ng-api-改动表) 查阅。

其次我们调整了事件回调携带参数的格式，官网版本的事件回调如果需要携带多个参数，会把这些参数统一包在一个对象中，但是 Agora Web SDK NG 会直接携带多个参数到回调函数中：
```js
// 以 "connection-state-change" 事件为例
// 官网版本
client.on("connection-state-change", e => {
  console.log("current", e.curState, "prev", e.prevState);
});

// Agora Web SDK NG
client.on("connection-state-change", (curState, prevState) => {
  console.log("current", curState, "prev", prevState);
});
```

除了名称和参数变化，还有一个重要的变化是频道内事件通知机制的变化，用一句话说就是在 Agora Web SDK NG 中**不会收到重复的**频道内状态通知事件。

这句话是什么意思呢，让我们假设一个场景：想象你自己是用户 A，和用户 B、C、D 同时加入了一个频道，B、C、D 都有发流。突然你自己发生了网络波动，和频道暂时失去了连接，SDK 会自动帮你重连，**在重连过程中 B 退出了频道，C 取消了发流**，那么当你重连回频道的时候，收到的频道内状态事件将会如何呢？

首先在 A 首次加入频道时，两个版本的 SDK 事件行为都是一致的，你将会收到：
- 用户 B、C、D 加入频道的事件
- 用户 B、C、D 发流的事件

如果你使用的是官网版本，当 SDK 和频道失去连接时，即使可以重连 SDK 也会全部清空频道内的所有状态，认为你此时已经离开了频道。所以当重连回频道的时候就和你自己第一次加入频道时没有区别，你将会收到：
- 用户 C、D 加入频道的事件
- 用户 D 发流的事件

> 可以看出，在官网版本中，你会因为偶然发生的断线重连突然收到了重复的事件，这可能会导致你在上层事件处理时引发一些预期之外的问题。想要规避这个问题，你需要监听连接状态变化，在断线重连时重置一些自己应用层的状态，以避免第二次收到这些事件时引发问题。

如果你使用 Agora Web SDK NG，当 SDK 和频道失去连接时，SDK 不会清空频道内的状态（除非用户手动调用离开频道），SDK 认为你此时还在频道中。所以当重连会频道的时候 SDK 只会向你发送那些在重连过程中你丢失了的事件（B 退出频道，C 取消发流），你将会收到：
- 用户 B 退出频道的事件
- 用户 C 取消发流的事件

> 在 Agora Web SDK NG 中，即使你没有像官网版本那样在断线重连时做一些特殊的逻辑，SDK 也能够确保你的上层应用可以正常的工作，你不会收到重复的事件。

简单来说，在 Agora Web SDK NG 中，事件的通知机制是**更符合人类直觉的**，你不需要像官网版本那样做一些额外的工作。


主要的改动点就是上述几条，还有很多琐碎的改动你可以从完整的[改动列表](#agora-web-sdk-ng-api-改动表)中查阅。下面，我们来实际编写一个多人通话的应用，以此为例，具体看看两个版本 SDK 上使用的差别。

## 迁移实例详解

### 加入频道
首先，我们的第一步都是创建一个 `Client` 对象，然后加入目标频道：

```js
// 使用官网版本
const client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
client.init("APPID", () => {
  client.join("Token", "Channel", null, (uid) => {
    console.log("join success", uid);
  }, (e) => {
    console.log("join failed", e);
  });
});
```
> 我们假设代码运行在一个 async 函数下，以下 Agora Web SDK NG 为了叙述方便都会直接使用 await

```js
// 使用 Agora Web SDK NG
const client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });

try {
  const uid = await client.join("APPID", "Token", "Channel", null);
  console.log("join success");
} catch (e) {
  console.log("join failed", e);
}
```

改动点：
- `join` 因为是异步操作，在 Agora Web SDK NG 中使用 Promise，所以直接配合 async/await 使用
- 移除了 `client.init`, `APPID` 在 `client.join` 时传入，这意味这你可以使用一个 Client 对象先后加入不同 APPID 的频道

### 采集本地摄像头/麦克风
之后，我们需要访问本地的摄像头/麦克风设备创建本地的音视频对象，一般来说我们会默认播放本地的视频，音频则不会播放。

```js
// 使用官网版本
const localStream = AgoraRTC.createStream({ audio: true, video: true });
localStream.init(() => {
  console.log("init stream success");
  localStream.play("DOM_ELEMENT_ID", { muted: true });
}, (e) => {
  console.log("init local stream failed", e);
});
```

```js
// 使用 Agora Web SDK NG
const localAudio = await AgoraRTC.createMicrophoneAudioTrack();
const localVideo = await AgoraRTC.createCameraVideoTrack();
console.log("create local audio/video track success");

localVideo.play("DOM_ELEMENT_ID");
```
上文提到过，我们移除了 `Stream` 对象，所以采集麦克风/摄像头现在是两个独立的方法，分别返回音频轨道对象和视频轨道对象

改动点：
- 音视频对象不会有 `init` 方法了，现在创建方法返回一个 Promise 本身就是异步函数，会包含采集摄像头/麦克风的过程，无需 `init`，创建完就可以直接使用
- 因为音视频对象分离的原因，`play` 方法也不会有 `muted` 这种配置参数了（因为没有意义，不想播音频不调用音频轨道的播放即可）

### 发布本地的音视频
当我们采集完成后，就需要将这些音视频发布到频道中，如果你使用的是 [直播模式](/api/cn/interfaces/clientconfig.html#mode)，在官网版本中发布会自动将你的用户角色设置为 `host`，但是在 Agora Web SDK NG，这需要你手动设置。

```js
// 使用官网版本
client.publish(localStream, err => {
  console.log("publish failed", err);
});
client.on("stream-published",  () => {
  console.log("publish success");
});
```

```js
// 使用 Agora Web SDK NG
try {
  // 如果你使用的不是直播模式则不需要这一句
  await client.setClientRole("host");
  await client.publish([localAudio, localVideo]);
  console.log("publish success");
} catch (e) {
  console.log("publish failed", e);
}
```

改动点：
- `publish` 是异步操作，所以现在会返回 Promise
- 因为 `Stream` 移除的原因，现在 `publish` 接受的参数是 `LocalTrack` 的列表，可以重复调用 `publish` 来增加需要发布的轨道，或者重复调用 `unpublish` 来将一些发布的轨道取消发布

### 订阅远端音视频并播放
如果频道里的其他用户发布了他们的音视频，我们需要自动订阅并播放。这个过程分为两步，首先，在加入频道之前，我们就需要注册远端用户发布的相关事件，之后在收到事件回调时发起订阅。

```js
// 使用官网版本
client.on("stream-added", e => {
  client.subscribe(e.stream, { audio: true, video: true }, err => {
    console.log("subscribe failed", err);
  });
});

client.on("stream-subscribed", e => {
  console.log("subscribe success");
  e.stream.play("DOM_ELEMENT_ID");
});
```

```js
// 使用 Agora Web SDK NG
client.on("user-published", async (remoteUser, mediaType) => {
  await client.subscribe(remoteUser);
  console.log("subscribe success");

  remoteUser.videoTrack.play("DOM_ELEMENT_ID");
  remoteUser.audioTrack.play();
});
```

远端用户发布的事件名从 `stream-added` 改为了 `user-published`，注意 `user-published` 回调中的第二个参数 `mediaType`，这参数有 3 个可能的值：`"video"` / `"audio"` / `"all"`, 分别表示当前这次远端发布操作是发布了视频还是发布了音频还是音视频一起发布。在我们的例子中 mediaType 为 `"all"`。

改动点：
- 移除 `stream-added`/`stream-removed`/`stream-updated` 统一使用 `user-published` / `user-unpublished`
- `subscribe` 因为是异步操作现在会返回 Promise，同时接受的参数为 `remoteUser`，也就是远端用户对象，详细可以参考 API 文档 [AgoraRTCRemoteUser](/api/cn/interfaces/iagorartcremoteuser.html)
- 远端音视频轨道对象会在订阅操作成功后保存在 `remoteUser` 下，直接调用 play 即可播放

好，一个简单的多人通话基本上就是这些代码，看完上述示例希望你能对两个版本 SDK 上设计的差异有个比较正确的认识。在迁移的过程中可能还是会遇到其他问题，下面会列出 Agora Web SDK NG 全部的 API 改动点，你可以对照这个表格修改或重新编写你的代码。

> 在迁移一个具体功能（比如屏幕共享、推流到 CDN等）时，我们建议你首先查阅 Agora Web SDK NG 文档站上的[功能描述](screensharing.md)，这些功能描述的结构和顺序是和官网文档对齐的，有助于你完成迁移

你还可以善用 API 文档右上角的搜索功能，因为大部分 API 的名字我们没有改动，只是改动了参数和返回，你可以搜索 API 名称查看它在 Agora Web SDK NG 中的具体函数签名

![](assets/doc_search.png)

## Agora Web SDK NG API 改动表

### AgoraRTC
- `getScreenSources` 更名为 [getElectronScreenSources](/api/cn/interfaces/iagorartc.html#getelectronscreensources)，并且移除了回调参数，现在会返回一个 Promise
- [getDevices](/api/cn/interfaces/iagorartc.html#getdevices) 现在会返回一个 Promise，同时增加了 [getCameras](/api/cn/interfaces/iagorartc.html#getcameras) 和 [getMicrophones](/api/cn/interfaces/iagorartc.html#getmicrophones)
- 移除了 `Logger` 对象，增加 [disableLogUpload](/api/cn/interfaces/iagorartc.html#disablelogupload) / [enableLogUpload](/api/cn/interfaces/iagorartc.html#enablelogupload) / [setLogLevel](/api/cn/interfaces/iagorartc.html#setloglevel) 用于控制日志上报和打印行为
- 移除了 `createStream`，现在使用 [createMicrophoneAudioTrack](/api/cn/interfaces/iagorartc.html#createmicrophoneaudiotrack) 创建麦克风轨道，使用 [createCameraVideoTrack](/api/cn/interfaces/iagorartc.html#createcameravideotrack) 创建摄像头轨道，使用 [createScreenVideoTrack](/api/cn/interfaces/iagorartc.html#createscreenvideotrack) 创建屏幕共享轨道，使用 [createBufferSourceAudioTrack](/api/cn/interfaces/iagorartc.html#createbuffersourceaudiotrack) 创建音频文件轨道（用于混音），使用 [createCustomAudioTrack](/api/cn/interfaces/iagorartc.html#createcustomaudiotrack) 和 [createCustomVideoTrack](/api/cn/interfaces/iagorartc.html#createcustomvideotrack) 创建自定义音视频轨道（用于自采集）

### Client
- 移除 `Client.init`
- 移除 `Client.getConnectionState`，添加 [Client.connectionState](/api/cn/interfaces/iagorartcclient.html#connectionstate) 字段表示当前和服务器的连接状态
- [连接状态](/api/cn/globals.html#connectionstate)增加状态 `RECONNECTING` 表示当前正在重连，原来的 `CONNECTING` 仅表示首次正在建立连接
- 添加 [Client.uid](/api/cn/interfaces/iagorartcclient.html#uid) 来表示当前本地用户的用户 ID
- 添加 [Client.remoteUsers](/api/cn/interfaces/iagorartcclient.html#remoteusers) 来表示当前远端用户的用户列表
- [Client.addInjectStream](/api/cn/interfaces/iagorartcclient.html#addinjectstreamurl) 现在会返回一个 Promise 来标志输入媒体流成功/失败，移除 `Client.on("streamInjectStatus")`
- [Client.removeInjectStream](/api/cn/interfaces/iagorartcclient.html#addinjectstreamurl)，同时移除它的 `url` 参数
- [Client.enableDualStream](/api/cn/interfaces/iagorartcclient.html#enabledualstream) / [Client.disableDualStream](/api/cn/interfaces/iagorartcclient.html#disabledualstream) 移除回调参数，现在会返回 Promise
- 移除 `Client.getCameras`, `Client.getDevices`, `Client.getRecordingDevices`, 现在这些方法被移动到 `AgoraRTC` 下
- 移除 `Client.getPlayoutDevices`
- 移除 `Client.getLocalAudioStats`、`Client.getLocalVideoStats`、`Client.getRemoteAudioStats`、`Client.getRemoteVideoStats`，现在音视频媒体统计数据统一通过 [LocalAudioTrack.getStats](/api/cn/interfaces/ilocalaudiotrack.html#getstats) 、[LocalVideoTrack.getStats](/api/cn/interfaces/ilocalvideotrack.html#getstats) 、[RemoteAudioTrack.getStats](/api/cn/interfaces/iremoteaudiotrack.html#getstats) 、[RemoteVideoTrack.getStats](/api/cn/interfaces/iremotevideotrack.html#getstats) 这些方法来获取，同时字段都做了改变，具体参阅 API 文档
- 移除 `Client.getSystemStats`
- 移除 `Client.getSessionStats` / `Client.getTransportStats`，现在使用一个方法统一获取这些状态 [Client.getRTCStats](/api/cn/interfaces/iagorartcclient.html#getrtcstats)
- [Client.join](/api/cn/interfaces/iagorartcclient.html#join) 现在会返回一个 Promise，移除回调参数，增加 APPID 参数
- [Client.leave](/api/cn/interfaces/iagorartcclient.html#leave) 现在会返回一个 Promise，移除回调参数
- 增加 [Client.once](/api/cn/interfaces/iagorartcclient.html#once) 只监听目标事件一次
- 增加 [Client.removeAllListeners](/api/cn/interfaces/iagorartcclient.html#removealllisteners) 用于删除所有事件监听
- [Client.publish](/api/cn/interfaces/iagorartcclient.html#publish) 现在需要传入 [LocalTrack](/api/cn/interfaces/ilocaltrack.html) 的列表，现在会返回一个 Promise，同时移除 `Client.on("stream-published")` 回调
- [Client.unpublish](/api/cn/interfaces/iagorartcclient.html#publish) 现在会返回一个 Promise
- [Client.subscribe](/api/cn/interfaces/iagorartcclient.html#subscribe) 现在使用 [AgoraRTCRemoteUser](/api/cn/interfaces/iagorartcremoteuser.html) 作为参数，返回一个 Promise，移除 `Client.on("stream-subscribed")`
- [Client.unsubscribe](/api/cn/interfaces/iagorartcclient.html#unsubscribe) 现在使用 [AgoraRTCRemoteUser](/api/cn/interfaces/iagorartcremoteuser.html) 作为参数，返回一个 Promise
- [Client.renewToken](/api/cn/interfaces/iagorartcclient.html#renewtoken) 现在会返回一个 Promise
- [Client.setClientRole](/api/cn/interfaces/iagorartcclient.html#setclientrole) 移除回调参数，现在会返回一个 Promise。**现在设置角色为 audience 后不会自动 unpublish，，调用 publish 时也不会自动把角色设置成 host**
- 移除 `Client.setEncryptionMode` 和 `Client.setEncryptionSecret`，现在通过一个方法 [Client.setEncryptionConfig](/api/cn/interfaces/iagorartcclient.html#setencryptionconfig) 来配置
- [Client.setLiveTranscoding](/api/cn/interfaces/iagorartcclient.html#setlivetranscoding) / [Client.startLiveStreaming](/api/cn/interfaces/iagorartcclient.html#startlivestreaming) / [Client.stopLiveStreaming](/api/cn/interfaces/iagorartcclient.html#stoplivestreaming) 现在都会返回 Promise，同时移除 `Client.on("liveTranscodingUpdated")` / `Client.on("liveStreamingStarted")` / `Client.on("liveStreamingFailed")` / `Client.on("liveStreamingStopped")` 事件
- [Client.startChannelMediaRelay](/api/cn/interfaces/iagorartcclient.html#startchannelmediarelay) 现在会返回一个 Promise
  - [ChannelMediaRelayConfiguration](/api/cn/interfaces/ichannelmediarelayconfiguration.html) 移除了 `setDestChannelInfo`, 改为 [addDestChannelInfo](/api/cn/interfaces/ichannelmediarelayconfiguration.html#adddestchannelinfo) 并去除冗余参数，具体参考 API 文档
  - [ChannelMediaRelayConfiguration](/api/cn/interfaces/ichannelmediarelayconfiguration.html) 去除了 [setSrcChannelInfo](/api/cn/interfaces/ichannelmediarelayconfiguration.html#setsrcchannelinfo) 的冗余参数
- [Client.stopChannelMediaRelay](/api/cn/interfaces/iagorartcclient.html#stopchannelmediarelay) 现在会返回一个 Promise
- [Client.updateChannelMediaRelay](/api/cn/interfaces/iagorartcclient.html#updatechannelmediarelay) 移除回调参数，现在会返回一个 Promise
- 移除 `Client.on("first-video-frame-decode")` 和 `Client.on("first-audio-frame-decode")`，现在这两个事件通过 [RemoteTrack.on("first-frame-decode")](/api/cn/interfaces/iremotetrack.html#event_first_frame_decoded) 触发
- 移除 `Client.on("mute-audio")` 、`Client.on("mute-video")` 、`Client.on("unmute-audio")`  、`Client.on("unmute-video")`，现在统一使用事件 [Client.on("user-mute-updated")](/api/cn/interfaces/iagorartcclient.html#event_user_mute_updated) 来通知
- 移除 `Client.on("active-speaker")` 事件，相同的功能由 [Client.on("volume-indicator")](/api/cn/interfaces/iagorartcclient.html#event_volume_indicator) 提供
- `Client.on("onTokenPrivilegeWillExpire")` 和 `Client.on("onTokenPrivilegeDidExpire")` 更名为 [Client.on("token-privilege-will-expire")](/api/cn/interfaces/iagorartcclient.html#event_token_privilege_will_expire) 和 [Client.on("token-privilege-did-expire")](/api/cn/interfaces/iagorartcclient.html#event_token_privilege_did_expire)
- 移除 `Client.on("network-type-changed")` 事件， SDK 无法保证其可靠性
- 移除 `Client.on("connected")` / `Client.on("reconnect")` 事件，连接状态事件统一从 [Client.on("connection-state-change")](/api/cn/interfaces/iagorartcclient.html#event_connection_state_change) 获取
- [Client.on("stream-fallback")](/api/cn/interfaces/iagorartcclient.html#event_stream_fallback) 参数修改，增加 `isFallbackOrRecover` 参数，详见 API 文档
