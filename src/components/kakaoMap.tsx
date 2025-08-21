"use client";
import { useView } from "@/contexts/ViewContext";
import { Map, MapMarker } from "react-kakao-maps-sdk";

export default function KakaoMap() {
  const { view, setView } = useView();
  if (view !== "map") return null;

  return (
    <div className="relative w-full h-full">
      <button
        onClick={() => setView("chat")}
        className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white shadow-md hover:bg-green-600"
      >
        ✕
      </button>

      <Map
        className="rounded-[8px] drop-shadow"
        center={{ lat: 37.391378, lng: 126.956516 }}
        style={{ width: "100%", height: "100%" }}
        level={3}
      >
        <MapMarker position={{ lat: 37.391378, lng: 126.956516 }} />
      </Map>
    </div>
  );
}
