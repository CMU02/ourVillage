"use client";
import { Map, MapMarker } from "react-kakao-maps-sdk";
import { useView } from "@/contexts/ViewContext";
import { useEffect, useRef } from "react";

type Props = { onClose: () => void };

export const LOCAL_CURRENCY_ICON = "/icons/localCurrency.svg";
const BUS_ICON = "/icons/bus.svg";

export default function KakaoMap({ onClose }: Props) {
  const { view, setView, mapData } = useView();
  const mapRef = useRef<kakao.maps.Map | null>(null);

  // 마커 모두 보이게 bounds 맞추기
  useEffect(() => {
    if (!mapData?.markers?.length) return;
    const map = mapRef.current;
    if (!map || !window.kakao) return;

    const bounds = new kakao.maps.LatLngBounds();
    mapData.markers.forEach((m) => {
      bounds.extend(new kakao.maps.LatLng(m.lat, m.lng));
    });

    // 마커가 1개면 센터/레벨, 여러 개면 bounds
    if (mapData.markers.length === 1) {
      map.setLevel(4);
      map.setCenter(new kakao.maps.LatLng(mapData.markers[0].lat, mapData.markers[0].lng));
    } else {
      map.setBounds(bounds);
      // map.setBounds(bounds, 32, 32, 32, 32);
    }
  }, [mapData]);

  if (!(view === "map" || view === "localCurrency" || view === "bus")) return null;

  // 아이콘 분기
  const iconSrc =
    mapData?.kind === "bus" ? BUS_ICON : LOCAL_CURRENCY_ICON;

  return (
    <div className="relative w-full h-full">
      {/* 닫기 버튼 */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white shadow-md hover:bg-green-600"
        aria-label="close map"
      >
        ✕
      </button>

      <Map
        className="rounded-[8px] drop-shadow"
        center={mapData?.center ?? { lat: 37.405, lng: 126.932 }}
        style={{ width: "100%", height: "100%" }}
        level={7}
        onCreate={(map) => (mapRef.current = map)} 
      >
        {mapData?.markers?.map((m, i) => (
          <MapMarker
            key={i}
            position={{ lat: m.lat, lng: m.lng }}
            image={{
              src: iconSrc,                       
              size: { width: 40, height: 40 },
              options: { offset: { x: 20, y: 40 } },
            }}
            title={m.title ?? ""}               
          />
        ))}
      </Map>
    </div>
    );
}

