"use client";

import { useState } from "react";
import { useChat } from "@/app/hooks/useChat";
import { Send } from "lucide-react";

export function MessageInput() {
  const [input, setInput] = useState("");
  const { sendMessage } = useChat();

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    sendMessage(text);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-primary-200 bg-white p-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua mensagem..."
          className="flex-1 rounded-lg border border-primary-200 px-4 py-2.5 text-sm text-primary-900 placeholder:text-primary-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          aria-label="Mensagem do chat"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!input.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-white transition hover:bg-primary-700 disabled:opacity-50 disabled:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          aria-label="Enviar mensagem"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
