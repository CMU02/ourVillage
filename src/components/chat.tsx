// Chat.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@/contexts/ChatContext";
import { useView } from "@/contexts/ViewContext";
import { askChatBot } from "@/api/chatbot.api";

// 상위 5개 마커 평균값으로 center
function getCenterFromMarkers(markers: { lat: number; lng: number }[]) {
  if (!markers.length) return { lat: 37.405, lng: 126.932 };
  const topFive = markers.slice(0, 5);
  const sum = topFive.reduce(
    (acc, m) => ({ lat: acc.lat + m.lat, lng: acc.lng + m.lng }),
    { lat: 0, lng: 0 }
  );
  return { lat: sum.lat / topFive.length, lng: sum.lng / topFive.length };
}

export default function Chat() {
  const [loading, setLoading] = useState(false);

  const { lastInput, messages, pushMessage, setLastInput } = useChat();

  const { view, setView, setMapData, setIntent } = useView();

  // 중복 처리 방지
  const handledIds = useRef<Set<string | number>>(new Set());

  useEffect(() => {
    if (!lastInput) return;
    const { id, text } = lastInput;
    if (handledIds.current.has(id)) return;
    handledIds.current.add(id);

    let aborted = false;
    (async () => {
      try {
        setLoading(true);

        // 좌표 정보 가져오기 (날씨 관련 질문에 사용)
        let coords;
        if (typeof window !== "undefined") {
          const userLocationGeo = localStorage.getItem("userLocationGeo");
          if (userLocationGeo) {
            try {
              const geoData = JSON.parse(userLocationGeo);
              coords = {
                nx: geoData.grid_x,
                ny: geoData.grid_y
              };
            } catch (error) {
              console.error("좌표 정보 파싱 오류:", error);
            }
          }
        }

        const res = await askChatBot({
          userQuestion: text,
          options: coords ? { coords } : undefined
        });
        if (aborted) return;

        const serverMessage = res?.message ?? "(응답 없음)";
        pushMessage({ role: "bot", text: serverMessage });

        // console.log(serverMessage);   // 디버그용 코드

        // 각 질문 의도
        const intent = res?.meta?.intent;
        // console.log(intent);    // 디버그용 코드

        // 버스 데이터 관련
        if (intent === "bus") {
          const rawBuses = res?.meta?.busPositions ?? [];
          // console.log(rawBuses);    // 디버그용 코드
          const markers = (Array.isArray(rawBuses) ? rawBuses : [])
            .map((b: any) => {
              const lat = parseFloat(String(b?.gpsY)); // 위도
              const lng = parseFloat(String(b?.gpsX)); // 경도
              return {
                lat,
                lng,
                title: b?.vehId ?? "버스",
                meta: {
                  vehId: b?.vehId,
                  busType: b?.busType,
                  congetion: b?.congetion,
                  plainNo: b?.plainNo,
                  isFull: b?.isFullFlag === "1",
                  dataTm: b?.dataTm,
                },
              };
            })
            .filter((m) => Number.isFinite(m.lat) && Number.isFinite(m.lng));

          if (markers.length > 0) {
            const center = getCenterFromMarkers(markers);
            setMapData({ center, markers, kind: "bus" }); // kind는 선택(아이콘 분기 등에 사용)
            setView("bus");
          } else {
            // 좌표가 없으면 채팅으로 유지
            setView("chat");
          }
        }

        // 지도 데이터 후보
        else if (intent === "local_currency") {
          const rawStores = res?.meta?.topStores ?? [];
          // console.log(rawStores) // 디버그용 콘솔
          const markers = (Array.isArray(rawStores) ? rawStores : [])
            .map((s: any) => ({
              lat: parseFloat(String(s.lat)),
              lng: parseFloat(String(s.lng)),
              title: s?.name,
              address: s?.address,
              industry: s?.industry,
            }))
            .filter((m) => Number.isFinite(m.lat) && Number.isFinite(m.lng));

          const center = getCenterFromMarkers(markers);
          setMapData({ center, markers, kind: "localCurrency" });
          setView("localCurrency");
        } else {
          setView("chat");
        }
      } catch (e) {
        if (!aborted) pushMessage({ role: "bot", text: "죄송해요, 다른 질문을 해주세요.." });
        console.error(e);
      } finally {
        if (!aborted) setLoading(false);
        setLastInput(null); // 재전송 대비 초기화
        setIntent("general");
      }
    })();

    return () => {
      aborted = true;
    };
  }, [lastInput, pushMessage, setLastInput, setView, setMapData]);

  // ===== 요약(최근 1줄) 계산 + 로딩표시 여부 =====
  const { lastUser, lastBot, waiting } = useMemo(() => {
    let u: string | undefined;
    let b: string | undefined;
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (!u && m.role === "user") u = m.text;
      if (!b && m.role === "bot") b = m.text;
      if (u && b) break;
    }
    const last = messages[messages.length - 1];
    return {
      lastUser: u ?? "질문을 입력해 보세요!",
      lastBot: b ?? "답변이 여기에 표시됩니다.",
      waiting: !!last && last.role === "user",
    };
  }, [messages]);

  // ===== 뷰별 렌더 =====
  if (view === "localCurrency") {
    return (
      <div className="w-full backdrop-blur px-3 py-2">
        <div className="flex flex-col gap-1 text-sm">
          <div className="flex justify-end">
            <div className="max-w-[80%] px-3 py-1 rounded bg-blue-500 text-white">
              {lastUser}
            </div>
          </div>
          <div className="flex justify-start">
            <div className="max-w-[80%] px-3 py-1 rounded bg-gray-200 text-gray-900">
              {lastBot}
            </div>
          </div>
          {(waiting || loading) && (
            <div className="text-center text-gray-400 mt-1" aria-live="polite">
              챗봇이 질문 생성하는 중...
            </div>
          )}
        </div>
      </div>
    );
  }

  if (view === "bus") {
    return (
      <div className="w-full backdrop-blur px-3 py-2">
        <div className="flex flex-col gap-1 text-sm">
          <div className="flex justify-end">
            <div className="max-w-[80%] px-3 py-1 rounded bg-blue-500 text-white">
              {lastUser}
            </div>
          </div>
          <div className="flex justify-start">
            <div className="max-w-[80%] px-3 py-1 rounded bg-gray-200 text-gray-900">
              {lastBot}
            </div>
          </div>
          {(waiting || loading) && (
            <div className="text-center text-gray-400 mt-1" aria-live="polite">
              챗봇이 질문 생성하는 중...
            </div>
          )}
        </div>
      </div>
    );
  }

  // map / chat 기본 목록 렌더 (map일 땐 Body에서 지도가 옆/아래에 표시됨)
  return (
    <div className="w-full h-full">
      <div className="flex flex-col gap-2 p-3">
        {messages.length === 0 && !loading && (
          <div className="text-center text-gray-500">
            우리 동네 궁금증을 해소하세요!
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] px-3 py-2 rounded shadow text-sm ${m.role === "user"
                ? "bg-blue-500 text-white rounded-br-none"
                : "bg-gray-200 text-black rounded-bl-none"
                }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="text-center text-gray-400">
            챗봇이 질문 생성하는 중...
          </div>
        )}
      </div>
    </div>
  );
}
