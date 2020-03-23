---
id: stream_fallback
title: Video Stream Fallback
sidebar_label: Video Stream Fallback
---

## Introduction
The audio and video quality of a live broadcast or a video call deteriorates under poor network conditions. The Agora Web SDK NG provides API methods for you to enable the video stream fallback. When the network condition goes bad, the SDK automatically switches from the high-quality video stream to low-quality video stream, or disables the video stream to ensure the quality of the audio.

## Implementation

Before proceeding, ensure that you have implemented the basic real-time communication function in your project. For details, see [Implement a Basic Video Call](basic_call.md).

Follow these steps to enable the video stream fallback:
1. Before publishing their stream, the hosts in the channel call `AgoraRTCClient.enableDualStream` to enable [dual-stream mode](https://docs.agora.io/en/Agora%20Platform/terms?platform=All%20Platforms#dual).
2. All the users in the channel call `AgoraRTCClient.setStreamFallbackOption` to set the stream fallback option.
  - Set `fallbackType` as `1`: Automatically subscribe to the low-quality video stream under poor network.
  - Set `fallbackType` as `2`: Under poor network conditions, the SDK may subscribe to the low-quality video stream first. However, if the network still does not allow displaying the video, the SDK only subscribes to audio.
3. (Optional) The subscriber in the channel call t`setRemoteVideoStreamType` method and set `streamType` as `1` to only subscribe to the low-quality stream under any conditions.

You can monitor the stream switch between the stream which includes both audio and video and the audio-only stream by the `AgoraRTCClient.on("stream-fallback")` callback; monitor the switch between the low-quality video stream and high-quality video streams by the `AgoraRTCClient.on("stream-type-changed")` callback.

### Sample code
The `client` object in the following sample code is created by calling `AgoraRTC.createClient`.

```js
// Enable dual-stream mode
client.enableDualStream().then(() => {
  console.log("Enable dual stream success!")
}).catch(err => {
  console,log(err)
});

// Configuration for the subscriber. Try to receive low-quality stream under poor network conditions. When the current network conditions are not sufficient for video streams, receive audio only.
client.setStreamFallbackOption(remoteStream, 2)

// Configuration for the subscriber. Subscribe to the low-quality stream under any conditions.
client.setRemoteVideoStreamType(remoteStream, 1);
```

### API reference
- [`AgoraRTCClient.enableDualStreamMode`](/api/en/interfaces/iagorartcclient.html#enabledualstream)
- [`AgoraRTCClient.setStreamFallbackOption`](/api/en/interfaces/iagorartcclient.html#setstreamfallbackoption)
- [`AgoraRTCClient.setRemoteVideoStreamType`](/api/en/interfaces/iagorartcclient.html#setremotevideostreamtype)


## Considerations
- `enableDualStream` does not apply to the following scenarios:
  - The stream is created by defining the `audioSource` and `videoSource properties.
  - Audio-only mode
  - Safari browser on iOS
  - Screen-sharing

- Some web browsers may not be fully compatible with dual streams when calling the `setRemoteVideoStreamType` method:
  - Safari on macOS: A high-quality stream and a low-quality stream share the same frame rate and resolution.
  - Firefox: A low-quality stream has a fixed frame rate of 30 fps.
  - Safari on iOS: Safari 11 does not support switching between the two kinds of video streams.
