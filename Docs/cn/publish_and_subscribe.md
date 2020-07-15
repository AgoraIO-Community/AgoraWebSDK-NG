---
id: publish_and_subscribe
title: 发布和订阅
sidebar_label: 发布和订阅
---

## 发布音视频

当地完成本地轨道的创建并且成功加入频道后，就可以调用 [AgoraRTCClient.publish](/api/cn/interfaces/iagorartcclient.html#publish) 将这些本地的音视频数据发布到当前频道以供其他人订阅。

```js
const localAudioTrack = ...;
const localVideoTrack = ...;

// 你可以多次调用 publish 来添加你需要发布的轨道
await client.publish(localAudioTrack);
await client.publish(localVideoTrack);

// 也可以一次性将需要发布的轨道一起发布
await client.publish([localAudioTrack, localVideoTrack]);
```

关于发布，需要注意以下行为：
- Agora Web SDK NG 同一时间只能发布一个视频轨道
- Agora Web SDK NG 允许同时发布多个音频轨道，SDK 会自动混音

> Safari 12 以下的浏览器不支持混音，无法使用此特性

- 可以重复调用 `publish` 方法来添加需要发布的轨道，但是不要重复发布同一个轨道对象
- 该方法为异步方法，使用时需要配合 `Promise` 或 `async/await`

### 错误处理
在发布音视频的过程中，可能因为网络环境或者集成问题抛出以下错误：
- INVALID_OPERATION: 非法操作，说明在加入频道成功之前就调用 `publish` 方法
- OPERATION_ABORT: 发布被中止，可能在发布成功之前就主动调用 `leave` 离开了频道
- INVALID_LOCAL_TRACK: 参数错误，传入了非法的 `LocalTrack` 对象
- CAN_NOT_PUBLISH_MULTIPLE_VIDEO_TRACKS: 不允许同时发布多个视频轨道
- NOT_SUPPORT：发布了多个音频轨道，但是浏览器不支持混音
- UNEXPECTED_RESPONSE：收到了 Agora 网关异常的返回，发布失败
- NO_ICE_CANDIDATE: 找不到本地网络出口，可能是网络防火墙或者启用了一些禁止 WebRTC 的浏览器插件

## 取消发布音视频

当完成本地轨道的发布后，就可以调用 [AgoraRTCClient.unpublish](/api/cn/interfaces/iagorartcclient.html#unpublish) 来将正在发布的轨道取消发布。

```js
// 现在已经发布了音视频
await client.publish([localAudioTrack, localVideoTrack]);

// 取消发布视频，此时音频还在正常发布
await client.unpublish(localVideoTrack);

// 也可以，一次性将所有正在发布的轨道全部取消发布
await client.unpublish();
// 或者批量取消发布
await client.unpublish([localAudioTrack, localVideoTrack]);
```

关于取消发布，需要注意以下行为：
- 和 `publish` 一样，`unpublish` 也可以重复调用，你可以配合 `publish` 实现添加删除某个本地轨道
- 该方法为异步方法，使用时需要配合 `Promise` 或 `async/await`

## 订阅音视频

当远端用户成功发布他的音视频流之后，我们会收到 ["user-published"](/api/cn/interfaces/iagorartcclient.html#event_user_published) 事件，这个事件携带两个参数：远端用户对象和远端本地发布的媒体类型。通过这个事件，我们就可以知道此时这名远端用户已经成功发布了他的音频或者视频。此时，我们就可以发起订阅了，也就是调用 [AgoraRTCClient.subscribe](/api/cn/interfaces/iagorartcclient.html#subscribe) 即可。

```js
client.on("user-published", async (user, mediaType) => {
  // 发起订阅
  await client.subscribe(user, mediaTrack);

  // 如果 mediaType 是 audio 说明订阅是音频轨道
  if (mediaType === "audio") {
    const audioTrack = user.audioTrack;
    // 自动播放音频
    audioTrack.play();
  } else {
    const videoTrack = user.videoTrack;
    // 自动播放视频
    videoTrack.play(DOM_ELEMENT);
  }
});
```

当订阅方法调用完成之后，我们可以通过 `user.audioTrack` 和 `user.videoTrack` 获取相应的 [RemoteAudioTrack](/api/cn/interfaces/iremoteaudiotrack.html) 和 [RemoteVideoTrack](/api/cn/interfaces/iremotevideotrack.html) 对象。

> 该方法为异步方法，使用时需要配合 `Promise` 或者 `async/await`

订阅和发布不同，每次订阅只能订阅音频或视频中的一路轨道。即使发布端同时发布了音视频，SDK 也会分两次事件下发，一次 `user-published(audio)` 一次 `user-published(video)`。按照上面的代码逻辑，也就会完成两次订阅。

### 处理 Autoplay 问题

当我们订阅音频并自动播放这个音频轨道时，可能会遭遇 [浏览器音频自动播放限制](https://www.google.com/search?q=autoplay+policy&oq=autoplay+policy&aqs=chrome..69i57j69i60l2.5828j0j4&sourceid=chrome&ie=UTF-8)(以下简称 autoplay 限制)。如果一个用户在页面上没有发生任何交互动作（点击、触摸等），那么这个网页就不能自动播放音频，这就是Autoplay 限制。

对于 Agora Web SDK NG，如果在交互之前就调用 `RemoteAudioTrack.play` 播放音频，浏览器的 Autoplay 限制可能就会让用户听不到声音。但是只要用户在任何时候和页面发生了交互，SDK 就会自动检测到这个行为然后尝试自动恢复播放音频。

SDK 推荐你在调用 `RemoteAudioTrack.play` 之前就确保用户已经和页面发生交互，如果产品设计无法保证这一点，你可以使用 [AgoraRTC.onAudioAutoplayFailed](/api/cn/interfaces/iagorartc.html#onaudioautoplayfailed) 回调来在播放之后提示用户和页面发生交互。

### 错误处理
在订阅过程中，因为网络环境等因素 SDK 可能抛出如下错误：
- INVALID_OPERATION: 非法操作，可能在加入频道成功之前就发起了订阅
- INVALID_REMOTE_USER: 传入了非法的远端用户对象，该用户可能不在频道
- REMOTE_USER_IS_NOT_PUBLISHED：传入的远端用户没有发布目标的媒体类型
- UNEXPECTED_RESPONSE：收到了 Agora 网关异常的返回，订阅失败
- OPERATION_ABORT：操作中止，可能在订阅成功之前就离开了频道
- NO_ICE_CANDIDATE: 找不到本地网络出口，可能是网络防火墙或者启用了一些禁止 WebRTC 的浏览器插件

## 取消订阅音视频

你可以通过 [AgoraRTCClient.unsubscribe](/api/cn/interfaces/iagorartcclient.html#unsubscribe) 来取消订阅远端的音视频。

```js
// 先订阅目标用户的音视频
await client.subscribe(user, "audio");
await client.subscribe(user, "video");

// 取消订阅视频
await client.unsubscribe(user, "video");
// 也可以取消订阅当前用户的所有媒体类型
await client.unsubscribe(user);
```

关于取消订阅，有如下注意事项：
- 当取消订阅成功后，相应的 `RemoteTrack` 对象就会被释放，一旦远端轨道对象被释放，视频的播放元素会被自动移除，音频的播放也会被停止。
- 当远端主动取消发布，本地会收到 `user-unpublished` 回调，此时因为远端已经取消发布，当收到回调的时候 SDK 就已经把相应的 `RemoteTrack` 对象释放，无需再调用 `unsubscribe`。
- 该方法为异步方法，使用时需要配合 `Promise` 或 `async/await`。


