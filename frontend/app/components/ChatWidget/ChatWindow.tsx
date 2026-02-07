"use client";

import { useEffect } from "react";
import { useChatStore } from "@/app/store/chatStore";
import { useChat } from "@/app/hooks/useChat";
import { X } from "lucide-react";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";

export function ChatWindow() {
  const { isOpen, toggleOpen } = useChatStore();
  const { initializeSocket } = useChat();

  useEffect(() => {
    if (isOpen) initializeSocket();
  }, [isOpen, initializeSocket]);

  if (!isOpen) return null;

  const handleClose = () => toggleOpen();

  return (
    <div
      className="fixed bottom-24 right-6 z-40 flex h-[28rem] w-[22rem] flex-col overflow-hidden rounded-xl border border-primary-200 bg-white shadow-2xl sm:h-[32rem] sm:w-[24rem]"
      role="dialog"
      aria-label="Janela do chat"
    >
      <div className="flex items-center justify-between border-b border-primary-200 bg-primary-600 px-4 py-3 text-white">
        <h3 className="font-semibold">Chat de Suporte</h3>
        <button
          type="button"
          onClick={handleClose}
          className="rounded p-1 transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Fechar chat"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <MessageList />
      <MessageInput />
    </div>
  );
}
