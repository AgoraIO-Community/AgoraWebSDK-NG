---
id: release_note
title: Release Note
sidebar_label: Release Note
---

This page provides the release notes for the Agora Web SDK NG.

## v4.1.1
Agora Web SDK NG v4.1.1 was released on October 27, 2020. This release fixed the following issues:
- Improved the accuracy of the `event_network_quality` event.
- The method call of `createCameraVideoTrack` did not stop on Safari when the SDK cannot find a video capture device.
- After calling `unsubscribe` to unsubscribing from an unpublished track of a remote user, the subsequent subscribing and unsubscribing operations failed to take effect.
- Reduced the performance degradation due to frequent method calls of `setEnabled` to enable and disable a video track in dual-stream mode.
- Occasional errors when `client.getLocalVideoStats` was called on Safari.

## v4.1.0

Agora Web SDK NG v4.1.0 was released on September 4, 2020.

### New features

#### Screenshot capture

v4.1.0 adds the `getCurrentFrameData` method which gets the data of the video frame being rendered.

#### Audio playback device management

v4.1.0 adds the following APIs to manage audio playback devices:

- `setPlaybackDevice`: Sets the audio playback device, for example, the speaker. This method supports Chrome only.
- `getPlaybackDevices`: Retrieves the audio playback devices available.
- `onPlaybackDeviceChanged`: Occurs when an audio playback device is added or removed.

### Improvements

- Fully supports Chromium-based versions of Microsoft Edge (versions 80 and later).
- Improves the accuracy of the `network-quality` event.
- Supports sharing audio when sharing Chrome tabs on macOS.

### Fixed issues

- Information retrieved by `checkVideoTrackIsActive` on Safari is inaccurate.
- Occasional failure of reconnection after enabling dual-stream mode.
- Occasional failure to call `setEnabled` after leaving the channel.
- Failure to push streams to CDN with transcoding and without transcoding at the same time.
- Occasional failure to automatically re-subscribe to the remote streams after disconnection, indicated by the `UNEXPECTED_RESPONSE: ERR_SUBSCRIBE_REQUEST_INVALID` error.
- Failure to join different channels with the same UID in one browser tab.
- Occasional misreport on connection states due to frequent channel join and leave.

### API changes

#### Added

- `LocalVideoTrack.getCurrentFrameData`
- `RemoteVideoTrack.getCurrentFrameData`
- `AgoraRTC.getPlaybackDevices`
- `LocalAudioTrack.setPlaybackDevice`
- `RemoteAudioTrack.setPlaybackDevice`
- `AgoraRTC.onPlaybackDeviceChanged`
- `Client.getLocalAudioStats`
- `Client.getRemoteAudioStats`
- `Client.getLocalVideoStats`
- `Client.getRemoteVideoStats`

#### Deprecated

- The `LocalTrack.getStats` and `RemoteTrack.getStats` methods. Use the `Client.getLocalAudioStats`, `Client.getRemoteAudioStats`, `Client.getLocalVideoStats` and `Client.getRemoteVideoStats` methods instead.

## v4.0.1

Agora Web SDK NG v4.0.1 was released on July 18, 2020.

### Fixed issues

v4.0.1 fixed the following issues:

- Publishing failure in Chrome 70
- Publish operation may not be aborted when leaving the channel

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

- Adds the value of `auto` to the withAudio parameter in `AgoraRTC.createScreenVideoTrack`.
- Removes the value of `"all"` from the mediaType parameter in `Client.subscribe`.
- The `mediaType` parameter in the `Client.on("user-published")` and `Client.on("user-unpublished")` callbacks does report `"all"`

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