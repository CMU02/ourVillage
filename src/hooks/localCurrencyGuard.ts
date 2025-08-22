"use client";

import { useCallback } from "react";

// 차후 안내되는 메시지는 UI 에 따라 업데이트
export const msg = "현재 경기도만 서비스 지원중입니다..";

type Deps = {
  pushMessage: (m: { role: "bot" | "user"; text: string }) => void;
  setLastInput: (v: { id: number; text: string }) => void;
  setView: (v: "chat" | "map" | "localCurrency" | "bus") => void;
  storageKey?: string;
  /* 봇 응답 전까지 chat에 고정할지 (기본 true) */
  stayInChatUntilBot?: boolean;
};

function isGyeonggi(storageKey = "userLocation"): boolean {
  try {
    // LocalStorage에서 userLocaiton 정보를 가져옴
    const raw = localStorage.getItem(storageKey);
    if (!raw) return false;

    const obj = JSON.parse(raw);
    // 서울특별시 등 제외하고 경기도만
    const province = String(obj?.province ?? "").replace(/\s/g, "");

    return /^(경기|경기도)$/u.test(province);

  } catch {
    return false;
  }
}

function extractCityBase(storageKey = "userLocation"): string | null {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    const rawCity = String(obj?.city ?? "").replace(/\s/g, "");
    if (!rawCity) return null;
    const m = rawCity.match(/^(.*?(시|군))/u);
    return m ? m[1] : rawCity;
  } catch {
    return null;
  }
}

export function useLocalCurrencyGuard({
  pushMessage,
  setLastInput,
  setView,
  storageKey,
  stayInChatUntilBot = true,
}: Deps) {
  return useCallback(() => {
    const ok = isGyeonggi(storageKey);
    if (!ok) {
      pushMessage({ role: "bot", text: msg });
      setView("chat");
      return;
    }

    const city = extractCityBase(storageKey) ?? "경기도";
    const q = `${city} 지역화폐 가맹점 알려줘`;

    // 사용자 메시지 큐잉 Chat.tsx 에서 서버에 요청
    pushMessage({ role: "user", text: q });
    setLastInput({ id: Date.now(), text: q });

    // 봇 응답 전까지는 CHAT에 고정
    if (stayInChatUntilBot) {
      setView("chat");
    } else {
      // 즉시 전환하고 싶을 때만 사용
      setView("localCurrency");
    }
  }, [pushMessage, setLastInput, setView, storageKey, stayInChatUntilBot]);
}
