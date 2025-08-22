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

// 문자열만 받아서 '시/군' 기준 베이스를 뽑기
export function parseCityBase(cityRaw: string | null | undefined): string | null {
  const s = String(cityRaw ?? "").replace(/\s/g, "");
  if (!s) return null;

  // 이미 '시/군'으로 끝나면 그대로 반환 (예: 시흥시, 군포시, 성남시)
  if (/[시군]$/u.test(s)) return s;

  // '시/군' 뒤에 하위 행정구역(구/동/읍/면/리)이 오는 첫 지점까지 캡처
  //  예: 수원시장안구 → 수원시, 고양시일산서구 → 고양시
  const m = s.match(/^(.+?(?:시|군))(?=(?:[가-힣]{0,6})?(?:구|동|읍|면|리)|$)/u);
  if (m) return m[1];

  // 예외/희귀 케이스 대비: 마지막 '시/군'까지 자르기
  const lastSi = s.lastIndexOf("시");
  const lastGun = s.lastIndexOf("군");
  const last = Math.max(lastSi, lastGun);
  return last >= 0 ? s.slice(0, last + 1) : s || null;
}

// localStorage 연동 래퍼 (클라이언트 전용)
export function extractCityBase(storageKey = "userLocation"): string | null {
  try {
    if (typeof window === "undefined" || !("localStorage" in window)) return null;
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    const obj = JSON.parse(raw) as { city?: string | null };
    return parseCityBase(obj?.city);
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
