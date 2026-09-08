import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!socket) {
      socket = io(window.location.origin, {
        autoConnect: true,
        reconnection: true,
      });
    }

    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    if (socket.connected) {
      setIsConnected(true);
    }

    return () => {
      socket?.off('connect', onConnect);
      socket?.off('disconnect', onDisconnect);
    };
  }, []);

  const joinRoom = (room: string) => {
    socket?.emit('join_room', room);
  };

  const leaveRoom = (room: string) => {
    socket?.emit('leave_room', room);
  };

  return { socket, isConnected, joinRoom, leaveRoom };
};
