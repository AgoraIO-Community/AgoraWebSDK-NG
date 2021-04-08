# AgoraWebSDK NG

# **AS Web NG SDK have been offically released from [here](https://docs.agora.io/en/Interactive%20Broadcast/release_web_ng?platform=Web). This Demo Project has been deprecated and archived. We will stop maintain it. Please look at https://github.com/AgoraIO/API-Examples-Web for latest Agora Web SDK Samples.**


*English | [简体中文](README.cn.md)*

The Agora Web SDK NG is the next-generation SDK of the current Agora Web SDK, enabling audio and video real-time communications based on Agora SD-RTN™ and implementing scenarios such as voice-only calls, video call, voice-only interactive broadcast, and video interactive broadcast. The Agora Web SDK NG makes full-scale refactoring to the internal architecture of the Agora Web SDK and improves usability of APIs.

```shell
npm install agora-rtc-sdk-ng --save
```

[Documentation Website](https://agoraio-community.github.io/AgoraWebSDK-NG)

We provide some basic demos. For the online website, check out [here](https://agoraio-community.github.io/AgoraWebSDK-NG/demo/). For the source code, check out [here](./Demo).


> If you have some problems when using the Agora Web SDK NG, or have any suggestions, you can post new issue in this repo and we will reply as soon as possoble.

## Overview

For detailed introduction and documentation, please go to  [Documentation Website](https://agoraio-community.github.io/AgoraWebSDK-NG). Here we briefly introduce the features of the Agora Web SDK NG:

- Support Typescript
- Using ES6 Promise
- Track-based media objects

Here is the sample code to join the channel and publish local media automatically

```js
import AgoraRTC from "agora-rtc-sdk-ng"

const client = AgoraRTC.createClient()

async function startCall() {
  await client.join("APPID", "CHANNEL", "TOKEN");
  const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
  const videoTrack = await AgoraRTC.createCameraVideoTrack();

  await client.publish([audioTrack, videoTrack]);
}

startCall().then(/** ... **/).catch(console.error);
```
