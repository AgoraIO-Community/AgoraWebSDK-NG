---
id: basic_call
title: Implement the Basic Video Call
sidebar_label: Implement Basic Call
---

This article introduces how to use the Agora Web SDK NG to implement the basic video call.

> Due to security limits on HTTP addresses except 127.0.0.1, the Agora Web SDK NG only supports HTTPS or http://localhost (http://127.0.0.1). If you deploy your project over HTTP, you can only visit your project with http://localhost（http://127.0.0.1).

## Commonly-used objects
You need to work with the following two types of objects when using the Agora Web SDK NG:

- The [AgoraRTCClient](/api/en/interfaces/iagorartcclient.html) object, representing a local user in the call. The `AgoraRTCClient` interface provides methods for implementing the major functions in a video call, such as joining a channel and publishing local audio and video tracks.
- The [LocalTrack](/api/en/interfaces/ilocalaudiotrack.html) and [RemoteTrack](/api/en/interfaces/iremotetrack.html) objects, representing the local and remote tracks respectively. The `LocalTrack` and `RemoteTrack` interfaces provide methods for controlling the audio and video, such as the playback control.

> A audio and/or video stream consist of an audio track and/or a video track. The Agora Web SDK NG controls the stream by operating the tracks.

## Basic process

The process of implementing a basic video call is as follows:
1. Call `createClient` to create a local client object with your app ID.
2. Call `AgoraRTCClient.join` to join a specified channel.
3. Call `createMicrophoneAudioTrack` to create a `MicrophoneAudioTrack` object and call `createCameraVideoTrack` to create a `CameraVideoTrack` object.
4. Call `AgoraRTCClient.publish` to publish the local audio and video tracks that you create to the channel.

When a remote user joins the channel and publishes tracks:
1. The SDK triggers `AgoraRTCClient.on("user-published")`, in which you can get an `AgoraRTCRemoteUser` object.
2. Call `AgoraRTCClient.subscribe` to subscribe to the `AgoraRTCRemoteUser` object that you get.
3. Visit `AgoraRTCRemoteUser.audioTrack` and `AgoraRTCRemoteUser.videoTrack` to get the `RemoteAudioTrack` and `RemoteVideoTrack` of the remote user.

For convenience, we define two variables and a function for the following code snippets. You can wrap all the following code snippets in the function. This is not mandatory and you can have your implementation.


```js
const rtc = {
  // For the local client
  client: null,
  // For the local audio and video tracks
  localAudioTrack: null,
  localVideoTrack: null,
};

const options = {
  // Pass your app ID here
  appId: "<YOUR APP ID>",
  // Set the channel name
  channel: "demo_channel_name",
  // Pass a token if your project enables the App Certificate
  token: null,
};

async function startBasicCall() {
  /**
   * Put the following code snippets here
   */
}

startBasicCall();
```

### Create a local client

```js
rtc.client = AgoraRTC.createClient({ mode: "rtc", codec: "h264" });
```

