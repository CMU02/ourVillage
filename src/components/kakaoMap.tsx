"use client";

import { useView } from "@/contexts/ViewContext";
import { Map, MapMarker } from "react-kakao-maps-sdk";

const LOCAL_CURRENCY_ICON = "/icons/localCurrency.svg";

export default function KakaoMap() {
  const { view, setView } = useView();
  if (view !== "map") return null;

  const center = { lat: 37.405, lng: 126.932 };

  // 차후 백엔드에서 받아오는 마커 위치에 따라 MAP 돌리기
  const markerPos = { lat: 37.405, lng: 126.932 };

  return (
    <div className="relative w-full h-full">
      {/* 닫기 버튼 */}
      <button
        onClick={() => setView("chat")}
        className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white shadow-md hover:bg-green-600"
      >
        ✕
      </button>

      {/* 지도 */}
      <Map
        className="rounded-[8px] drop-shadow"
        center={center}
        style={{ width: "100%", height: "100%" }}
        level={3}
      >
        {/* 커스텀 이미지 마커 */}
        <MapMarker
          position={markerPos}
          image={{
            src: LOCAL_CURRENCY_ICON,              // 마커 이미지 경로
            size: { width: 50, height: 50 },       // kakao.maps.Size
            options: { offset: { x: 27, y: 69 } }, // kakao.maps.Point
          }}
        />
      </Map>
    </div>
  );
}
