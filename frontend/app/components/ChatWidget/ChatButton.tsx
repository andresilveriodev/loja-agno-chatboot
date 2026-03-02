"use client";

import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "556281652486"; // +55 62 8165-2486
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

export function ChatButton() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--lm-green)] text-white shadow-lm-strong transition hover:scale-110 hover:bg-[var(--lm-green-dark)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--lm-green)]"
      aria-label="Conversar no WhatsApp: +55 62 8165-2486"
    >
      <MessageCircle className="h-7 w-7" aria-hidden />
    </a>
  );
}
