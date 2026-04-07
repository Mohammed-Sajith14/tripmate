import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { SOCKET_BASE_URL } from "./auth";

interface UseSocketOptions {
  url?: string;
  autoConnect?: boolean;
}

export const useSocket = (options: UseSocketOptions = {}) => {
  const {
    url = SOCKET_BASE_URL,
    autoConnect = true,
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (autoConnect && !socketRef.current) {
      const socket = io(url, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        transports: ["websocket", "polling"],
      });

      socket.on("connect", () => {
        console.log("Socket connected:", socket.id);
        setIsConnected(true);
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected");
        setIsConnected(false);
      });

      socket.on("error", (error) => {
        console.error("Socket error:", error);
      });

      socketRef.current = socket;
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [url, autoConnect]);

  return {
    socket: socketRef.current,
    isConnected,
  };
};
