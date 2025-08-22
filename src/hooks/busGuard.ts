// hooks/busPrompt.ts
"use client";

import { useCallback } from "react";

export const msg = "궁금하신 버스 번호를 입력해주세요";

type Deps = {
  pushMessage: (m: { role: "bot" | "user"; text: string }) => void;
  setView: (v: "chat" | "map" | "localCurrency" | "bus") => void;
  // 선택: 입력창 포커스가 필요하면 넘겨주세요
  focusInput?: () => void;
};

export function useBusGuard({ pushMessage, setView, focusInput }: Deps) {
  return useCallback(() => {
    // 봇 메시지 출력
    pushMessage({ role: "bot", text: msg });

    // 채팅 뷰로 전환(지도가 떠있을 수 있으니 보장)
    setView("chat");

    // 선택: 입력창 포커스
    focusInput?.();
  }, [pushMessage, setView, focusInput]);
}
