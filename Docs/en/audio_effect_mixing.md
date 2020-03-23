---
id: audio_effect_mixing
title: Play Audio Effects/Audio Mixing
sidebar_label: Audio Effects/Mixing
---

## Introduction

In a call or live broadcast, you may need to play custom sound or music to all the users in the channel. For example, adding sound effects in a game, or playing background music.

Agora Web SDK NG supports publishing multiple audio tracks and mixing them automatically. You can create and publish multiple audio tracks to play custom sound or music.

Before proceeding, ensure that you have implemented the basic real-time communication function in your project. See [Implement a Basic Video Call](basic_call.md).

## Implementation

Both sound effects and background music are essentially local or online audio files. To play a  sound effect or background music, you only need to create an audio track from the audio file, and publish it together with the microphone audio track.

### Create audio track from audio file

The SDK provides the  `createBufferSourceAudioTrack` method to read a local or online audio file and create an audio track object (`BufferSourceAudioTrack`).

```js
// Create an audio track from an online music file
const audioFileTrack = await AgoraRTC.createBufferSourceAudioTrack({
  source: "https://web-demos-static.agora.io/agora/smlt.flac",
});
console.log("create audio file track success");
```

After creating the audio track, if you directly call `audioFileTrack.play()` or `client.publish([audioFileTrack])`, you will find that neither the local nor remote users can hear the music. This is because the SDK processes the audio track created from an audio file differently from the microphone audio track (`MicrophoneAudioTrack`).

**MicrophoneAudioTrack**
![](assets/microphone_audio_track.png)

For the microphone audio track, the SDK keeps sampling the latest audio data (`AudioBuffer`) from the microphone.

- When you call `play()`, the SDK sends the audio data to the local playback module (`LocalPlayback`), then the local user can hear the sound.
- When you call `publish()`, the SDK sends the audio data to Agora SD-RTN, then the remote users can hear the sound.

Once the microphone audio track is created, the sampling keeps going on until `close()` is called. Then the audio track becomes unavailable.

**BufferSourceAudioTrack**
![](assets/buffer_source_audio_track.png)

For an audio file, the SDK cannot sample its audio data, but read the file to achieve similar effects instead, namely the `processing` phase in the above figure.

Sampling and file reading are different:

- Sampling cannot be paused, because only the latest data can be sampled.
- File reading can be controlled. We can pause reading to pause the playback, seek a reading position to jump the playback, loop reading to loop the playback, and so on. These are the core functions of `BufferSourceAudioTrack`. See [Control the playback](#control-the-playback) for details.

For the audio track created from an audio file, the SDK does not read the file by default, so you need to call  `BufferSourceAudioTrack.startProcessAudioBuffer()` to start reading and processing the audio data, and then call  `play()`  and  `publish()`  for the local and remote users to hear the sound.

### Publish multiple audio tracks

To start audio mixing, publish  `audioFileTrack` and the microphone audio track together.

```js
const microphoneTrack = await AgoraRTC.createMicrophoneAudioTrack();

// Start processing the audio data from the audio file
audioFileTrack.startProcessAudioBuffer();

// Publish audioFileTrack and microphoneTrack together
await client.publish([microphoneTrack, audioFileTrack]);

// To stop audio mixing, stop processing the audio data
audioFileTrack.stopProcessAudioBuffer();
// Or unpublish audioFileTrack
await client.unpublish([audioFileTrack]);
```

### Control the playback

`BufferSourceAudioTrack` provides the following methods to control the playback of the audio file:

- [`startProcessAudioBuffer`](/api/cn/interfaces/ibuffersourceaudiotrack.html#startprocessaudiobuffer): Starts reading the audio file and processing data. This method also supports setting loop times and the playback starting position.
- [`pauseProcessAudioBuffer`](/api/cn/interfaces/ibuffersourceaudiotrack.html#pauseprocessaudiobuffer): Pauses processing the audio data to pause the playback.
- [`resumeProcessAudioBuffer`](/api/cn/interfaces/ibuffersourceaudiotrack.html#resumeprocessaudiobuffer): Resumes processing the audio data to resume the playback.
- [`stopProcessAudioBuffer`](/api/cn/interfaces/ibuffersourceaudiotrack.html#stopprocessaudiobuffer): Stops processing the audio data to stop the playback.
- [`seekAudioBuffer`](/api/cn/interfaces/ibuffersourceaudiotrack.html#seekaudiobuffer): Jumps to a specified position.

After the processing starts, if you have called  `play()` and `publish()`, calling the above methods affects both the local and remote users.

```js
// Pause processing the audio data
audioFileTrack.pauseProcessAudioBuffer();
// Resume processing the audio data
audioFileTrack.resumeProcessAudioBuffer();
// Stop processing the audio data
audioFileTrack.stopProcessAudioBuffer();
// Start processing the audio data in loops
audioFileTrack.startProcessAudioBuffer({ loop: true });

// Get the current playback position (seconds)
audioFileTrack.getCurrentTime();
// The duration of the audio file (seconds)
audioFileTrack.duration;
// Jump to the playback position of 50 seconds
audioFileTrack.seekAudioBuffer(50);
```

If the local user does not need to hear the audio file, you can call `stop()` to stop the local playback, which does not affect the remote users.

### API reference

- [`createBufferSourceAudioTrack`](/api/cn/interfaces/iagorartc.html#createbuffersourceaudiotrack)
- [`BufferSourceAudioTrack`](/api/cn/interfaces/ibuffersourceaudiotrack.html)
- [`publish`](/api/cn/interfaces/iagorartcclient.html#publish)

## Considerations
- Ensure that you configure [CORS](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS) if you use online audio files.
- The supported audio formats include MP3, AAC and other formats that the browser supports.
- The local audio files must be [`File`](https://developer.mozilla.org/en-US/docs/Web/API/File) objects.
- Safari does not support publishing multiple audio track on versions earlier than Safari 12.
- No matter how many audio tracks are published, the SDK automatically mixes them into one audio track, therefore the remote users only get one `RemoteAudioTrack` object.
