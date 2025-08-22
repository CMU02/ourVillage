// Body.tsx
"use client";

import Chat from "./chat";
import KakaoMap from "./kakaoMap";
import Bottom from "./footer";

import { useView } from "@/contexts/ViewContext";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

export default function Body() {
  const { view, setView } = useView();

  const panelRef = useRef<HTMLDivElement | null>(null);
  const [anim, setAnim] = useState<"none" | "up" | "down">("none");

  // map 모드 진입 시: 초기 상태 → 다음 프레임에 상승
  useLayoutEffect(() => {
    if (view !== "map") return;
    setAnim("none");
  }, [view]);

  useEffect(() => {
    if (view !== "map") return;
    const id = requestAnimationFrame(() => setAnim("up"));
    return () => cancelAnimationFrame(id);
  }, [view]);

  // ⬇️ 닫기: map이면 하강 애니메이션, 나머지는 즉시 chat 복귀
  const handleClose = useCallback(() => {
    if (view === "map") setAnim("down");
    else setView("chat");
  }, [view, setView]);

  const handleAnimationEnd = useCallback(() => {
    if (anim === "up") {
      // 지도가 비어 보일 때 레이아웃 재계산
      try { window.dispatchEvent(new Event("resize")); } catch {}
    }
    if (anim === "down") {
      setAnim("none");
      setView("chat");
    }
  }, [anim, setView]);

  switch (view) {
    case "map":
      // ✅ 애니메이션 패널은 map 케이스에서 렌더
      return (
        <div
          ref={panelRef}
          className={[
            "flex flex-1 min-h-0 flex-col w-full max-w-full",
            anim === "none" ? "panel-initial" : "",
            anim === "up"   ? "play-up"       : "",
            anim === "down" ? "play-down"     : "",
          ].join(" ")}
          onAnimationEnd={handleAnimationEnd}
        >
          <Bottom placement="inline" />
          <div className="flex-1 min-h-0 flex w-full max-w-full px-2 pb-3 md:px-[10px] md:pb-[15px]">
            <KakaoMap onClose={handleClose} />
          </div>
        </div>
      );

    case "localCurrency":
      return (
        <div className="flex flex-1 min-h-0 flex-col w/full max-w-full">
          <Chat />
          <Bottom placement="inline" />
          <div className="flex-1 min-h-0 px-2 pb-3 md:px-[10px] md:pb-[15px]">
            <KakaoMap onClose={handleClose} />
          </div>
        </div>
      );

    case "bus":
      return (
        <div className="flex flex-1 min-h-0 flex-col w/full max-w-full">
          <Chat />
          <Bottom placement="inline" />
          <div className="flex-1 min-h-0 px-2 pb-3 md:px-[10px] md:pb-[15px]">
            <KakaoMap onClose={handleClose} />
          </div>
        </div>
      );

    default:
      // ✅ 기본 CHAT 모드(지도 없음)
      return (
        <div className="h-full w-full max-w-full">
          <Chat />
        </div>
      );
  }
}
