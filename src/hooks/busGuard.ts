// hooks/busPrompt.ts
"use client";

import { useCallback } from "react";

export const msg =
  "🚌 우리 동네 챗봇은 아래의 서울시 버스 정보 데이터를 제공합니다. \n 1. 실시간 버스 위치 \n 2. 해당 버스번호 \n 3. 해당 버스의 혼잡도 \n - 궁금하신 버스의 번호와 정보를 제공해달라고 요청해보세요!";

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
