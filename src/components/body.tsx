import Chat from "./chat";
import KakaoMap from "./kakaoMap";
import Bottom from "./footer";
import { useView } from "@/contexts/ViewContext";
import Modal from "./modal";

export default function Body() {
  const { view } = useView();

  if (view === "map") {
    return (
      <div className="flex flex-1 min-h-0 flex-col w-full max-w-full">
        {/* 상단 인라인 UI */}
        <Bottom placement="inline" />

        <div className="flex-1 min-h-0 flex w-full max-w-full px-2 pb-3 md:px-[10px] md:pb-[15px]">
          <KakaoMap />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full max-w-full">
      <Chat />
    </div>
  );
}