Call `createClient` to create a local client. Pay attention to the settings of `mode` and `codec` when creating the client:
- `mode` determines the [channel profile](https://docs.agora.io/en/Agora%20Platform/terms?platform=All%20Platforms%23live-broadcast-core-concepts#%E9%A2%91%E9%81%93%E6%A8%A1%E5%BC%8F). We use the `"rtc"` mode for one-to-one or group calls and the `"live"` mode for live broadcasts. The SDK applies different optimization methods according to the channel profile.
- `codec` specifies the codec that the web browser uses for encoding and decoding. Set `codec` as `"h264"` as long as Safari 12.1 or earlier is involved in the call, otherwise Agora recommends setting `codec` as `"vp8"`.

### Join a channel

```js
const uid = await rtc.client.join(options.appId, options.channel, options.token, null);
```

Call `join` to join a specified channel. This method returns a `Promise` object. `resolve` means the client joins the channel successfully; `reject` means an error occurs when the client joins the channel. You can also use `async/await` to simplify your code.

Pay attention to the following settings when joining the channel:
- `appid`: The App ID that you get when creating a project in Agora Console. See [Prerequisites](setup.md#Prerequisites).
- `channel`: The channel name, a string within 64 bytes.
> - In our sample project, we set `channel` as `demo_channel_name`.
> - If your project enables an app certificate, ensure the value of `channel` you set here is the same as the value you use when generating a token.
- `token`: (Optional) A token that identifies the role and privilege of the user if your project enables an app certificate. See [Use a token for authentication](hhttps://docs.agora.io/en/Agora%20Platform/token?platform=All%20Platforms#apply-your-token-or-temporary-token) for details.
 - For testing, Agora recommends using a Temp Token generated in Console. See [Get a Temp Token](https://docs.agora.io/en/Agora%20Platform/token?platform=All%20Platforms#get-a-temporary-token).
 - For production, Agora recommends using a Token generated at your server. For how to generate a token, see [Generate a token from your server](https://docs.agora.io/en/cloud-recording/token_server?platform=CPP).
> In our sample project, for simplicity, we do not enable the app certificate and set `token` as `null`.
- `uid`: The user ID, which should be unique in a channel. If you set `uid` as `null`, the Agora server automatically assigns a user ID and returns it in the result of `join`.

For more details on the parameter settings, see [AgoraRTCClient.join](/api/en/interfaces/iagorartcclient.html#join).

### Create and publish the local tracks

```js
// Create an audio track from the audio captured by a microphone
rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
// Create a video track from the video captured by a camera
rtc.localVideoTrack = await AgoraRTC.createCameraVideoTrack();
// Publish the local audio and video tracks to the channel
await rtc.client.publish([rtc.localAudioTrack, rtc.localVideoTrack]);

console.log("publish success!");
```

The above three lines of code show the whole process of creating and publishing the local audio and video tracks: 1. Call `createMicrophoneAudioTrack` to create a `MicrophoneAudioTrack` object and call `createCameraVideoTrack` to create a `CameraVideoTrack` object.
2. Call `publish` and pass the local audio and video tracks that you create as parameters to publish these tracks to the channel that you join.

> You can use the `Promise.all` method for multiple asynchronous tasks such as creating audio and video tracks and joining a channel as these asynchronous tasks have no dependency.

For more details on the parameter settings, see:
- [createMicrophoneAudioTrack](/api/en/interfaces/iagorartc.html#createmicrophoneaudiotrack)
- [createCameraVideoTrack](/api/en/interfaces/iagorartc.html#createcameravideotrack)

### Subscribe to a remote user
When a remote user publishes media tracks, the SDK triggers `client.on("user-published")`, in which you can get an `AgoraRTCRemoteUser` object. We need to listen for this event with `client.on` and call `AgoraRTCClient.subscribe` in the callback to subscribe to this remote user.

> Agora recommends listening for events immediately after creating the client to ensure we do not miss any event.

Add the following code snippet after calling`createClient` to listen for `client.on("user-published")`, automatically subscribe to the remote user who publishes media tracks, and play the media tracks.

```js
rtc.client.on("user-published", async (user, mediaType) => {
  // Subscribe to a remote user
  await rtc.client.subscribe(user);
  console.log("subscribe success");

  if (mediaType === "video" || mediaType === "all") {
    // Get `RemoteVideoTrack` in the `user` object.
    const remoteVideoTrack = user.videoTrack;
    // Dynamically create a container in the form of a DIV element for playing the remote video track.
    const playerContainer = document.createElement("div");
    // Specify the ID of the DIV container. You can use the `uid` of the remote user.
    playerContainer.id = user.uid;
    playerContainer.style.width = "640px";
    playerContainer.style.height = "480px";
    document.body.append(playerContainer);

    // Play the remote audio and video tracks
    // Pass the ID of the DIV container and the SDK dynamically creates a player in the container for playing the remote video track
    remoteVideoTrack.play(user.uid);
  }

  if (mediaType === "audio" || mediaType === "all") {
    // Get `RemoteAudioTrack` in the `user` object.
    const remoteAudioTrack = user.audioTrack;
    // Play the audio track. Do not need to pass any DOM element
    remoteAudioTrack.play();
  }
});
```

Pay attention to the `mediaType` parameter of the `client.on("user-published")` event, which marks the type of the current track the remote user publishes:
- `"audio"`: The remote user publishes an audio track.
- `"video"`: The remote user publishes a video track.
- `"all"`: The remote user publishes both audio and video tracks.

In our sample project, the remote user publishes an audio track and a video track at the same time. Due to the uncertainty of encoding and network transmission, there may be two conditions:
- The SDK triggers a `user-published(mediaType: "all")` event.
- The SDK first triggers a `user-published(mediaType: "audio")` event, and then triggers a `user-published(mediaType: "video")` event.

In the second condition, we can not get the `videoTrack` of the remote user when the SDK triggers a `user-published(mediaType: "audio")` event. Therefore, in the sample code, we need to check the value of `mediaType` to see if we can play the audio or video.

> For more information, see [client.on("user-published")](/api/en/interfaces/iagorartcclient.html#event_user_published).

When the remote user unpublishes a media track or leaves the channel, the SDK triggers `client.on("user-unpublished")`. You need to destroy the dynamically created DIV container.

Add the following code snippet after listening for `client.on("user-published")` to listen for `client.on("user-unpublished")`.

```js
rtc.client.on("user-unpublished", user => {
  // Get the dynamically created DIV container
  const playerContainer = document.getElementById(user.uid);
  // Destroy the container
  playerContainer.remove();
});
```

### Leave the channel
Follow these steps to leave the channel:
1. Destroy the local audio and video tracks and disable access to the camera and microphone.
2. Destroy the dynamically created DIV container.
3. Call `leave` to leave the channel.

```js
async function leaveCall() {
  // Destroy the local audio and video tracks
  rtc.localAudioTrack.close();
  rtc.localVideoTrack.close();

  // Traverse all remote users
  rtc.client.remoteUsers.forEach(user => {
    // Destroy the dynamically created DIV container
    const playerContainer = document.getElementById(user.uid);
    playerContainer && playerContainer.remove();
  });

  // Leave the channel
  await rtc.client.leave();
}
```

> Neither destroying the local media tracks nor destroying the dynamically created DIV container is mandatory. You can have your implementation.

## Demo

We provide an [online demo](/demo/basicVideoCall/index.html) for you to try the video calls implemented by the Agora Web SDK NG.
