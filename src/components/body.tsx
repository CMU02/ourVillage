import Chat from "./chat";
import KakaoMap from "./kakaoMap";
import Bottom from "./footer";
import { useView } from "@/contexts/ViewContext";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
} from "react";

export default function Body() {
  const { view, setView } = useView();
  const panelRef = useRef<HTMLDivElement | null>(null);

  // 애니메이션 상태: none | up | down
  const [anim, setAnim] = useState<"none" | "up" | "down">("none");

  // map 모드 진입 시: 초기 상태는 하단(panel-initial) → 다음 프레임에 play-up
  useLayoutEffect(() => {
    if (view !== "map") return;
    setAnim("none"); // 안전 초기화
  }, [view]);

  useEffect(() => {
    if (view !== "map") return;
    // 첫 프레임: panel-initial만 적용됨
    const id = requestAnimationFrame(() => setAnim("up")); // 다음 프레임에 애니메이션 시작
    return () => cancelAnimationFrame(id);
  }, [view]);

  const handleClose = useCallback(() => {
    setAnim("down"); // 아래로 내려가는 애니메이션 시작
  }, []);

  const handleAnimationEnd = useCallback(() => {
    if (anim === "up") {
      // 올라온 직후 지도가 빈 화면이면 resize 이벤트로 강제 리레이아웃
      try {
        window.dispatchEvent(new Event("resize"));
      } catch {}
    }
    if (anim === "down") {
      setAnim("none");
      setView("chat"); // 내려간 뒤에만 chat으로 복귀(언마운트)
    }
  }, [anim, setView]);

  if (view !== "map") {
    return (
      <div className="h-full w-full max-w-full">
        <Chat />
      </div>
    );
  }

  // ✅ 기존 컨테이너 그대로 사용: 여기에만 클래스 부여
  return (
    <div
      ref={panelRef}
      className={[
        "flex flex-1 min-h-0 flex-col w-full max-w-full",
        // 첫 프레임에는 하단 대기(잔상 방지)
        anim === "none" ? "panel-initial" : "",
        // 두 번째 프레임부터 상승
        anim === "up" ? "play-up" : "",
        // 닫기 시 하강
        anim === "down" ? "play-down" : "",
      ].join(" ")}
      onAnimationEnd={handleAnimationEnd}
    >
      {/* 상단 인라인 UI (footer와 map 함께 이동) */}
      <Bottom placement="inline" />

      {/* 지도 */}
      <div className="flex-1 min-h-0 flex w-full max-w-full px-2 pb-3 md:px-[10px] md:pb-[15px]">
        <KakaoMap onClose={handleClose} />
      </div>
    </div>
  );
}
