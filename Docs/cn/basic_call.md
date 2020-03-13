---
id: basic_call
title: 实现基本音视频通话
sidebar_label: 实现基本通话
---

本文介绍如何使用 Agora Web SDK NG 实现基本音视频通话。

> 由于浏览器的安全策略对除 127.0.0.1 以外的 HTTP 地址作了限制，Agora Web SDK NG 仅支持 HTTPS 协议或者 http://localhost（http://127.0.0.1）。请勿使用 HTTP 协议在 http://localhost（http://127.0.0.1） 之外访问你的项目。

## 常用对象
在使用 Agora Web SDK NG 时，你会经常用到以下两种对象：

- [AgoraRTCClient](/api/en/interfaces/iagorartcclient.html) 对象，代表一个本地客户端。`AgoraRTCClient` 类的方法提供了音视频通话的主要功能，例如加入频道、发布音视频轨道等。
- [LocalTrack](/api/en/interfaces/ilocalaudiotrack.html) 对象 和 [RemoteTrack](/api/en/interfaces/iremotetrack.html) 对象，代表本地和远端的音视频轨道对象。音视频轨道对象用于播放等音视频相关的控制。

> 音视频流由音视频轨道构成。在 Agora Web SDK NG 中，我们通过操作音视频轨道对象来控制音视频流的行为。

## 基本流程
一次简单的音视频通话的步骤一般如下：
1. 根据项目的 `APP ID` 创建一个本地客户端 `AgoraRTCClient` 对象。
2. 通过 `AgoraRTCClient.join` 加入到一个指定的频道中。
3. 通过采集自己的摄像头/麦克风，分别创建一个 `CameraVideoTrack` 对象（本地视频轨道对象）和一个 `MicrophoneAudioTrack` 对象（本地音频轨道对象）。
4. 通过 `AgoraRTCClient.publish` 将刚刚创建的本地音视频轨道对象发布到频道中。

当有其他用户加入频道并且也发布音视频轨道时：
1. SDK 会触发 `client.on("user-published")` 事件，在这个事件回调函数的参数中你可以拿到远端用户对象 `AgoraRTCRemoteUser`，表示这个用户刚刚发布了音视频轨道。
2. 通过 `subscribe` 订阅我们刚刚获取到的 `AgoraRTCRemoteUser`。
3. 订阅完成后，访问 `AgoraRTCRemoteUser.audioTrack` / `AgoraRTCRemoteUser.videoTrack` 即可获取到 `RemoteAudioTrack`（远端音频轨道对象） / `RemoteVideoTrack`（远端视频轨道对象）。

为方便起见，我们为下面要用到的示例代码预定义了两个变量和一个函数，接下来的示例代码都包裹在这个函数中。此步骤不是必须的，你可以根据你的项目有其他的实现。

```js
const rtc = {
  // 用来放置本地客户端
  client: null,
  // 用来放置本地音视频频轨道对象
  localAudioTrack: null,
  localVideoTrack: null,
};

const options = {
  // 这里需要替换成你自己项目的 APP ID
  appId: "<YOUR APP ID>",
  // 目标频道名
  channel: "demo_channel_name",
  // 如果你的项目开启了 Token 鉴权，这里填写生成的 Token 值
  token: null,
};

async function startBasicCall() {
  /**
   * 接下来的代码写在这里
   */
}

startBasicCall();
```

### 创建本地客户端

```js
rtc.client = AgoraRTC.createClient({ mode: "rtc", codec: "h264" });
```

