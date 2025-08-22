"use client";
import { CustomOverlayMap, Map, MapInfoWindow, MapMarker } from "react-kakao-maps-sdk";
import { useView } from "@/contexts/ViewContext";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { InfoWindow } from "@react-google-maps/api";

type Props = { onClose: () => void };

export const LOCAL_CURRENCY_ICON = "/icons/localCurrency.svg";
const BUS_ICON = "/icons/bus.svg";
const DEFAULT_CENTER = { lat: 37.405, lng: 126.932 };

// Deafult Center 값을 받는 로직
function isDefaultCenter(c?: { lat: number; lng: number } | null) {
  if (!c) return true;
  return Math.abs(c.lat - DEFAULT_CENTER.lat) < 1e-6 &&
          Math.abs(c.lng - DEFAULT_CENTER.lng) < 1e-6;
}

export default function KakaoMap({ onClose }: Props) {
  const { view, mapData, setMapData } = useView();
  const mapRef = useRef<kakao.maps.Map | null>(null);

  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const [userCenter, setUserCenter] = useState<{ lat: number; lng: number } | null>(null);

  // ✅ userLocationGeo(JSON)에서 좌표 읽기
  useEffect(() => {
    try {
      const raw = localStorage.getItem("userLocationGeo");
      if (!raw) return;

      let obj: any;
      try {
        obj = JSON.parse(raw);
      } catch {
        // 혹시 싱글쿼ote로 저장된 경우 대비
        obj = JSON.parse(raw.replace(/'/g, '"'));
      }

      const lat = obj?.lat_second_100 ? parseFloat(String(obj.lat_second_100)) : NaN;
      // 키 오타(logt)와 정식(lng) 둘 다 지원
      const lngCandidate = obj?.logt_second_100 ?? obj?.lng_second_100;
      const lng = lngCandidate ? parseFloat(String(lngCandidate)) : NaN;

      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        setUserCenter({ lat, lng });
      }
    } catch {}
  }, []);

  const hasMarkers = !!mapData?.markers?.length;

  // ✅ 마커가 없고 center가 기본값이면 userCenter를 컨텍스트 center로 승격
  useEffect(() => {
    if (!userCenter) return;
    if (hasMarkers) return;
    if (!isDefaultCenter(mapData?.center)) return;
    setMapData({ ...mapData, center: userCenter });
  }, [userCenter, hasMarkers, mapData, setMapData]);

  // 최종 center: (마커O → mapData.center) / (마커X → mapData.center(이미 승격됨) → userCenter → 기본값)
  const center = useMemo(() => {
    if (hasMarkers) return mapData!.center;
    return mapData?.center ?? userCenter ?? DEFAULT_CENTER;
  }, [hasMarkers, mapData?.center, userCenter]);

  // 마커 있을 때 bounds
  useEffect(() => {
    if (!hasMarkers) return;
    const map = mapRef.current;
    if (!map || !window.kakao) return;

    const bounds = new kakao.maps.LatLngBounds();
    mapData!.markers.forEach((m) => bounds.extend(new kakao.maps.LatLng(m.lat, m.lng)));
    if (mapData!.markers.length === 1) {
      map.setLevel(4);
      map.setCenter(new kakao.maps.LatLng(mapData!.markers[0].lat, mapData!.markers[0].lng));
    } else {
      map.setBounds(bounds);
    }
  }, [hasMarkers, mapData]);

  // 마커 없을 때 center 바뀌면 이동
  useEffect(() => {
    if (hasMarkers) return;
    const map = mapRef.current;
    if (!map || !window.kakao || !center) return;
    map.setCenter(new kakao.maps.LatLng(center.lat, center.lng));
  }, [center, hasMarkers]);

  // 지도 닫기 시 : 마커 초기화 및 userCenter 기준으로 리셋
  const resetMapData = useCallback(() => {
    const nextCenter = userCenter ?? DEFAULT_CENTER;
    setMapData({
      ...mapData,
      center: nextCenter,
      markers: [],    // Maerkers 초기화
      kind: mapData?.kind ?? "localCurrency",
    });

    // 현재 열린 맵에도 즉시 반영(선택)
    const map = mapRef.current;
    if (map && window.kakao) {
      map.setLevel(7);
      map.setCenter(new kakao.maps.LatLng(nextCenter.lat, nextCenter.lng));
    }
  }, [mapData, setMapData, userCenter]);

  const handleCloseClick = useCallback(() => {
    resetMapData();   // 먼저 상태 리셋
    onClose();        // 이후 상위(Body)의 닫기 로직 실행
  }, [resetMapData, onClose]);

  if (!(view === "map" || view === "localCurrency" || view === "bus")) return null;

  const iconSrc = mapData?.kind === "bus" ? BUS_ICON : LOCAL_CURRENCY_ICON;

  return (
    <div className="relative w-full h-full">
      <button
        onClick={handleCloseClick}
        className="absolute top-2 right-2 z-[9999] flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white shadow-md hover:bg-green-600"
        aria-label="close map"
      >
        ✕
      </button>

      <Map
        className="rounded-[8px] drop-shadow"
        center={center}
        isPanto
        style={{ width: "100%", height: "100%" }}
        level={7}
        onCreate={(map) => (mapRef.current = map)}
        onClick={() => setActiveIdx(null)}
      >
        {mapData?.markers?.map((m, i) => (
          <Fragment key={`${m.lat}-${m.lng}-${i}`}>
            <MapMarker
            position={{ lat: m.lat, lng: m.lng }}
            image={{
              src: iconSrc,
              size: { width: 40, height: 40 },
              options: { offset: { x: 20, y: 40 } },
            }}
            title={m.title ?? ""}
            onClick={() => {
              if(mapData.kind !== "bus"){
              {setActiveIdx(i)}}
            }}
            clickable={mapData.kind !=="bus"}
            />
              {activeIdx === i && (
                <CustomOverlayMap position={{ lat: m.lat, lng: m.lng }} yAnchor={0}>
                  <div className="w-64 rounded-lg bg-white shadow-lg overflow-hidden">


                    {/* 텍스트 영역 */}
                    <div className="p-2">
                      <div className="flex justify-start items-end">
                        <div className="font-bold text-base truncate">{m.title}</div>
                        <div className="px-1 text-gray-500 text-sm truncate">{m.industry}</div>
                      </div>
                      <div className="text-xs text-gray-600 truncate">{m.address}</div>
                    </div>

                  </div>
                </CustomOverlayMap>
              )}
          </Fragment>
        ))}
      </Map>
    </div>
  );
}
