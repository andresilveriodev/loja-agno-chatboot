"use client";

import { useEffect, useRef } from "react";
import { useChatStore } from "@/app/store/chatStore";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";

export function MessageList() {
  const { messages, isLoading } = useChatStore();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {messages.length === 0 && !isLoading && (
        <p className="text-center text-sm text-primary-500 py-4">
          Olá! Como posso ajudar? Pergunte sobre produtos ou peça uma cotação.
        </p>
      )}
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      {isLoading && <TypingIndicator />}
      <div ref={endRef} aria-hidden />
    </div>
  );
}
