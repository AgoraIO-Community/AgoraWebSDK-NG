---
id: volume
title: 调整通话音量
sidebar_label: 调整通话音量
---

## 功能描述
在使用我们 SDK 时，开发者可以对 SDK 采集到的声音及 SDK 播放的声音音量进行调整，以满足产品在声音上的个性化需求。比如进行双人通话时，可以通过这个功能调整麦克风音量或者远端用户音量。

## 实现方法
在调整通话音量前，请确保已在你的项目中实现基本的实时音视频功能。详见 [实现音视频通话](basic_call.md)。

### 示例代码

调节远端用户的音量，这里 `remoteUser` 是指已经订阅完成的远端用户对象
```js
// 将音量减少一半
remoteUser.audioTrack.setVolume(50);
// 将音量增大一倍
remoteUser.audioTrack.setVolume(200);
// 将远端音量设置为 0
remoteUser.audioTrack.setVolume(0);
```

调节本地麦克风音量，这里 `localVideoTrack` 是指自己创建的本地音频轨道对象
```js
AgoraRTC.createMicrophoneAudioTrack().then(localVideoTrack => {
  // 麦克风音量减半
  localVideoTrack.setVolume(50);
  // 麦克风音量增大一倍
  localVideoTrack.setVolume(200);
  // 将麦克风音量设置为 0
  localVideoTrack.setVolume(0);
});
```

### API 参考
- [LocalAudioTrack.setVolume](/api/cn/interfaces/ilocalaudiotrack.html#setvolume)
- [RemoteAudioTrack.setVolume](/api/cn/interfaces/iremoteaudiotrack.html#setvolume)

## 开发注意事项
- 音量设置太大在某些设备上可能出现爆音现象