调用 `createClient` 方法创建本地客户端。需注意 `mode` 和 `codec` 这两个参数的设置：
- `mode` 用于设置[频道场景](https://docs.agora.io/cn/Agora%20Platform/terms?platform=All%20Platforms%23live-broadcast-core-concepts#%E9%A2%91%E9%81%93%E6%A8%A1%E5%BC%8F)。一对一或多人通话中，建议设为 `"rtc"`，使用通信场景；互动直播中，建议设为 `"live"`，使用直播场景。Agora Web SDK NG 会根据使用场景的不同实行不同的优化策略
- `codec` 用于设置浏览器使用的编解码格式。如果你需要使用 Safari 12.1 及之前版本，将该参数设为 `"h264"`；其他情况我们推荐使用 `"vp8"`。

### 加入目标频道

```js
const uid = await rtc.client.join(options.appId, options.channel, options.token, null);
```

调用 `join` 方法即可加入目标频道。该方法返回一个 `Promise`，当其 `resolve` 时表示加入频道成功，如果 `reject` 了表示加入频道出现错误。我们可以利用 `async/await` 极大地简化我们的代码。

在 `join` 方法中需要注意以下参数：
- `appid`: 上文中提到的项目 App ID，如果不清楚，请参考[前提条件](setup.md#前提条件)
- `channel`: 频道名，长度在 64 字节以内的字符串。
> - 在我们的示例项目中，`channel` 的值为 `demo_channel_name`。
> - 如果你启用了 App 证书，请注意这里传入的 channel 值和生成 Token 的 channel 值需要保持一致。
- `token`: 该参数为可选。如果你的 Agora 项目开启了 App 证书，你需要在该参数中传入一个 Token，详见 [使用 Token](https://docs.agora.io/cn/Agora%20Platform/token?platform=All%20Platforms#%E4%BD%BF%E7%94%A8-token)。
  - 在测试环境，我们推荐使用控制台生成临时 Token，详见 [获取临时 Token](https://docs.agora.io/cn/Agora%20Platform/token?platform=All%20Platforms%23get-a-temporary-token#%E8%8E%B7%E5%8F%96%E4%B8%B4%E6%97%B6-token)。
  - 在生产环境，我们推荐你在自己的服务端生成 Token，详见 [生成 Token](https://docs.agora.io/cn/Interactive%20Broadcast/token_server)。
> 在我们的示例项目中，为了叙述方便，没有开启 App 证书，所以不需要校验 Token，`token` 的值为 `null`。
- `uid`：用户 ID，频道内每个用户的 UID 必须是唯一的。你可以通过这个参数指定用户的 UID，一般来说这里都填 `null`，表示让 Agora 自动分配一个 UID 并在 `join` 的结果中返回。

更多的 API 介绍和注意事项请参考 [AgoraRTCClient.join](/api/cn/interfaces/iagorartcclient.html#join) 接口中的参数描述。

### 创建并发布本地音视频轨道

```js
// 通过采集麦克风创建本地音频轨道对象
rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
// 通过采集摄像头创建本地视频轨道对象
rtc.localVideoTrack = await AgoraRTC.createCameraVideoTrack();
// 将这些音视频轨道对象发布到频道中
await rtc.client.publish([rtc.localAudioTrack, rtc.localVideoTrack]);

console.log("publish success!");
```

以上 3 行代码展示了创建并发布本地音视频轨道的整个过程。前两行我们会通过采集摄像头/麦克风来创建本地音视频轨道对象，之后直接调用 `publish` 方法，将这些本地音视频轨道对象当作参数即可完成音视频的发布。

注意上面 2 个方法都会返回 `Promise`，和刚刚的 `join` 一样，`resolve` 时代表成功，`reject` 时代表失败。我们使用 `async/await` 来让代码逻辑更清晰。

> 可以利用 `Promise.all` 同时执行本地音视频轨道创建和加入频道，因为这 2 个异步操作没有依赖关系。

详细的采集参数（采集设备/编码参数）控制可以参考相关 API 文档：
- [createMicrophoneAudioTrack](/api/cn/interfaces/iagorartc.html#createmicrophoneaudiotrack)
- [createCameraVideoTrack](/api/cn/interfaces/iagorartc.html#createcameravideotrack)

### 订阅远端用户
当远端用户发布音视频轨道时，会触发 `client.on("user-published")` 事件，我们需要通过 `client.on` 监听该事件并在回调中订阅新加入的远端用户。

> 我们建议在创建客户端对象之后立即监听事件，以避免有些事件因为没有监听而错过没有收到。放在这里介绍是因为叙述顺序。

在 `createClient` 后下一行插入以下代码，监听 `client.on("user-published")` 事件。当有远端用户发布时开始订阅，并在订阅后自动播放远端音视频轨道对象。

```js
rtc.client.on("user-published", async (user, mediaType) => {
  // 开始订阅远端用户
  await rtc.client.subscribe(user);
  console.log("subscribe success");

  // 当订阅完成后，就可以从 `user` 中获取远端音视频轨道对象了
  const remoteAudioTrack = user.audioTrack;
  const remoteVideoTrack = user.videoTrack;

  // 动态插入一个 DIV 节点作为播放远端视频轨道的容器
  const playerContainer = document.createElement("div");
  // 给这个 DIV 节点指定一个 ID，这里指定的是远端用户的 UID
  playerContainer.id = user.uid;
  playerContainer.style.width = "640px";
  playerContainer.style.height = "480px";
  document.body.append(playerContainer);

  // 订阅完成，播放远端音视频
  // 传入我们刚刚给 DIV 节点指定的 ID，让 SDK 在这个节点下创建相应的播放器播放远端视频
  remoteVideoTrack.play(user.uid);
  // 播放音频因为不会有画面，不需要提供 DOM 元素的信息
  remoteAudioTrack.play();
});
```

> 注意这个事件的第二个参数 `mediaType`, 它指远端用户当前发布的媒体类型。同一个远端用户可能先发布一个音频轨道再发布一个视频轨道，在这种情况下，`user-published` 将会触发两次，第一次触发时 `mediaType` 为 `audio`，第二次触发时 `mediaType` 为 `video`。示例代码中，音视频轨道是同时发布的，只会触发一次，`mediaType` 为 `all`, 所以暂时用不到这个参数。

当远端用户取消发布/远端用户离开了频道时，会触发 `client.on("unpublished")` 事件。此时我们需要销毁刚刚动态创建的 DIV 节点。

在刚刚监听 `client.on("user-published")` 事件的代码下一行插入以下代码，监听 `client.on("unpublished")` 事件。

```js
rtc.client.on("user-unpublished", user => {
  // 获取刚刚动态创建的 DIV 节点
  const playerContainer = document.getElementById(user.uid);
  // 销毁这个节点
  playerContainer.remove();
});
```

### 离开频道
一般来说，离开频道有以下几个步骤：
1. 销毁创建的本地音视频轨道，解除网页对摄像头和麦克风的访问。
2. 手动销毁之前动态创建的 DIV 节点。
3. 调用 `leave` 离开频道。

```js
async function leaveCall() {
  // 销毁本地音视频轨道
  rtc.localAudioTrack.close();
  rtc.localVideoTrack.close();

  // 遍历远端用户
  rtc.client.remoteUsers.forEach(user => {
    // 销毁动态创建的 DIV 节点
    const playerContainer = document.getElementById(user.uid);
    playerContainer && playerContainer.remove();
  });

  // 离开频道
  await rtc.client.leave();
}
```

> 在不同的产品设计中，离开频道可以既不销毁本地流，也不销毁动态创建的 DIV 节点。这些操作不是必须的，根据您自己的情况调整代码。

## Demo 体验

我们提供了一个简单的演示页面，完成了上面所述的基本步骤。你可以访问这个 [地址](/demo/basicVideoCall/index.html) 在线体验。
