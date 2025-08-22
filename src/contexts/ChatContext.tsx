// contexts/ChatContext.tsx
"use client";
import { createContext, useContext, useState, ReactNode } from "react";

type ChatMessage = {
  role: "user" | "bot";
  text: string;
};

type Question = {
    id: number;
    text: string
} | null;

type ChatCtx = {
  messages: ChatMessage[];
  pushMessage: (msg: ChatMessage) => void;

  lastInput: Question;
  setLastInput: (q: Question) => void;
};

const ChatContext = createContext<ChatCtx | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [lastInput, setLastInput] = useState<Question>(null);

  const pushMessage = (msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  };

  return (
    <ChatContext.Provider value={{ messages, pushMessage, lastInput, setLastInput }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within <ChatProvider>");
  return ctx;
}
