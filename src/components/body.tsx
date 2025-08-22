// Body.tsx
"use client";

import Chat from "./chat";
import KakaoMap from "./kakaoMap";
import Bottom from "./footer";
import { useView } from "@/contexts/ViewContext";

export default function Body() {
  const { view } = useView();

  if (view === "map") {
    return (
      <div className="flex flex-1 min-h-0 flex-col w-full max-w-full">
        <Bottom placement="inline" />

        <div className="flex-1 min-h-0 flex w-full max-w-full px-2 pb-3 md:px-[10px] md:pb-[15px]">
          <KakaoMap />
        </div>
      </div>
    );
  }

  if (view === "localCurrency") {
    return (
      <div className="flex flex-1 min-h-0 flex-col w-full max-w-full">
        {/* ✅ Chat: localCurrency일 때 요약 1줄 렌더 */}
        <Chat />

        {/* 인라인 입력창 */}
        <Bottom placement="inline" />

        {/* 지도: 남는 높이 전체 */}
        <div className="flex-1 min-h-0 px-2 pb-3 md:px-[10px] md:pb-[15px]">
          <KakaoMap />
        </div>
      </div>
    );
  }

  if (view === "bus") {
    return (
      <div className="flex flex-1 min-h-0 flex-col w-full max-w-full">
        {/* ✅ Chat: bus 때 요약 1줄 렌더 */}
        <Chat />

        {/* 인라인 입력창 */}
        <Bottom placement="inline" />

        {/* 지도: 남는 높이 전체 */}
        <div className="flex-1 min-h-0 px-2 pb-3 md:px-[10px] md:pb-[15px]">
          <KakaoMap />
        </div>
      </div>
    );
  }

  // 기본 CHAT 모드
  return (
    <div className="h-full w-full max-w-full">
      <Chat />
    </div>
  );
}
