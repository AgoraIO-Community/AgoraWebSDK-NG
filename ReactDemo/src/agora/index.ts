import AgoraRTC, { IAgoraRTCClient, ClientConfig, IMicrophoneAudioTrack, ICameraVideoTrack, MicrophoneAudioTrackInitConfig, CameraVideoTrackInitConfig } from 'agora-rtc-sdk-ng';

// Use a singleton to manage all agora objects,
// to ensure the instances are not created repeatedly and convenient to introduce in different files.
class AgoraManager {
  private _client?: IAgoraRTCClient;

  private _localTracks: {
    microphoneTrack?: IMicrophoneAudioTrack;
    cameraTrack?: ICameraVideoTrack;
  } = {
    microphoneTrack: undefined,
    cameraTrack: undefined,
  }

  get client() {
    return this._client;
  }

  get localTracks() {
    return this._localTracks;
  }

  createClient(config: ClientConfig): IAgoraRTCClient {
    const client = AgoraRTC.createClient(config);
    this._client = client;
    return client;
  }

  async createLocalTracks(audioConfig?: MicrophoneAudioTrackInitConfig, videoConfig?: CameraVideoTrackInitConfig)
  : Promise<[IMicrophoneAudioTrack, ICameraVideoTrack]> {
    if (this._localTracks.microphoneTrack) {
      this._localTracks.microphoneTrack.stop();
      this._localTracks.microphoneTrack.close();
    }
    if (this._localTracks.cameraTrack) {
      this._localTracks.cameraTrack.stop();
      this._localTracks.cameraTrack.close();
    }
    const [microphoneTrack, cameraTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(audioConfig, videoConfig);
    this._localTracks.microphoneTrack = microphoneTrack;
    this._localTracks.cameraTrack = cameraTrack;
    return [microphoneTrack, cameraTrack];
  }
}

const agoraManager = new AgoraManager();

export default agoraManager;