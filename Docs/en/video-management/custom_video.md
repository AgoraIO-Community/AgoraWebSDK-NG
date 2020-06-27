---
id: custom_video
title: Custom Video Source
sidebar_label: Custom Video Source
---

## Introduction

In most cases, the Agora Web SDK NG uses the default audio and video modules for capturing video in real-time communications.

However, the default modules might not meet your development requirements, such as in the following scenarios:

- Your app has its own audio or video module.
- You want to use a non-camera source, such as the Canvas screen data.
- You need to process the captured video with a pre-processing library for functions such as image enhancement.

This document describes how to customize the video source with the Agora Web SDK NG.

## Implementation

Before proceeding, ensure that you have implemented the basic real-time communication function in your project. For details, see [Implement a Basic Video Call](basic_call.md).

The SDK provides the [createCustomVideoTrack](/api/en/interfaces/iagorartc.html#createcustomvideotrack) method to support creating a video track from a [`MediaStreamTrack`](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack) object. You can use this method to customize video source.

For example, you can call `getUserMedia` to get a `MediaStreamTrack` object, and then pass this object to  `createCustomAudioTrack` to create an audio track that can be used in the SDK.

```js
navigator.mediaDevices.getUserMedia({ video: true, audio: false })
  .then((mediaStream) => {
    const videoMediaStreamTrack = mediaStream.getVideoTracks()[0];
    // create custom video track
    return AgoraRTC.createCustomVideoTrack({
      mediaStreamTrack: videoMediaStreamTrack,
    });
  })
  .then((localVideoTrack) => {
    // ...
  });
```

> `MediaStreamTrack` refers to the `MediaStreamTrack` object supported by the browser. See [MediaStreamTrack API](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack) for details.

You can also call [HTMLMediaElement.captureStream](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/captureStream) or [HTMLCanvasElement.captureStream](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/captureStream) to get the `MediaStreamTrack` object.

### API reference
- [`createCustomVideoTrack`](/api/en/interfaces/iagorartc.html#createcustomvideotrack)
- [`LocalVideoTrack`](/api/en/interfaces/ilocalvideotrack.html)

