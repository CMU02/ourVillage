"use client";
import { CustomOverlayMap, Map, MapMarker } from "react-kakao-maps-sdk";
import { useView } from "@/contexts/ViewContext";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";

type Props = { onClose: () => void };

export const LOCAL_CURRENCY_ICON = "/icons/localCurrency.svg";
const BUS_ICON = "/icons/bus.svg";
const DEFAULT_CENTER = { lat: 37.405, lng: 126.932 };

// 기본 Center 값 계산을 위한 기능
function isDefaultCenter(c?: { lat: number; lng: number } | null) {
  if (!c) return true;
  return Math.abs(c.lat - DEFAULT_CENTER.lat) < 1e-6 &&
         Math.abs(c.lng - DEFAULT_CENTER.lng) < 1e-6;
}

// dataTm 문자열을 "YYYYMMDDHHMMSS" → "YYYY년 MM월 DD일 HH:MM:SS" 로 변환하는 기능
function formatDataTm(dataTm?: string) {
  if (!dataTm || dataTm.length !== 14) return dataTm ?? "";
  const year = dataTm.slice(0, 4);
  const month = dataTm.slice(4, 6);
  const day = dataTm.slice(6, 8);
  const hour = dataTm.slice(8, 10);
  const minute = dataTm.slice(10, 12);
  const second = dataTm.slice(12, 14);
  return `${year}년 ${month}월 ${day}일 ${hour}:${minute}:${second}`;
}

export default function KakaoMap({ onClose }: Props) {
  const { view, mapData, setMapData } = useView();
  const mapRef = useRef<kakao.maps.Map | null>(null);

  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [userCenter, setUserCenter] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("userLocationGeo");
      if (!raw) return;

      let obj: any;
      try { obj = JSON.parse(raw); } catch { obj = JSON.parse(raw.replace(/'/g, '"')); }

      const lat = obj?.lat_second_100 ? parseFloat(String(obj.lat_second_100)) : NaN;
      const lngCandidate = obj?.logt_second_100 ?? obj?.lng_second_100;
      const lng = lngCandidate ? parseFloat(String(lngCandidate)) : NaN;

      if (Number.isFinite(lat) && Number.isFinite(lng)) setUserCenter({ lat, lng });
    } catch {}
  }, []);

  const hasMarkers = !!mapData?.markers?.length;

  useEffect(() => {
    if (!userCenter || hasMarkers || !isDefaultCenter(mapData?.center)) return;
    setMapData({ ...mapData, center: userCenter });
  }, [userCenter, hasMarkers, mapData, setMapData]);

  const center = useMemo(() => {
    if (hasMarkers) return mapData!.center;
    return mapData?.center ?? userCenter ?? DEFAULT_CENTER;
  }, [hasMarkers, mapData?.center, userCenter]);

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

  useEffect(() => {
    if (hasMarkers) return;
    const map = mapRef.current;
    if (!map || !window.kakao || !center) return;
    map.setCenter(new kakao.maps.LatLng(center.lat, center.lng));
  }, [center, hasMarkers]);

  const resetMapData = useCallback(() => {
    const nextCenter = userCenter ?? DEFAULT_CENTER;
    setMapData({
      ...mapData,
      center: nextCenter,
      markers: [],
      kind: mapData?.kind ?? "localCurrency",
    });

    const map = mapRef.current;
    if (map && window.kakao) {
      map.setLevel(7);
      map.setCenter(new kakao.maps.LatLng(nextCenter.lat, nextCenter.lng));
    }
  }, [mapData, setMapData, userCenter]);

  const handleCloseClick = useCallback(() => {
    resetMapData();
    onClose();
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
        {mapData?.markers?.map((m: any, i: number) => (
          <Fragment key={`${m.lat}-${m.lng}-${i}`}>
            <MapMarker
              position={{ lat: m.lat, lng: m.lng }}
              image={{
                src: iconSrc,
                size: { width: 40, height: 40 },
                options: { offset: { x: 20, y: 40 } },
              }}
              title={m.title ?? ""}
              onClick={() => setActiveIdx(i)}
              // 만약 버스는 완전 비활성으로 하려면 아래 주석 해제
              // clickable={mapData.kind !== "bus"}
            />
            {activeIdx === i && (
              <CustomOverlayMap position={{ lat: m.lat, lng: m.lng }} yAnchor={0}>
                <div className="w-64 rounded-lg bg-white shadow-lg overflow-hidden">
                  {/* ✅ 종류별로 다른 내용 렌더 */}
                  {mapData.kind !== "bus" ? (
                    <div className="p-2">
                      <div className="flex justify-start items-end gap-1">
                        <div className="font-bold text-base truncate">{m.title}</div>
                        <div className="px-1 text-gray-500 text-sm truncate">{m.industry}</div>
                      </div>
                      <div className="text-xs text-gray-600 truncate">{m.address}</div>
                      
                    </div>
                  ) : (
                    <div className="p-2">
                      <div className="font-bold text-base truncate">
                        {m.meta?.plainNo ? `버스: ${m.meta.plainNo}` : null}
                      </div>
                      <div className="text-xs text-gray-600">
                        {m.meta?.busType ? `유형: ${m.meta.busType}` : null}
                      </div>
                      <div className="text-xs text-gray-600">
                        {m.meta?.congetion ? `혼잡도: ${m.meta.congetion}` : null}
                      </div>
                      <div className="text-xs text-gray-600">
                        {m.meta?.dataTm ? `수신: ${formatDataTm(m.meta.dataTm)}` : null}
                      </div>
                    </div>
                  )}
                </div>
              </CustomOverlayMap>
            )}
          </Fragment>
        ))}
      </Map>
    </div>
  );
}
