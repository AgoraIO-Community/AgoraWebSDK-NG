---
id: call_quality
title: Report Call Statistics
sidebar_label: In-call Stats
---

## Introduction
The Agora Web SDK NG provides API methods for you to get the audio and video statistics reflecting the overall quality of a call. The statistics include:
- The statistics of the session
- The statistics of the local stream
- The statistics of the remote stream
- The uplink and downlink network conditions of the local user
- Exception events in the channel

## Implementation

Before proceeding, ensure that you have implemented the basic real-time communication function in your project. For details, see [Implement a Basic Video Call](basic_call.md).

### Get the statistics of the session

Call [AgoraRTCClient.getRTCStats](/api/en/interfaces/iagorartcclient.html#getrtcstats) to get the statistics of the session. For the statistic description, see [AgoraRTCStats](/api/en/interfaces/agorartcstats.html).

The `client` object in the following sample code is created by calling `AgoraRTC.createClient`.

```js
const stats = client.getRTCStats();
```

### Get the statistics of the local audio and video tracks

Call [LocalAudioTrack.getStats](/api/en/interfaces/ilocalaudiotrack.html#getstats) to get the statistics of the local audio track, and call [LocalVideoTrack.getStats](/api/en/interfaces/ilocalvideotrack.html#getstats) to get the statistics of the local video track. For the statistic description, see [LocalAudioTrackStats](/api/en/interfaces/localaudiotrackstats.html) and [LocalVideoTrackStats](/api/en/interfaces/localvideotrackstats.html).

```js
const audioTrackStats = localAudioTrack.getStats();
const videoTrackStats = localVideoTrack.getStats();
```

### Get the statistics of the remote audio and video tracks
Call [RemoteAudioTrack.getStats](/api/en/interfaces/iremoteaudiotrack.html#getstats) to get the statistics of the remote audio track, and call [RemoteVideoTrack.getStats](/api/en/interfaces/iremotevideotrack.html#getstats) to get the statistics of the remote video track. For the statistic description, see [RemoteAudioTrackStats](/api/en/interfaces/remoteaudiotrackstats.html) and [RemoteVideoTrackStats](/api/en/interfaces/remotevideotrackstats.html).

```js
const audioTrackStats = remoteAudioTrack.getStats();
const videoTrackStats = remoteVideoTrack.getStats();
```

### Reports on the uplink and downlink network conditions of the local user

The Agora Web SDK NG reports on the uplink and downlink network conditions of the local user by triggering the [`network-quality`](/api/en/interfaces/iagorartcclient.html#event_network_quality) callback once every two seconds.

- `downlinkNetworkQuality`: The downlink network quality.
- `uplinkNetworkQuality`: The uplink network quality.

**Quality Rating Table**
| Rating   | Description                                          |
| -------- | :----------------------------------------------------- |
| 0        | The network quality is unknown.                       |
| 1        | The network quality is excellent.            |
| 2        | The network quality is quite good, but the bitrate may be slightly lower than excellent. |
| 3        | Users can feel the communication slightly impaired.             |
| 4        | Users cannot communicate smoothly.               |
| 5        | The network is so bad that users can barely communicate.            |
| 6        | The network is down and users cannot communicate at all.            |

``` javascript
client.on("network-quality", (stats) => {
    console.log("downlinkNetworkQuality", stats.downlinkNetworkQuality);
    console.log("uplinkNetworkQuality", stats.uplinkNetworkQuality);
});
```

### Reports on exception events in the channel
The Agora Web SDK NG reports on exception events in the channel by triggering the [`exception`](/api/en/interfaces/iagorartcclient.html#event_exception) callback. Exceptions are not errors, but usually mean quality issues. This callback also reports recovery from an exception.
- `code`: Event code.
- `msg`: Event message.
- `uid`: The uid of the user who experiences the exception or recovery event.

``` javascript
client.on("exception", function(evt) {
  console.log(evt.code, evt.msg, evt.uid);
})
```

Each exception event has a corresponding recovery event. See the table below for details.

![](assets/exception-event-en.png)

## Considerations
All the above methods must be called after joining the channel.