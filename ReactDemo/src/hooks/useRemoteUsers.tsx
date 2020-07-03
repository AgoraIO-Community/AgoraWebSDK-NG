import { useState, useEffect } from 'react';
import { IAgoraRTCClient, IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';

export default function useRemoteUsers(client: IAgoraRTCClient | undefined): [IAgoraRTCRemoteUser[], (IAgoraRTCRemoteUser | undefined), Function] {
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [newUser, setNewUser] = useState<IAgoraRTCRemoteUser | undefined>(undefined);

  useEffect(() => {
    if (!client) return;
    setRemoteUsers(client.remoteUsers);

    const handleUserPublished = async (newUser: IAgoraRTCRemoteUser, mediaType: string) => {
      setRemoteUsers(remoteUsers => [...remoteUsers.filter(user => user.uid !== newUser.uid), newUser]);
      setNewUser(newUser);
    }
    const handleUserUnpublished = (leftUser: IAgoraRTCRemoteUser) => {
      setRemoteUsers(remoteUsers => remoteUsers.filter(user => leftUser !== user));
    }
    console.log('exce use effect', client);
    client.on('user-published', handleUserPublished);
    client.on('user-unpublished', handleUserUnpublished);

    return () => {
      client.off('user-published', handleUserPublished);
      client.off('user-unpublished', handleUserUnpublished);
    };
  }, [client]);

  return [remoteUsers, newUser, setRemoteUsers];
}