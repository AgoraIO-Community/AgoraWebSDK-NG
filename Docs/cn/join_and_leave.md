---
id: join_and_leave
title: 加入/离开频道
sidebar_label: 加入/离开频道
---

在 Agora Web SDK NG 中，我们使用 [AgoraRTCClient](/api/cn/interfaces/iagorartcclient.html) 对象来管理一个本地用户在目标频道内的行为。所以在加入目标频道之前，让我们先创建一个 `AgoraRTCClient` 对象。

## 创建 AgoraRTCClient 对象

创建 `AgoraRTCClient` 对象非常简单，直接调用 [AgoraRTC.createClient](/api/cn/interfaces/iagorartc.html#createclient) 即可。在创建 `AgoraRTCClient` 时，我们需要指定使用的编码格式（`codec`）以及频道场景（`mode`）。

```js
const client = AgoraRTC.createClient({
  codec: "vp8",
  mode: "live",
});
```

### 选择视频编码格式

Agora Web SDK NG 支持两种视频编码格式 `"vp8"`（VP8）和 `"h264"`（H.264），不同的浏览器和不同的设备对这两种编解码格式支持都不同。我们建议根据实际需求并结合实际的设备及浏览器选择合适的编码格式。

> 对于纯音频通话，`"vp8"` 和 `"h264"` 任选其一设置即可。

`codec` 设置只会影响发布端的视频编码格式，对于订阅端来说只要其支持该格式的解码，都能正常完成订阅。比如桌面端 Chrome 58 及以上版本既支持 VP8 也支持 H.264，如果频道中有两个主播分别发布了 VP8 和 H.264 的视频，使用桌面端 Chrome 57 的观众可以订阅和解码这两个主播的视频，但是 Safari 12.1 以下版本不支持 VP8 编解码，使用 Safari 12.1 以下版本浏览器的观众就无法解码 VP8 的视频流。

下表列出不同浏览器和平台所支持的编解码格式作为参考：

|浏览器|VP8|H.264|
|---|---|---|
|桌面端 Chrome 58+|✔|✔|
|Firefox 56+|✔|✔*|
|Safari 12.1+|✔|✔|
|Safari < 12.1|✘|✔|
|Android Chrome 58+|✔|?*|

> - Firefox 的 H.264 依赖 **OpenH264 Video Codec provided by Cisco Systems, Inc.** 插件。Firefox 安装成功后会自动在后台下载该插件并默认启用，但是如果通话时插件没有下载完成，Firefox 的 H.264 将不可用。
> - Android 设备上 Chrome 对 H.264 的支持取决于设备。因为 Chrome 在 Android 设备上对 H.264 强制使用硬件编解码，即使 Chrome 支持 H.264，如果 Android 设备的芯片不支持 H.264 的硬件编解码，H.264 实际上也是不可用的。

### 选择频道场景

频道场景是 Agora 为了对不同的实时音视频场景进行针对性算法优化而提供的一种设置选项。Agora Web SDK NG 支持两种频道场景：`"rtc"`(通信场景) 和 `"live"`(直播场景)。

**通信场景**

通信场景适合多人会议、在线聊天等场景。这种场景的特征是，频道内的所有用户往往需要互相交流，但是用户的总数不会太多。

在通信场景下，发布端除了第一帧以外不会主动编码关键帧，只有当有人需要订阅时，SDK 会发起一个关键帧请求，此时发布端会编码一个关键帧。这样做的好处是可以保证订阅端接收的首帧为关键帧，加快首帧出图，同时减少编码不必要的关键帧来降低对带宽的占用。但是如果订阅的人数很多而且订阅操作很频繁，短时间内大量的关键帧请求会给发布端带来很大压力，此时我们推荐使用直播场景。

**直播场景**

直播场景适合发布端很少但是订阅端很多的场景，这种场景下我们定义了两种用户角色：观众和主播。主播能够发送和接收音视频，观众不能发送、只能接收音视频。你可以通过设置 `createClient` 的 [role](/api/cn/interfaces/clientconfig.html#role) 参数来指定用户角色，也可以调用 [setClientRole](/api/cn/interfaces/iagorartcclient.html#setclientrole) 来动态修改用户角色。在直播场景下，主播固定每隔一秒编码一个关键帧，不依赖关键帧请求。

## 加入频道

创建 `AgoraRTCClient` 对象后，接下来就可以调用 [AgoraRTCClient.join](/api/cn/interfaces/iagorartcclient.html#join) 加入频道。

> `join` 方法详细参数说明请参考 API 文档。注意该方法为异步方法，使用时需要配合 Promise 或者 async/await。

```js
// 自动分配数字 UID
const uid = await client.join("APPID", "CHANNEL", "TOKEN");

// 指定数字 UID
await client.join("APPID", "CHANNEL", "TOKEN", 393939);

// 指定字符串 UID
await client.join("APPID", "CHANNEL", "TOKEN", "my_user_id");
```

这里需要注意 `join` 方法的第四个参数，当不传入任何值时，Agora 会为这个加入的本地用户自动分配一个数字类型的用户 ID 作为其唯一的身份标识。你也可以通过 `uid` 参数自行指定用户 ID。用户 ID 支持数字和字符串两种类型，在指定用户 ID 时请注意以下事项：

- 一个频道内所有用户的用户 ID 类型必须是一致的，也就是不能出现数字用户 ID 和字符串用户 ID 混用的情况。
- 如果频道内已经有其他用户在使用指定的用户 ID，那么正在使用这个 ID 的用户会被 Agora 服务器立刻踢出频道，新用户将会使用此用户 ID 成功加入。用户因为用户 ID 冲突被踢出频道时会触发 `connection-state-change` 回调，详见[频道内的连接状态](#connection)。
- 使用字符串用户 ID 时，实际上是在 Agora 服务里注册了一个字符串用户 ID 到数字用户 ID 的映射关系，所以使用字符串用户 ID 会在一定程度上影响加入频道的时间。

## 离开频道

调用 [AgoraRTCClient.leave](/api/cn/interfaces/iagorartcclient.html#leave) 可以离开当前频道。该方法可以在任何时候调用，即使当前正在加入频道或者正在重连。调用 `leave` 后，SDK 会立刻销毁与当前频道相关的对象，包括订阅的远端用户对象、远端轨道对象、记录连接状态的对象等。如果需要再次加入频道，调用 `leave` 后再调用 `join` 即可。

> 注意 `leave` 为异步方法，使用时需要配合 Promise 或者 async/await。

```js
await client.leave();
```

## <a name="connection"></a>频道内的连接状态

当一个用户加入目标频道后，网络波动可能会导致和 Agora 服务的连接断开，此时 SDK 会自动重新尝试加入频道。

你可以通过 [AgoraRTCClient.connectionState](/api/cn/interfaces/iagorartcclient.html#connectionstate) 或者 [AgoraRTCClient.on("connection-state-change")](/api/cn/interfaces/iagorartcclient.html#event_connection_state_change) 获取当前的连接状态。

下面列出所有的连接状态：

- `"DISCONNECTED"`: 连接断开。处于这个状态时，SDK 不会自动重连。该状态表示用户处于以下任一阶段：
  - 尚未通过 `join` 加入频道。
  - 已经通过 `leave` 离开频道。
  - 被 Agora 服务器踢出频道或者连接失败等异常情况。
- `"CONNECTING"`: 正在连接。调用 `join` 时为此状态。
- `"CONNECTED"`: 已连接。该状态表示用户已经加入频道，可以在频道内发布或订阅媒体轨道。
- `"RECONNECTING"`: 连接断开，正在尝试重连。因网络断开或切换导致 SDK 与服务器的连接中断，SDK 会自动重连，进入此状态。
- `"DISCONNECTING"`: 正在断开连接。在调用 `leave` 的时候为此状态。

## 错误处理

在加入频道的过程中，因为 SDK 使用不当或者网络异常等原因，可能会抛出以下错误：

- INVALID_PARAMS: 提供的参数错误，比如提供了格式非法的 Token。
- INVALID_OPERATION: 非法操作。该错误通常是重复加入频道引起的，请确保重复加入时先调用 `leave`。
- OPERATION_ABORT: 加入被中止，表示在 `join` 方法成功之前就调用了 `leave` 方法。
- UNEXPECTED_RESPONSE: Agora 服务器返回了非预期的响应，通常是因为 App ID 或 Token 鉴权失败，例如开启了 App 证书却未传入 Token。
- INVALID_UINT_UID_FROM_STRING_UID: 通过字符串用户 ID 映射数字用户 ID 失败，请联系 Agora [技术支持](https://agora-ticket.agora.io/)。
- UID_CONFLICT: 创建了多个 `AgoraRTCClient` 对象，且重复使用了同一个用户 ID。
