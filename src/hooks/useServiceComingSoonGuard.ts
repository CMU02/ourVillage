// hooks/serviceComingSoonGuard.ts
"use client";

import { useCallback } from "react";

export const msg =
  "📌 더 많은 동네 서비스가 곧 제공될 예정이에요! \n · 1주일이내로 제공될 정보들 : 우리 동네 약국 정보, 우리 동네 버스 정류장 \n · 그 외에 다양한 정보들을 제공해드릴 예정입니다, 원하는 서비스가 있다면 말씀해 주세요 :) \n · 정보 예시: 쓰레기 배출 정보, 공공 와이파이 위치, 주민센터 운영시간 등";

type Deps = {
  pushMessage: (m: { role: "bot" | "user"; text: string }) => void;
  setView: (v: "chat" | "map" | "localCurrency" | "bus") => void;
  focusInput?: () => void;
};

export function useServiceComingSoonGuard({
  pushMessage,
  setView,
  focusInput,
}: Deps) {
  return useCallback(() => {
    pushMessage({ role: "bot", text: msg });
    setView("chat");
    focusInput?.();
  }, [pushMessage, setView, focusInput]);
}
