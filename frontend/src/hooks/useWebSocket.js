import { useEffect, useRef, useCallback, useState } from "react";
import { useAuth } from "./useAuth.jsx";


export function useWebSocket(roomCode, onMessage) {
  const socketRef = useRef(null);
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);


  useEffect(() => {
    if (!roomCode) return;


    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = import.meta.env.VITE_WS_URL.replace(/^https?:/, protocol);  
    const finalUrl = `${wsUrl}/ws/room/${roomCode}/`;  


    const socket = new WebSocket(finalUrl);  
    socketRef.current = socket;


    socket.onopen = () => {
      console.log("WS connected");
      setIsConnected(true);
      socket.send(JSON.stringify({
        type: "join",
        username: user?.username
      }));
    };


    socket.onmessage = (event) => {
      if (onMessage) onMessage(event);
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
        type: "chat_message",
        message,
        username: user?.username
      }));
    }
  }, [user?.username]);


  return { sendChat, socketRef, isConnected };
}
