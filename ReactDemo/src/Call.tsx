import React, { useState, useEffect } from 'react';
import agoraManager from './agora';
import useRemoteUsers from './hooks/useRemoteUsers';
import './Call.css';

function Call() {
  const [ appid, setAppid ] = useState("");
  const [ token, setToken ] = useState("");
  const [ channel, setChannel ] = useState("");
  const [ localPlayerText, setLocalPlayerText ] = useState("");
  const [ client, setClient ] = useState(agoraManager.client);
  const [remoteUsers, newUser, setRemoteUsers] = useRemoteUsers(client);
  const [ joinState, setJoinState ] = useState(false);

  // when the new user publishs tracks, play them.
  useEffect(() => {
    (async () => {
      if (!newUser || !client) return;
      await client.subscribe(newUser);
      newUser.videoTrack?.play(`remote-player-${newUser.uid}`);
      newUser.audioTrack?.play();
    })();
  }, [newUser]);

  // init the client after this component is mounted.
  useEffect(() => {
    agoraManager.createClient({ codec: 'h264', mode: 'rtc' });
    setClient(agoraManager.client);
  }, []);


  async function joinChannel() {
    const client = agoraManager.client;
    if (!client) return;
    const [microphoneTrack, cameraTrack] = await agoraManager.createLocalTracks();
    cameraTrack.play('local-player');
    setLocalPlayerText(`localVideo`);
    
    await client.join(appid, channel, token || null);
    setLocalPlayerText(`localVideo(${client.uid})`);
    setJoinState(true);

    await client.publish([microphoneTrack, cameraTrack]);
  }

  async function leaveChannel() {
    setRemoteUsers([]);
    setLocalPlayerText('');
    agoraManager.localTracks.cameraTrack?.stop();
    agoraManager.localTracks.microphoneTrack?.stop();
    await client?.leave();
    setJoinState(false);
  }

  return (
    <div className="call">
      <form className="call-form">
        <label>
          AppID:
          <input type="text" name="appid" onChange={(event) => { setAppid(event.target.value) }}/>
        </label>
        <label>
          Token(Optional):
          <input type="text" name="token" onChange={(event) => { setToken(event.target.value) }} />
        </label>
        <label>
          Channel:
          <input type="text" name="channel" onChange={(event) => { setChannel(event.target.value) }} />
        </label>
        <div className="button-group">
          <button id="join" type="button" className="btn btn-primary btn-sm" disabled={joinState} onClick={joinChannel}>Join</button>
          <button id="leave" type="button" className="btn btn-primary btn-sm" disabled={!joinState} onClick={leaveChannel}>Leave</button>
        </div>
      </form>
      <div className="player-container">
        <div className="local-player-wrapper">
          <p className="local-player-text">{localPlayerText}</p>
          <div id="local-player" style={{width: '360px', height: '240px'}}></div>
        </div>
        {remoteUsers.map(user => (
          <div className="remote-player-wrapper" key={user.uid}>
            <p className="remote-player-text">{`remoteVideo(${user.uid})`}</p>
            <div id={`remote-player-${user.uid}`} style={{width: '360px', height: '240px'}}></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Call;
