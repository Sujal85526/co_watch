import { useEffect, useRef, useCallback, useState } from "react";
import { useAuth } from "./useAuth.jsx";

export function useWebSocket(roomCode, onMessage) {  // ADD onMessage param
  const socketRef = useRef(null);
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!roomCode) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//localhost:8000/ws/room/${roomCode}/`;

    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WS connected");
      setIsConnected(true);
      // Send join message
      socket.send(JSON.stringify({
        type: "join",
        username: user?.username
      }));
    };

    socket.onmessage = (event) => {
      if (onMessage) onMessage(event);  // CALL THE HANDLER
    };

    socket.onclose = () => {
      console.log("WS closed");
      setIsConnected(false);
    };

    socket.onerror = (e) => console.error("WS error", e);

    return () => socket.close();
  }, [roomCode, user?.username, onMessage]);

  const sendChat = useCallback((message) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ 
        type: "chat_message",  // CHANGED from "chat.message"
        message,
        username: user?.username
      }));
    }
  }, [user?.username]);

  return { sendChat, socketRef, isConnected };
}
