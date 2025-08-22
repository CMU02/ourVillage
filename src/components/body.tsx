"use client";

import Chat from "./chat";
import KakaoMap from "./kakaoMap";
import Bottom from "./footer";

import { useView } from "@/contexts/ViewContext";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useMemo,
} from "react";

export default function Body() {
  const { view, setView } = useView();

  // 애니메이션 대상 뷰 / Chat을 위에 고정해야 하는 뷰
  const ANIM_VIEWS = useMemo(
    () => new Set(["map", "bus", "localCurrency"]),
    []
  );
  const CHAT_ABOVE_VIEWS = useMemo(() => new Set(["bus", "localCurrency"]), []);

  const panelRef = useRef<HTMLDivElement | null>(null);
  const [anim, setAnim] = useState<"none" | "up" | "down">("none");

  // 애니메이션 초기화
  useLayoutEffect(() => {
    if (!ANIM_VIEWS.has(view as string)) return;
    setAnim("none");
  }, [view, ANIM_VIEWS]);

  useEffect(() => {
    if (!ANIM_VIEWS.has(view as string)) return;
    const id = requestAnimationFrame(() => setAnim("up"));
    return () => cancelAnimationFrame(id);
  }, [view, ANIM_VIEWS]);

  const handleClose = useCallback(() => {
    if (ANIM_VIEWS.has(view as string)) setAnim("down");
    else setView("chat");
  }, [view, setView, ANIM_VIEWS]);

  const handleAnimationEnd = useCallback(() => {
    if (anim === "up") {
      try {
        window.dispatchEvent(new Event("resize"));
      } catch {}
    }
    if (anim === "down") {
      setAnim("none");
      setView("chat");
    }
  }, [anim, setView]);

  // 공용 애니메이션 패널
  const AnimatedPanel: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => (
    <div
      ref={panelRef}
      className={[
        "flex flex-1 min-h-0 flex-col w-full max-w-full",
        anim === "none" ? "panel-initial" : "",
        anim === "up" ? "play-up" : "",
        anim === "down" ? "play-down" : "",
      ].join(" ")}
      onAnimationEnd={handleAnimationEnd}
    >
      {children}
    </div>
  );

  // Bottom + Map을 하나로 묶어 재사용
  const MapArea = (
    <>
      <Bottom placement="inline" />
      <div className="flex-1 min-h-0 px-2 pb-3 md:px-[10px] md:pb-[15px]">
        <KakaoMap onClose={handleClose} />
      </div>
    </>
  );

  // 뷰별 레이아웃 스위치 (중복 최소화)
  if (view === "map") {
    // 전체가 애니메이션
    return <AnimatedPanel>{MapArea}</AnimatedPanel>;
  }

  if (CHAT_ABOVE_VIEWS.has(view as string)) {
    // Chat은 고정, MapArea만 애니메이션
    return (
      <div className="flex flex-1 min-h-0 flex-col w-full max-w-full">
        <Chat />
        <AnimatedPanel>{MapArea}</AnimatedPanel>
      </div>
    );
  }

  // 기본 Chat 전용
  return (
    <div className="h-full w-full max-w-full">
      <Chat />
    </div>
  );
}
