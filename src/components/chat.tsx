// Chat.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { useChat } from "@/contexts/ChatContext";
import api from "@/lib/axios";

export default function Chat() {
  const [loading, setLoading] = useState(false);
  const { lastInput, messages, pushMessage, setLastInput } = useChat();

  //  이미 처리한 ID 인 경우 예외처리
  const handledIds = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!lastInput) return;
    
    const { id, text } = lastInput;

    if (handledIds.current.has(id)) return; // 이미 처리했으면 스킵
    
    handledIds.current.add(id);

    let aborted = false;
    (async () => {
      try {
        setLoading(true);
        const res = await api.post("/chatbot/ask", { userQuestion: text });
        if (aborted) return;

        const serverMessage = res?.data?.message ?? "(응답 없음)";
        pushMessage({ role: "bot", text: serverMessage });
      } catch (e) {
        if (!aborted) pushMessage({ role: "bot", text: "죄송해요, 다른 질문을 해주세요.." });
        console.error(e);
      } finally {
        if (!aborted) setLoading(false);

        // 같은 질문으로 다시 보내고 싶을 때를 대비해 lastInput 비워두기(선택)
        setLastInput(null);
      }
    })();

    return () => {
      aborted = true;
    };
  }, [lastInput, pushMessage, setLastInput]);

  return (
    <div className="w-full h-full">
      <div className="flex flex-col gap-2 p-3">
        {messages.length === 0 && !loading && (
          <div className="text-center text-gray-500">우리 동네 궁금증을 해소하세요!</div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[70%] px-3 py-2 rounded shadow text-sm ${
                m.role === "user"
                  ? "bg-blue-500 text-white rounded-br-none"
                  : "bg-gray-200 text-black rounded-bl-none"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {loading && <div className="text-center text-gray-400">챗봇이 질문 생성하는 중...</div>}
      </div>
    </div>
  );
}
