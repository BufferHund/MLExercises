import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useGameStore } from '../store/gameStore';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

export function useSocket(gameId?: string) {
  const socketRef = useRef<Socket | null>(null);
  const setNearby = useGameStore((state) => state.setNearby);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !gameId) return;

    const socket = io(WS_URL, {
      auth: { token },
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('WebSocket connected');
      socket.emit('game:join', { gameId });
    });

    socket.on('game:joined', (data) => {
      console.log('Joined game:', data);
    });

    socket.on('pos:nearby', (data: { users: any[] }) => {
      setNearby(data.users);
    });

    socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    return () => {
      socket.disconnect();
    };
  }, [gameId, setNearby]);

  const updatePosition = (lat: number, lng: number, accuracy?: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('pos:update', { lat, lng, accuracy });
    }
  };

  return { socket: socketRef.current, updatePosition };
}
