---
id: release_note
title: Release Note
sidebar_label: Release Note
---

This page provides the release notes for the Agora Web SDK NG.

## v4.0.0

Agora Web SDK NG v4.0.0 was released on July 15, 2020.

### Compatibility changes

v4.0.0 deletes the `LocalTrack.setMute` method and adds the `LocalTrack.setEnabled` method for enabling or disabling a local track. The advantages of this change are as follows:

- Eliminates the concept of "mute" to avoid confusion between mute states and publishing states.
  - In versions earlier than v4.0.0, the SDK triggers the `Client.on("user-mute-updated")` callback when the remote user calls `setMute` to change the mute state.
  - As of v4.0.0, the SDK triggers the existing `Client.on("user-unpublished")` or `Client.on("user-published")` callbacks when the remote user calls `setEnabled` to enable or disable a track.
- After you call `setMute(true)`, the SDK sends black video frames or silenced audio frames. If you mute a local video track, the camera light stays on, which might adversely impact the user experience. In contrast, if you disable a local video track by calling `setEnabled(false)`, the SDK immediately turns off the camera and stops capturing video.

> The `setEnabled` method changes media input behaviors, so it is an asynchronous operation and returns the result through the `Promise` object.

### New features

#### Video encoding strategy

v4.0.0 adds the `optimizationMode` property in the `CameraVideoTrackInitConfig`, `ScreenVideoTrackInitConfig`, and `CustomVideoTrackInitConfig` interfaces. When creating a video track by calling `createCameraVideoTrack`, `createCustomVideoTrack`, or `createScreenVideoTrack`, you can choose whether to prioritize video quality or smoothness by setting optimizationMode as the following:

- `"detail"`: Prioritizes video quality.
  - The SDK ensures high-quality images by automatically calculating a minimum bitrate based on the capturing resolution and frame rate. No matter how poor the network condition is, the sending bitrate will never be lower than the minimum value.
  - In most cases, the SDK does not reduce the sending resolution, but may reduce the frame rate.
-  `"motion"`: Prioritizes video smoothness.
  - In poor network conditions, the SDK reduces the sending bitrate to minimize video freezes.
  - In most cases, the SDK does not reduce the frame rate, but may reduce the sending resolution.

> The  `optimizationMode` property of the video track created by calling createScreenVideoTrack is set as `"detail"` by default.

### Improvements

- Redesigns the `withAudio` parameter in `AgoraRTC.createScreenVideoTrack`. In addition to `enable` and `disable`, you can also set `withAudio` as `auto`. In this setting, the SDK shares the audio, dependent on whether the browser supports this function. 
- Does not allow setting the `withAudio` parameter as `"all"` any more to avoid code repetition. As of v4.0.0, you can only set `withAudio` as `"audio"` or `"video"`. This change involves the following APIs:
  - The `Client.subscribe` method.
  - The `Client.on("user-published")` and `Client.on("user-unpublished")` callbacks.

### Fixed issues

v4.0.0 fixed the following issues:

- After the local user called `unpublish`, the SDK triggerred the `Client.on("user-left")` callback on the remote side.
- Periodic video blur when sharing the screen in `"rtc"` mode.
- Occasional publishing failure when calling `publish` and `unpublish` frequently.
- The `Client.on("network-quality")` callback was inaccurate.

### API changes

#### Added

- The `Client.localTracks` interface
- The `LocalTrack.setEnabled` method
- The `optimizationMode` property in `CameraVideoTrackInitConfig, ``ScreenVideoTrackInitConfig`, and `CustomVideoTrackInitConfig` interfaces

#### Updated

- Adds the value of `auto` to the withAudio parameter in [`AgoraRTC`.createScreenVideoTrack](./api/cn/interfaces/iagorartc.html#createscreenvideotrack).
- Removes the value of `"all"` from the mediaType parameter in `Client.subscribe`.
- The `mediaType` parameter in the [Client.on("user-published")](https://confluence.agoralab.co/api/cn/interfaces/iagorartcclient.html#event_user_published) and `Client.on("user-unpublished")` callbacks does report `"all"`

#### Deprecated

- The `LocalAudioTrackStats.muteState` property
- The `LocalVideoTrackStats.muteState` property
- The `RemoteAudioTrackStats.muteState` property
- The `RemoteVideoTrackStats.muteState` property

#### Deleted

- The `Client.on("user-mute-updated")` callback
- The `LocalTrack.setMute` method
- The `AgoraRTCRemoteUser.audioMuted` property
- The `AgoraRTCRemoteUser.videoMuted` property
- The `LocalTrack.getUserId` method