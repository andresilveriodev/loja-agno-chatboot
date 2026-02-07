import { create } from "zustand";
import type { ChatMessage } from "@/lib/types";

interface ChatStore {
  messages: ChatMessage[];
  isOpen: boolean;
  isLoading: boolean;
  sessionId: string;
  addMessage: (message: ChatMessage) => void;
  toggleOpen: () => void;
  setOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  setSessionId: (id: string) => void;
}

function generateSessionId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isOpen: false,
  isLoading: false,
  sessionId: "",
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  setOpen: (open) => set({ isOpen: open }),
  setLoading: (loading) => set({ isLoading: loading }),
  setSessionId: (id) => set({ sessionId: id }),
}));

export { generateSessionId };
