"use client";

import { useCallback } from "react";
import { io, type Socket } from "socket.io-client";
import { useChatStore, generateSessionId } from "@/app/store/chatStore";

let socket: Socket | null = null;
let listenerAttached = false;

function getSocket(): Socket {
  const wsUrl =
    typeof process !== "undefined" && process.env.NEXT_PUBLIC_WS_URL
      ? process.env.NEXT_PUBLIC_WS_URL
      : "http://localhost:3001";
  if (!socket) {
    socket = io(wsUrl, { autoConnect: true, reconnection: true });
  }
  return socket;
}

export function useChat() {
  const { addMessage, setLoading, setSessionId } = useChatStore();

  const ensureSessionId = useCallback(() => {
    let sid = useChatStore.getState().sessionId;
    if (!sid) {
      sid = generateSessionId();
      setSessionId(sid);
    }
    return sid;
  }, [setSessionId]);

  const initializeSocket = useCallback(() => {
    const s = getSocket();
    if (listenerAttached) return;
    listenerAttached = true;

    s.on("message", (data: { sender?: string; content?: string }) => {
      const { addMessage: add, setLoading: setLoad } = useChatStore.getState();
      add({
        id: `bot-${Date.now()}`,
        sender: "bot",
        content: data?.content ?? "Resposta recebida.",
        timestamp: new Date(),
      });
      setLoad(false);
    });

    s.on("connect_error", () => {
      useChatStore.getState().setLoading(false);
    });
  }, []);

  const sendMessage = useCallback(
    (content: string) => {
      const text = content.trim();
      if (!text) return;

      const sid = ensureSessionId();
      addMessage({
        id: `user-${Date.now()}`,
        sender: "user",
        content: text,
        timestamp: new Date(),
      });
      setLoading(true);

      initializeSocket();
      const s = getSocket();
      s.emit("message", { sessionId: sid, content: text });
    },
    [addMessage, setLoading, ensureSessionId, initializeSocket],
  );

  return { sendMessage, initializeSocket };
}
