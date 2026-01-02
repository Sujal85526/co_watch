import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "./useAuth.jsx";  // Your auth hook

export function useWebSocket(roomCode) {
  const socketRef = useRef(null);
  const { user } = useAuth();  // Get logged-in user

  useEffect(() => {
    if (!roomCode) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//localhost:8000/ws/room/${roomCode}/`;

    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => console.log("WS connected");
    socket.onclose = () => console.log("WS closed");
    socket.onerror = (e) => console.error("WS error", e);

    return () => socket.close();
  }, [roomCode]);

  const sendChat = useCallback((message) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ 
        type: "chat.message", 
        message,
        username: user?.username
      }));
    }
  }, [user?.username]);

  return { sendChat, socketRef };
}
