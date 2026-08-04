'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from './auth-context';

export function useWebSocket(onMessage: (data: any) => void) {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const onMessageRef = useRef(onMessage);

  // Keep callback reference current without triggering re-connections
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000';
    const url = user?.id ? `${wsUrl}?userId=${user.id}` : wsUrl;

    const socket = new WebSocket(url);

    socket.onopen = () => {
      console.log('[WS] Connected');
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessageRef.current?.(data);
      } catch (err) {
        console.error('[WS] Error parsing message:', err);
      }
    };

    socket.onerror = (err) => {
      // Suppress logging if socket was closed intentionally during React cleanup
      if (socket.readyState === WebSocket.CLOSED || socket.readyState === WebSocket.CLOSING) {
        return;
      }
      console.error('[WS] Error:', err);
    };

    socket.onclose = () => {
      console.log('[WS] Disconnected');
      setIsConnected(false);
    };

    return () => {
      // Detach listeners before closing so cleanup doesn't fire error handlers
      socket.onopen = null;
      socket.onmessage = null;
      socket.onerror = null;
      socket.onclose = null;

      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close();
      }
    };
  }, [user?.id]); // Only reconnect if the user ID explicitly changes

  return { isConnected };
}