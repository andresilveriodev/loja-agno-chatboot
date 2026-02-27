"use client";

import { useChatStore } from "@/app/store/chatStore";
import { MessageCircle } from "lucide-react";

export function ChatButton() {
  const { toggleOpen, messages } = useChatStore();
  const unreadFromBot = messages.filter((m) => m.sender === "bot").length;

  const handleClick = () => {
    toggleOpen();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleOpen();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--lm-green)] text-white shadow-lm-strong transition hover:scale-110 hover:bg-[var(--lm-green-dark)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--lm-green)]"
      aria-label="Abrir chat com assistente"
      tabIndex={0}
    >
      <MessageCircle className="h-7 w-7" aria-hidden />
      {unreadFromBot > 0 && (
        <span
          className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-white"
          aria-label={`${unreadFromBot} mensagens não lidas`}
        >
          {unreadFromBot > 9 ? "9+" : unreadFromBot}
        </span>
      )}
    </button>
  );
}
