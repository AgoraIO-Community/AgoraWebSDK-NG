---
id: join_and_leave
title: 加入/离开频道
sidebar_label: 加入/离开频道
---

在 Agora Web SDK NG 中，我们使用 [AgoraRTCClient](/api/cn/interfaces/iagorartcclient.html) 对象来管理一个本地用户在目标频道内的行为。所以在加入目标频道之前，让我们先创建一个 `AgoraRTCClient` 对象。

## 创建 AgoraRTCClient 对象
创建 `AgoraRTCClient` 对象非常简单，直接调用 [AgoraRTC.createClient](/api/cn/interfaces/iagorartc.html#createclient) 即可。在创建 `AgoraRTCClient` 时，我们需要指定使用的编码格式以及频道场景：

```js
const client = AgoraRTC.createClient({
  codec: "vp8",
  mode: "live",
  
});
```

### 选择合适的编码格式
Agora Web SDK NG 支持两种编码格式 `"vp8"` 和 `"h264"`，不同的浏览器和不同的设备对这两种格式的编解码支持都不同。建议您根据实际需求并结合实际的设备/浏览器选择合适的编码格式。

该配置只会影响发布端的编码格式，对于订阅端来说只要其支持该格式的解码，都能正常完成解码。比如 Desktop Chrome 57 以上即支持 VP8 也支持 H.264，如果频道中有两个主播分别发布了 VP8 和 H.264 的视频，使用 Desktop Chrome 57 的观众都可以完成订阅和解码，但是 Safari 12.1 以下的设备不支持 VP8 的编解码，那么使用 Safari 12.1 以下版本浏览器的观众就无法解码 VP8 那一路的流。

下面列出不同浏览器和平台所支持的编解码格式作为参考：

|Browser|VP8|H.264|
|---|---|---|
|Desktop Chrome 58+|✔|✔|
|Firefox 56+|✔|✔*|
|Safari 12.1+|✔|✔|
|Safari < 12.1|✘|✔|
|Android Chrome 58+|✔|?*|

> - Firefox 的 H.264 依赖 `OpenH264 Video Codec provided by Cisco Systems, Inc.` 插件，这个插件会在 Firefox 安装成功后自动在后台下载并默认启用，但是如果此时插件没有下载完成，Firefox 的 H.264 将不可用。
> - Chrome 会在 Android 设备上对 H.264 强制使用硬件编解码。此时就算 Chrome 声称支持 H.264，如果 Android 设备的芯片没有 H.264 的硬件编解码支持，H.264 实际上也是不可用的。

### 选择合适的频道场景
Agora RTC SDK NG 支持两种频道场景 `"rtc"`(通信场景) 和 `"live"`(直播场景)。

通信场景适合多人会议，在线聊天等场景。这种场景的特征是频道内的所有用户往往需要互相交流但是频道内用户的总数不会太多。在这种场景下，发布端除了第一帧以外不会主动编码关键帧，只有当有人需要订阅时，会发起一个关键帧请求，此时发布端才会编码一个关键帧。这样的好处是可以加快首帧出图的时间，同时减少编码不必要的关键帧来降低对带宽的占用。但是如果订阅端的人数很多而且订阅操作很频繁，短时间内大量的关键帧请求会给发布端带来很大压力，此时我们推荐使用直播场景。

直播场景适合发布端很少但是订阅端很多的场景，这种场景下我们定义了两种用户角色：观众和主播。主播能够发送和接收音视频，观众不能发送，只能接收音视频。你可以通过修改 `createClient` 的 [role](/api/cn/interfaces/clientconfig.html#role) 参数来指定用户角色，也可以调用 [setClientRole](/api/cn/interfaces/iagorartcclient.html#setclientrole) 来动态修改。在直播场景下，主播会固定每隔 1 秒编码一个关键帧，不会依赖关键帧请求。

## 加入频道
创建好 `AgoraRTCClient` 对象后，接下来就可以加入频道了，直接调用 [AgoraRTCClient.join](/api/cn/interfaces/iagorartcclient.html#join) 即可加入频道。

> `join` 方法详细参数说明请参阅 API 文档。注意该方法为异步方法，使用时需要配合 Promise 或者 async/await。

```js
// 自动分配数字 UID
const uid = await client.join("APPID", "CHANNEL", "TOKEN");

// 指定数字 UID
await client.join("APPID", "CHANNEL", "TOKEN", 393939);

// 指定 String UID
await client.join("APPID", "CHANNEL", "TOKEN", "my_user_id");
```

这里需要注意 `join` 方法的第四个参数，当不传入任何值时，Agora 将会为这个加入的本地用户自动分配一个数字 UID 作为其唯一的身份标识。你也可以自己传入相应的 UID 参数来实现指定 UID，UID 目前支持数字和 String 两种类型，在使用指定 UID 功能时请注意以下事项：

- 指定 UID 时，一个频道内的 UID 类型必须是一致的，也就是不能出现数字 UID 和 String UID 混用的情况
- 指定 UID 时，如果频道内有其他用户也在使用这个 UID，那么正在使用这个 UID 用户会被 Agora 网关立刻踢出，新用户将会使用 UID 成功加入。（用户因为 UID 重复被踢出时会触发 `connection-state-change` 回调，详细见下文的连接状态介绍）
- 使用 String UID 时，实际上是在 Agora 内部服务里注册了一个 String UID 到数字 UID 的映射关系，所以使用 String UID 会增加加入房间的流程，会在一定程度上影响加入频道的时间

## 离开频道
通过调用 [AgoraRTCClient.leave](/api/cn/interfaces/iagorartcclient.html#leave) 可以离开当前频道。该方法在任何时候调用，即使当前正在加入频道或者正在重连。当调用离开频道后，SDK 会立刻销毁所有频道内的连接对象并重置整个频道。如果需要再次加入频道，先调用 `leave` 后再调用 `join` 即可。

> 注意该方法为异步方法，使用时需要配合 Promise 或者 async/await。

```js
await client.leave();
```

## 频道内的连接状态
当一个用户加入目标频道后，因为网络波动可能会导致和 Agora 服务的连接断开，此时 SDK 会自动重新尝试加入频道。下面介绍所有的连接状态：

- "DISCONNECTED": 连接断开。当出于这个状态时，SDK 不会尝试重连。该状态表示用户处于以下任一阶段：
  - 尚未通过 join 加入频道。
  - 已经通过 leave 离开频道。
  - 被 Agora 服务踢出频道或者连接失败等异常情况。
- "CONNECTING": 正在连接中。当调用 join 时为此状态。
- "CONNECTED": 已连接。该状态表示用户已经加入频道，可以在频道内发布或订阅媒体流。
- "RECONNECTING": 连接断开，但是正在尝试重连中。因网络断开或切换而导致 SDK 与服务器的连接中断，SDK 会自动重连，此时连接状态变为 "RECONNECTING"。
- "DISCONNECTING": 正在断开连接。在调用 leave 的时候为此状态。

你可以通过 [AgoraRTCClient.connectionState](/api/cn/interfaces/iagorartcclient.html#connectionstate) 或者 [AgoraRTCClient.on("connection-state-change")](/api/cn/interfaces/iagorartcclient.html#event_connection_state_change) 获取当前最新的状态变化。

## 错误处理
在加入频道的过程中，因为 SDK 使用不当或者网络异常等原因，可能会抛出以下错误：

- INVALID_PARAMS: 提供的参数错误，比如提供了格式非法的 Token
- INVALID_OPERATION: 非法操作，通常由于重复加入频道引起的，请确保重复加入时先调用 `leave`
- OPERATION_ABORT: 加入中止，说明在 `join` 方法成功之前就调用了 `leave` 方法
- UNEXPECTED_RESPONSE: Agora 后台返回了非预期的响应，通常是因为 APPID 或 Token 鉴权失败
- INVALID_UINT_UID_FROM_STRING_UID：通过 String UID 映射数字 UID 失败
- UID_CONFLICT：创建了多个 `AgoraRTCClient` 对象，其中重复使用了同一个 UID
- WS_ABORT: 和 Agora 网关建立 WebSocket 连接失败
